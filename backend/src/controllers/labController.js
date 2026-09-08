const db = require('../data/db');

exports.getAllLabs = async (req, res) => {
  const { category, search, status } = req.query;

  try {
    let labs = [];
    if (db.isConnected && db.pool) {
      let sql = 'SELECT * FROM `labs` WHERE 1=1';
      const params = [];

      if (category && category !== 'all') {
        sql += ' AND LOWER(category) LIKE ?';
        params.push(`%${category.toLowerCase()}%`);
      }
      if (status && status !== 'all') {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (search) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(code) LIKE ? OR LOWER(location) LIKE ? OR LOWER(category) LIKE ?)';
        const q = `%${search.toLowerCase()}%`;
        params.push(q, q, q, q);
      }

      const [rows] = await db.pool.query(sql, params);
      labs = rows.map(r => ({
        ...r,
        shortName: r.short_name,
        availablePc: r.available_pc,
        facilities: typeof r.facilities === 'string' ? JSON.parse(r.facilities || '[]') : r.facilities || []
      }));
    } else {
      labs = [...db.getJsonDb().labs];
      if (category && category !== 'all') {
        labs = labs.filter(l => l.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (status && status !== 'all') {
        labs = labs.filter(l => l.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        labs = labs.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
        );
      }
    }

    return res.json({ success: true, data: labs });
  } catch (err) {
    console.error('getAllLabs error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data laboratorium.' });
  }
};

exports.getLabById = async (req, res) => {
  const { id } = req.params;

  try {
    let lab = null;
    let labBookings = [];

    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT * FROM `labs` WHERE `id` = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Laboratorium tidak ditemukan.' });
      }
      const r = rows[0];
      lab = {
        ...r,
        shortName: r.short_name,
        availablePc: r.available_pc,
        facilities: typeof r.facilities === 'string' ? JSON.parse(r.facilities || '[]') : r.facilities || []
      };

      const [bookingRows] = await db.pool.query('SELECT * FROM `bookings` WHERE `lab_id` = ?', [id]);
      labBookings = bookingRows.map(b => ({
        ...b,
        bookingCode: b.booking_code,
        userId: b.user_id,
        userName: b.user_name,
        userNim: b.user_nim,
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
      }));
    } else {
      const jsonDb = db.getJsonDb();
      lab = jsonDb.labs.find(l => l.id === id);
      if (!lab) {
        return res.status(404).json({ success: false, message: 'Laboratorium tidak ditemukan.' });
      }
      labBookings = jsonDb.bookings.filter(b => b.labId === id);
    }

    return res.json({
      success: true,
      data: {
        ...lab,
        bookings: labBookings
      }
    });
  } catch (err) {
    console.error('getLabById error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail lab.' });
  }
};

exports.createLab = async (req, res) => {
  const { name, shortName, code, location, capacity, category, specs, facilities, image } = req.body;

  if (!name || !code || !location) {
    return res.status(400).json({ success: false, message: 'Nama, Kode Lab, dan Lokasi wajib diisi.' });
  }

  try {
    const id = `LAB-${Date.now().toString().slice(-2)}`;
    const newLab = {
      id,
      name,
      shortName: shortName || name,
      code,
      location,
      capacity: Number(capacity) || 30,
      availablePc: Number(capacity) || 30,
      category: category || 'General Lab',
      specs: specs || '',
      facilities: Array.isArray(facilities) ? facilities : facilities ? [facilities] : [],
      status: 'Tersedia',
      image: image || 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'
    };

    if (db.isConnected && db.pool) {
      await db.pool.query(
        'INSERT INTO `labs` (id, name, short_name, code, location, capacity, available_pc, category, specs, facilities, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newLab.id, newLab.name, newLab.shortName, newLab.code, newLab.location, newLab.capacity, newLab.availablePc, newLab.category, newLab.specs, JSON.stringify(newLab.facilities), newLab.status, newLab.image]
      );
    } else {
      const jsonDb = db.getJsonDb();
      jsonDb.labs.push(newLab);
      db.saveJsonDb(jsonDb);
    }

    return res.status(201).json({
      success: true,
      message: 'Laboratorium baru berhasil ditambahkan ke database.',
      data: newLab
    });
  } catch (err) {
    console.error('createLab error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan laboratorium.' });
  }
};

exports.updateLab = async (req, res) => {
  const { id } = req.params;

  try {
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT * FROM `labs` WHERE `id` = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Laboratorium tidak ditemukan.' });
      }

      const current = rows[0];
      const updated = {
        name: req.body.name || current.name,
        short_name: req.body.shortName || current.short_name,
        code: req.body.code || current.code,
        location: req.body.location || current.location,
        capacity: req.body.capacity !== undefined ? Number(req.body.capacity) : current.capacity,
        available_pc: req.body.availablePc !== undefined ? Number(req.body.availablePc) : current.available_pc,
        category: req.body.category || current.category,
        specs: req.body.specs !== undefined ? req.body.specs : current.specs,
        facilities: req.body.facilities ? JSON.stringify(req.body.facilities) : current.facilities,
        status: req.body.status || current.status,
        image: req.body.image || current.image
      };

      await db.pool.query(
        'UPDATE `labs` SET name = ?, short_name = ?, code = ?, location = ?, capacity = ?, available_pc = ?, category = ?, specs = ?, facilities = ?, status = ?, image = ? WHERE id = ?',
        [updated.name, updated.short_name, updated.code, updated.location, updated.capacity, updated.available_pc, updated.category, updated.specs, updated.facilities, updated.status, updated.image, id]
      );

      return res.json({
        success: true,
        message: 'Data laboratorium berhasil diperbarui di database.',
        data: { id, ...updated, shortName: updated.short_name, availablePc: updated.available_pc }
      });
    } else {
      const jsonDb = db.getJsonDb();
      const index = jsonDb.labs.findIndex(l => l.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Laboratorium tidak ditemukan.' });
      }
      jsonDb.labs[index] = { ...jsonDb.labs[index], ...req.body, id };
      db.saveJsonDb(jsonDb);
      return res.json({ success: true, message: 'Data lab diperbarui.', data: jsonDb.labs[index] });
    }
  } catch (err) {
    console.error('updateLab error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data lab.' });
  }
};

exports.deleteLab = async (req, res) => {
  const { id } = req.params;

  try {
    if (db.isConnected && db.pool) {
      const [resDel] = await db.pool.query('DELETE FROM `labs` WHERE `id` = ?', [id]);
      if (resDel.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Laboratorium tidak ditemukan.' });
      }
    } else {
      const jsonDb = db.getJsonDb();
      const index = jsonDb.labs.findIndex(l => l.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Laboratorium tidak ditemukan.' });
      }
      jsonDb.labs.splice(index, 1);
      db.saveJsonDb(jsonDb);
    }

    return res.json({ success: true, message: 'Laboratorium berhasil dihapus dari database.' });
  } catch (err) {
    console.error('deleteLab error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus laboratorium.' });
  }
};
