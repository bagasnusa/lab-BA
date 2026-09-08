const db = require('../data/db');

exports.getDashboardStats = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    let overview = {};
    let userStats = null;
    let recentBookings = [];

    if (db.isConnected && db.pool) {
      const [labCount] = await db.pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'Tersedia\' THEN 1 ELSE 0 END) as available FROM `labs`');
      const [eqCount] = await db.pool.query('SELECT COALESCE(SUM(total), 0) as total, COALESCE(SUM(available), 0) as available FROM `equipments`');
      const [pendingAdminCount] = await db.pool.query('SELECT COUNT(*) as count FROM `bookings` WHERE status = \'menunggu_admin\'');
      const [pendingDosenCount] = await db.pool.query('SELECT COUNT(*) as count FROM `bookings` WHERE status = \'menunggu_dosen\'');
      const [approvedActiveCount] = await db.pool.query('SELECT COUNT(*) as count FROM `bookings` WHERE status IN (\'disetujui_admin\', \'sedang_berlangsung\')');
      const [todayCount] = await db.pool.query('SELECT COUNT(*) as count FROM `bookings` WHERE date = ? AND status IN (\'disetujui_admin\', \'sedang_berlangsung\')', [today]);
      const [studentCount] = await db.pool.query('SELECT COUNT(*) as count FROM `users` WHERE role = \'mahasiswa\'');
      const [lecturerCount] = await db.pool.query('SELECT COUNT(*) as count FROM `users` WHERE role = \'dosen\'');

      const totalLabs = labCount[0].total || 0;
      const availableLabs = labCount[0].available || 0;

      overview = {
        totalLabs,
        availableLabs,
        inUseLabs: totalLabs - availableLabs,
        totalEquipments: eqCount[0].total || 0,
        availableEquipments: eqCount[0].available || 0,
        pendingAdmin: pendingAdminCount[0].count || 0,
        pendingDosen: pendingDosenCount[0].count || 0,
        approvedActive: approvedActiveCount[0].count || 0,
        todayBookings: todayCount[0].count || 0,
        totalStudents: studentCount[0].count || 0,
        totalLecturers: lecturerCount[0].count || 0
      };

      const [recentRows] = await db.pool.query('SELECT * FROM `bookings` ORDER BY created_at DESC LIMIT 5');
      recentBookings = recentRows.map(b => ({
        ...b,
        bookingCode: b.booking_code,
        userName: b.user_name,
        labName: b.lab_name,
        timeSlot: b.time_slot
      }));

      if (req.user) {
        if (req.user.role === 'mahasiswa') {
          const [myRows] = await db.pool.query('SELECT * FROM `bookings` WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
          const myBookings = myRows;
          userStats = {
            totalMyBookings: myBookings.length,
            myPending: myBookings.filter(b => ['menunggu_dosen', 'menunggu_admin'].includes(b.status)).length,
            myApproved: myBookings.filter(b => b.status === 'disetujui_admin').length,
            myActive: myBookings.filter(b => b.status === 'sedang_berlangsung').length,
            myCompleted: myBookings.filter(b => b.status === 'selesai').length,
            activeBookingTicket: myBookings.find(b => ['disetujui_admin', 'sedang_berlangsung'].includes(b.status)) || null
          };
        } else if (req.user.role === 'dosen') {
          const [myDosenRows] = await db.pool.query('SELECT * FROM `bookings` WHERE dosen_id = ?', [req.user.id]);
          userStats = {
            pendingForMe: myDosenRows.filter(b => b.status === 'menunggu_dosen').length,
            approvedByMe: myDosenRows.filter(b => b.status !== 'menunggu_dosen' && b.status !== 'ditolak_dosen').length,
            totalMyStudents: myDosenRows.length
          };
        }
      }

    } else {
      const jsonDb = db.getJsonDb();
      const totalLabs = jsonDb.labs.length;
      const availableLabs = jsonDb.labs.filter(l => l.status === 'Tersedia').length;
      overview = {
        totalLabs,
        availableLabs,
        inUseLabs: totalLabs - availableLabs,
        totalEquipments: jsonDb.equipments.reduce((sum, e) => sum + (e.total || 0), 0),
        availableEquipments: jsonDb.equipments.reduce((sum, e) => sum + (e.available || 0), 0),
        pendingAdmin: jsonDb.bookings.filter(b => b.status === 'menunggu_admin').length,
        pendingDosen: jsonDb.bookings.filter(b => b.status === 'menunggu_dosen').length,
        approvedActive: jsonDb.bookings.filter(b => ['disetujui_admin', 'sedang_berlangsung'].includes(b.status)).length,
        todayBookings: jsonDb.bookings.filter(b => b.date === today && ['disetujui_admin', 'sedang_berlangsung'].includes(b.status)).length,
        totalStudents: jsonDb.users.filter(u => u.role === 'mahasiswa').length,
        totalLecturers: jsonDb.users.filter(u => u.role === 'dosen').length
      };
      recentBookings = jsonDb.bookings.slice(0, 5);

      if (req.user) {
        if (req.user.role === 'mahasiswa') {
          const myBookings = jsonDb.bookings.filter(b => b.userId === req.user.id);
          userStats = {
            totalMyBookings: myBookings.length,
            myPending: myBookings.filter(b => ['menunggu_dosen', 'menunggu_admin'].includes(b.status)).length,
            myApproved: myBookings.filter(b => b.status === 'disetujui_admin').length,
            myActive: myBookings.filter(b => b.status === 'sedang_berlangsung').length,
            myCompleted: myBookings.filter(b => b.status === 'selesai').length,
            activeBookingTicket: myBookings.find(b => ['disetujui_admin', 'sedang_berlangsung'].includes(b.status)) || null
          };
        } else if (req.user.role === 'dosen') {
          const myDosenBookings = jsonDb.bookings.filter(b => b.dosenId === req.user.id);
          userStats = {
            pendingForMe: myDosenBookings.filter(b => b.status === 'menunggu_dosen').length,
            approvedByMe: myDosenBookings.filter(b => b.status !== 'menunggu_dosen' && b.status !== 'ditolak_dosen').length,
            totalMyStudents: myDosenBookings.length
          };
        }
      }
    }

    return res.json({
      success: true,
      data: {
        overview,
        userStats,
        recentBookings,
        databaseType: db.isConnected ? 'MySQL (Laragon)' : 'Fallback (JSON)'
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data statistik.' });
  }
};

exports.resetDatabase = async (req, res) => {
  try {
    await db.resetDb();
    return res.json({
      success: true,
      message: 'Database berhasil di-reset ke konfigurasi awal data demo.'
    });
  } catch (err) {
    console.error('resetDatabase error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mereset database.' });
  }
};
