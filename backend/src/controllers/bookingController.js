const db = require('../data/db');

exports.getAllBookings = async (req, res) => {
  const { status, labId, userId, dosenId, date, search } = req.query;

  try {
    let bookings = [];
    if (db.isConnected && db.pool) {
      let sql = 'SELECT * FROM `bookings` WHERE 1=1';
      const params = [];

      // Role check
      if (req.user) {
        if (req.user.role === 'mahasiswa') {
          sql += ' AND user_id = ?';
          params.push(req.user.id);
        } else if (req.user.role === 'dosen') {
          sql += ' AND (dosen_id = ? OR user_id = ?)';
          params.push(req.user.id, req.user.id);
        }
      }

      if (userId) {
        sql += ' AND user_id = ?';
        params.push(userId);
      }
      if (dosenId) {
        sql += ' AND dosen_id = ?';
        params.push(dosenId);
      }
      if (labId && labId !== 'all') {
        sql += ' AND lab_id = ?';
        params.push(labId);
      }
      if (status && status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (date) {
        sql += ' AND date = ?';
        params.push(date);
      }
      if (search) {
        sql += ' AND (LOWER(user_name) LIKE ? OR LOWER(COALESCE(user_nim, \'\')) LIKE ? OR LOWER(lab_name) LIKE ? OR LOWER(purpose) LIKE ? OR LOWER(booking_code) LIKE ?)';
        const q = `%${search.toLowerCase()}%`;
        params.push(q, q, q, q, q);
      }

      sql += ' ORDER BY created_at DESC';

      const [rows] = await db.pool.query(sql, params);
      bookings = rows.map(b => ({
        ...b,
        bookingCode: b.booking_code,
        userId: b.user_id,
        userName: b.user_name,
        userNim: b.user_nim,
        userJurusan: b.user_jurusan,
        userPhone: b.user_phone,
        labId: b.lab_id,
        labName: b.lab_name,
        timeSlot: b.time_slot,
        participantsCount: b.participants_count,
        dosenId: b.dosen_id,
        dosenName: b.dosen_name,
        equipments: typeof b.equipments === 'string' ? JSON.parse(b.equipments || '[]') : b.equipments || [],
        dosenNotes: b.dosen_notes,
        adminNotes: b.admin_notes,
        qrCodeData: b.qr_code_data,
        createdAt: b.created_at,
        checkedInAt: b.checked_in_at,
        completedAt: b.completed_at
      }));
    } else {
      const jsonDb = db.getJsonDb();
      bookings = [...jsonDb.bookings];

      if (req.user) {
        if (req.user.role === 'mahasiswa') {
          bookings = bookings.filter(b => b.userId === req.user.id);
        } else if (req.user.role === 'dosen') {
          bookings = bookings.filter(b => b.dosenId === req.user.id || b.userId === req.user.id);
        }
      }

      if (userId) bookings = bookings.filter(b => b.userId === userId);
      if (dosenId) bookings = bookings.filter(b => b.dosenId === dosenId);
      if (labId && labId !== 'all') bookings = bookings.filter(b => b.labId === labId);
      if (status && status !== 'all') bookings = bookings.filter(b => b.status === status);
      if (date) bookings = bookings.filter(b => b.date === date);

      if (search) {
        const q = search.toLowerCase();
        bookings = bookings.filter(b =>
          (b.userName && b.userName.toLowerCase().includes(q)) ||
          (b.userNim && b.userNim.toLowerCase().includes(q)) ||
          (b.labName && b.labName.toLowerCase().includes(q)) ||
          (b.purpose && b.purpose.toLowerCase().includes(q)) ||
          (b.bookingCode && b.bookingCode.toLowerCase().includes(q))
        );
      }

      bookings.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    }

    return res.json({ success: true, data: bookings, count: bookings.length });
  } catch (err) {
    console.error('getAllBookings error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data peminjaman.' });
  }
};

exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    let booking = null;
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT * FROM `bookings` WHERE `id` = ? OR `booking_code` = ?', [id, id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan.' });
      }
      const b = rows[0];
      booking = {
        ...b,
        bookingCode: b.booking_code,
        userId: b.user_id,
        userName: b.user_name,
        userNim: b.user_nim,
        userJurusan: b.user_jurusan,
        userPhone: b.user_phone,
        labId: b.lab_id,
        labName: b.lab_name,
        timeSlot: b.time_slot,
        participantsCount: b.participants_count,
        dosenId: b.dosen_id,
        dosenName: b.dosen_name,
        equipments: typeof b.equipments === 'string' ? JSON.parse(b.equipments || '[]') : b.equipments || [],
        dosenNotes: b.dosen_notes,
        adminNotes: b.admin_notes,
        qrCodeData: b.qr_code_data
      };
    } else {
      const jsonDb = db.getJsonDb();
      booking = jsonDb.bookings.find(b => b.id === id || b.bookingCode === id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan.' });
      }
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    console.error('getBookingById error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail peminjaman.' });
  }
};

exports.createBooking = async (req, res) => {
  const {
    labId,
    date,
    session,
    timeSlot,
    purpose,
    category,
    dosenId,
    equipments,
    participantsCount,
    contactPhone
  } = req.body;

  if (!labId || !date || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Laboratorium, Tanggal, dan Keperluan peminjaman wajib diisi.'
    });
  }

  try {
    let lab = null;
    let conflict = null;
    let dosenName = '';

    if (db.isConnected && db.pool) {
      const [labRows] = await db.pool.query('SELECT * FROM `labs` WHERE `id` = ?', [labId]);
      if (labRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Laboratorium yang dipilih tidak valid.' });
      }
      lab = labRows[0];

      // Conflict detection
      const [conflicts] = await db.pool.query(
        'SELECT * FROM `bookings` WHERE `lab_id` = ? AND `date` = ? AND `session` = ? AND `status` IN (\'disetujui_admin\', \'sedang_berlangsung\')',
        [labId, date, session || 'pagi']
      );
      if (conflicts.length > 0) {
        conflict = conflicts[0];
      }

      if (dosenId) {
        const [dosenRows] = await db.pool.query('SELECT name FROM `users` WHERE `id` = ?', [dosenId]);
        if (dosenRows.length > 0) dosenName = dosenRows[0].name;
      }
    } else {
      const jsonDb = db.getJsonDb();
      lab = jsonDb.labs.find(l => l.id === labId);
      if (!lab) {
        return res.status(404).json({ success: false, message: 'Laboratorium yang dipilih tidak valid.' });
      }
      conflict = jsonDb.bookings.find(b =>
        b.labId === labId &&
        b.date === date &&
        b.session === (session || 'pagi') &&
        ['disetujui_admin', 'sedang_berlangsung'].includes(b.status)
      );
      if (dosenId) {
        const d = jsonDb.users.find(u => u.id === dosenId);
        if (d) dosenName = d.name;
      }
    }

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Jadwal bentrok: ${lab.name} sudah dibooking pada ${date} untuk sesi ${session || 'tersebut'} oleh ${conflict.user_name || conflict.userName}.`
      });
    }

    const user = req.user || {
      id: 'usr_mhs1',
      name: req.body.userName || 'Bagas Pratama',
      nim: req.body.userNim || '22051204001',
      jurusan: req.body.userJurusan || 'Teknik Informatika',
      phone: contactPhone || '082155443322'
    };

    const nextNum = Date.now().toString().slice(-3);
    const bookingId = `BOOK-2026-${nextNum}`;
    const dateShort = date.replace(/-/g, '').substring(4);
    const bookingCode = `LAB-ILKOM-2026-${dateShort}-${nextNum}`;
    const qrCodeData = `LAB-AUTH:${bookingId}:${user.nim || user.identifier}:${lab.id}:${date.replace(/-/g, '')}`;

    let slotLabel = timeSlot;
    if (!slotLabel) {
      if (session === 'pagi') slotLabel = '08:00 - 11:30 (Sesi Pagi)';
      else if (session === 'siang') slotLabel = '13:00 - 16:30 (Sesi Siang)';
      else if (session === 'sore') slotLabel = '16:30 - 19:30 (Sesi Sore)';
      else if (session === 'malam') slotLabel = '19:30 - 22:00 (Sesi Malam)';
      else slotLabel = '08:00 - 16:30 (Full Day)';
    }

    const newBooking = {
      id: bookingId,
      bookingCode,
      userId: user.id,
      userName: user.name,
      userNim: user.nim || user.identifier || '',
      userJurusan: user.jurusan || 'Teknik Informatika',
      userPhone: contactPhone || user.phone || '',
      labId: lab.id,
      labName: lab.name,
      date,
      timeSlot: slotLabel,
      session: session || 'pagi',
      participantsCount: Number(participantsCount) || 1,
      purpose,
      category: category || 'Riset Skripsi / Tugas Akhir',
      dosenId: dosenId || null,
      dosenName: dosenName || (dosenId ? 'Dosen Pembimbing' : 'Tanpa Pembimbing'),
      equipments: Array.isArray(equipments) ? equipments : equipments ? [equipments] : [],
      status: dosenId ? 'menunggu_dosen' : 'menunggu_admin',
      dosenNotes: '',
      adminNotes: '',
      qrCodeData,
      createdAt: new Date().toISOString()
    };

    if (db.isConnected && db.pool) {
      await db.pool.query(
        'INSERT INTO `bookings` (id, booking_code, user_id, user_name, user_nim, user_jurusan, user_phone, lab_id, lab_name, date, time_slot, session, participants_count, purpose, category, dosen_id, dosen_name, equipments, status, dosen_notes, admin_notes, qr_code_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newBooking.id, newBooking.bookingCode, newBooking.userId, newBooking.userName, newBooking.userNim, newBooking.userJurusan, newBooking.userPhone, newBooking.labId, newBooking.labName, newBooking.date, newBooking.timeSlot, newBooking.session, newBooking.participantsCount, newBooking.purpose, newBooking.category, newBooking.dosenId, newBooking.dosenName, JSON.stringify(newBooking.equipments), newBooking.status, newBooking.dosenNotes, newBooking.adminNotes, newBooking.qrCodeData]
      );
    } else {
      const jsonDb = db.getJsonDb();
      jsonDb.bookings.unshift(newBooking);
      db.saveJsonDb(jsonDb);
    }

    return res.status(201).json({
      success: true,
      message: 'Pengajuan peminjaman lab berhasil tersimpan di database!',
      data: newBooking
    });
  } catch (err) {
    console.error('createBooking error:', err);
    return res.status(500).json({ success: false, message: 'Gagal membuat pengajuan peminjaman.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes, action } = req.body;

  try {
    let booking = null;

    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT * FROM `bookings` WHERE `id` = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan.' });
      }
      booking = rows[0];

      let newStatus = booking.status;
      let dosenNotes = booking.dosen_notes;
      let adminNotes = booking.admin_notes;
      let checkedInAt = booking.checked_in_at;
      let completedAt = booking.completed_at;

      if (action === 'approve_dosen') {
        newStatus = 'menunggu_admin';
        if (notes) dosenNotes = notes;
      } else if (action === 'reject_dosen') {
        newStatus = 'ditolak_dosen';
        if (notes) dosenNotes = notes;
      } else if (action === 'approve_admin') {
        newStatus = 'disetujui_admin';
        if (notes) adminNotes = notes;
      } else if (action === 'reject_admin') {
        newStatus = 'ditolak_admin';
        if (notes) adminNotes = notes;
      } else if (action === 'check_in') {
        newStatus = 'sedang_berlangsung';
        checkedInAt = new Date();
      } else if (action === 'selesai') {
        newStatus = 'selesai';
        completedAt = new Date();
      } else if (action === 'batal') {
        newStatus = 'dibatalkan';
      } else if (status) {
        newStatus = status;
        if (notes) {
          if (req.user && req.user.role === 'dosen') dosenNotes = notes;
          else adminNotes = notes;
        }
      }

      await db.pool.query(
        'UPDATE `bookings` SET status = ?, dosen_notes = ?, admin_notes = ?, checked_in_at = ?, completed_at = ? WHERE id = ?',
        [newStatus, dosenNotes, adminNotes, checkedInAt, completedAt, id]
      );

      return res.json({
        success: true,
        message: `Status peminjaman [${booking.booking_code}] berhasil diperbarui menjadi: ${newStatus}`,
        data: {
          ...booking,
          id: booking.id,
          bookingCode: booking.booking_code,
          userId: booking.user_id,
          userName: booking.user_name,
          userNim: booking.user_nim,
          labId: booking.lab_id,
          labName: booking.lab_name,
          timeSlot: booking.time_slot,
          qrCodeData: booking.qr_code_data,
          status: newStatus,
          dosenNotes,
          adminNotes
        }
      });
    } else {
      const jsonDb = db.getJsonDb();
      const index = jsonDb.bookings.findIndex(b => b.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan.' });
      }
      booking = jsonDb.bookings[index];

      if (action === 'approve_dosen') {
        booking.status = 'menunggu_admin';
        if (notes) booking.dosenNotes = notes;
      } else if (action === 'reject_dosen') {
        booking.status = 'ditolak_dosen';
        if (notes) booking.dosenNotes = notes;
      } else if (action === 'approve_admin') {
        booking.status = 'disetujui_admin';
        if (notes) booking.adminNotes = notes;
      } else if (action === 'reject_admin') {
        booking.status = 'ditolak_admin';
        if (notes) booking.adminNotes = notes;
      } else if (action === 'check_in') {
        booking.status = 'sedang_berlangsung';
        booking.checkedInAt = new Date().toISOString();
      } else if (action === 'selesai') {
        booking.status = 'selesai';
        booking.completedAt = new Date().toISOString();
      } else if (action === 'batal') {
        booking.status = 'dibatalkan';
      } else if (status) {
        booking.status = status;
      }

      db.saveJsonDb(jsonDb);

      return res.json({
        success: true,
        message: `Status peminjaman [${booking.bookingCode}] berhasil diperbarui menjadi: ${booking.status}`,
        data: booking
      });
    }
  } catch (err) {
    console.error('updateBookingStatus error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status peminjaman.' });
  }
};

exports.checkInByQR = async (req, res) => {
  const { qrCodeData } = req.body;
  if (!qrCodeData) {
    return res.status(400).json({ success: false, message: 'Data QR Code tidak valid.' });
  }

  try {
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query(
        'SELECT * FROM `bookings` WHERE `qr_code_data` = ? OR `booking_code` = ? OR `id` = ?',
        [qrCodeData, qrCodeData, qrCodeData]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'QR Code tidak cocok dengan data peminjaman manapun.' });
      }

      const booking = rows[0];
      if (booking.status !== 'disetujui_admin') {
        return res.status(400).json({
          success: false,
          message: `Peminjaman belum dapat check-in. Status saat ini: ${booking.status}`
        });
      }

      await db.pool.query(
        'UPDATE `bookings` SET status = \'sedang_berlangsung\', checked_in_at = NOW() WHERE id = ?',
        [booking.id]
      );

      return res.json({
        success: true,
        message: `Check-in Berhasil! Selamat datang di ${booking.lab_name}, ${booking.user_name}.`,
        data: { ...booking, status: 'sedang_berlangsung' }
      });
    } else {
      const jsonDb = db.getJsonDb();
      const booking = jsonDb.bookings.find(b => b.qrCodeData === qrCodeData || b.bookingCode === qrCodeData || b.id === qrCodeData);

      if (!booking) {
        return res.status(404).json({ success: false, message: 'QR Code tidak cocok dengan data peminjaman manapun.' });
      }

      if (booking.status !== 'disetujui_admin') {
        return res.status(400).json({
          success: false,
          message: `Peminjaman belum dapat check-in. Status saat ini: ${booking.status}`
        });
      }

      booking.status = 'sedang_berlangsung';
      booking.checkedInAt = new Date().toISOString();
      db.saveJsonDb(jsonDb);

      return res.json({
        success: true,
        message: `Check-in Berhasil! Selamat datang di ${booking.labName}, ${booking.userName}.`,
        data: booking
      });
    }
  } catch (err) {
    console.error('checkInByQR error:', err);
    return res.status(500).json({ success: false, message: 'Gagal check-in via QR.' });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    if (db.isConnected && db.pool) {
      const [resDel] = await db.pool.query('DELETE FROM `bookings` WHERE `id` = ?', [id]);
      if (resDel.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan.' });
      }
    } else {
      const jsonDb = db.getJsonDb();
      const index = jsonDb.bookings.findIndex(b => b.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan.' });
      }
      jsonDb.bookings.splice(index, 1);
      db.saveJsonDb(jsonDb);
    }

    return res.json({ success: true, message: 'Data peminjaman berhasil dihapus dari database.' });
  } catch (err) {
    console.error('deleteBooking error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus data peminjaman.' });
  }
};
