const db = require('../data/db');

// ─── Helper: format waktu HH:MM ───────────────────────────────────────────────
function fmtTime(t) {
  if (!t) return '';
  return String(t).substring(0, 5);
}

// ─── Helper: format tanggal ke Indonesia ──────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Label jenis ujian ────────────────────────────────────────────────────────
function jenisLabel(j) {
  const map = {
    proposal: 'Sidang Proposal',
    seminar_hasil: 'Seminar Hasil',
    sidang_skripsi: 'Sidang Skripsi',
    komprehensif: 'Ujian Komprehensif'
  };
  return map[j] || j;
}

// ═══════════════════════════════════════════════════════════════════
//  PEMBIMBING
// ═══════════════════════════════════════════════════════════════════

// GET /api/thesis/supervisors — Admin: semua data pembagian pembimbing
exports.getAllSupervisors = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.json({ success: true, data: [] });
    }
    const [rows] = await db.pool.query(`
      SELECT 
        ta.id, ta.judul_skripsi, ta.status, ta.status_p1, ta.status_p2, ta.created_at,
        mhs.id AS mahasiswaId, mhs.name AS mahasiswaName, mhs.nim AS mahasiswaNim,
        mhs.jurusan AS mahasiswaJurusan, mhs.semester AS mahasiswaSemester,
        p1.id AS pembimbing1Id, p1.name AS pembimbing1Name, p1.bidang AS pembimbing1Bidang,
        p2.id AS pembimbing2Id, p2.name AS pembimbing2Name, p2.bidang AS pembimbing2Bidang
      FROM thesis_assignments ta
      JOIN users mhs ON ta.mahasiswa_id = mhs.id
      JOIN users p1  ON ta.pembimbing1_id = p1.id
      LEFT JOIN users p2 ON ta.pembimbing2_id = p2.id
      ORDER BY ta.created_at DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllSupervisors error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pembimbing.' });
  }
};

// GET /api/thesis/my-supervisor — Mahasiswa: pembimbing saya
exports.getMySupervisor = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.json({ success: true, data: null });
    }
    const userId = req.user.id;
    const [rows] = await db.pool.query(`
      SELECT 
        ta.id, ta.judul_skripsi, ta.status, ta.status_p1, ta.status_p2,
        p1.id AS pembimbing1Id, p1.name AS pembimbing1Name, p1.bidang AS pembimbing1Bidang,
        p1.phone AS pembimbing1Phone, p1.email AS pembimbing1Email,
        p2.id AS pembimbing2Id, p2.name AS pembimbing2Name, p2.bidang AS pembimbing2Bidang,
        p2.phone AS pembimbing2Phone, p2.email AS pembimbing2Email
      FROM thesis_assignments ta
      JOIN users p1  ON ta.pembimbing1_id = p1.id
      LEFT JOIN users p2 ON ta.pembimbing2_id = p2.id
      WHERE ta.mahasiswa_id = ?
      LIMIT 1
    `, [userId]);
    return res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    console.error('getMySupervisor error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pembimbing.' });
  }
};

// POST /api/thesis/apply-supervisor — Mahasiswa: Mengajukan Pembimbing 1 & 2
exports.applySupervisor = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    const mahasiswaId = req.user.id;
    const { pembimbing1Id, pembimbing2Id, judulSkripsi } = req.body;

    if (!pembimbing1Id) {
      return res.status(400).json({ success: false, message: 'Dosen Pembimbing 1 wajib dipilih.' });
    }

    if (pembimbing1Id === pembimbing2Id) {
      return res.status(400).json({ success: false, message: 'Pembimbing 1 dan Pembimbing 2 tidak boleh dosen yang sama.' });
    }

    // Check if already has an assignment
    const [existing] = await db.pool.query('SELECT id, status FROM thesis_assignments WHERE mahasiswa_id = ?', [mahasiswaId]);
    if (existing.length > 0) {
      // If already active or finished, cannot re-apply
      if (['aktif', 'selesai'].includes(existing[0].status)) {
        return res.status(400).json({ success: false, message: 'Anda sudah memiliki pembimbing yang aktif/selesai.' });
      }
      // Update existing application
      await db.pool.query(`
        UPDATE thesis_assignments 
        SET pembimbing1_id = ?, status_p1 = 'menunggu', 
            pembimbing2_id = ?, status_p2 = ?,
            judul_skripsi = ?, status = 'diajukan'
        WHERE id = ?
      `, [pembimbing1Id, pembimbing2Id || null, pembimbing2Id ? 'menunggu' : 'disetujui', judulSkripsi || null, existing[0].id]);
      
      return res.json({ success: true, message: 'Pengajuan pembimbing berhasil diperbarui dan dikirim ke dosen terkait.' });
    }

    const id = 'TA-' + Date.now();
    await db.pool.query(`
      INSERT INTO thesis_assignments 
      (id, mahasiswa_id, pembimbing1_id, status_p1, pembimbing2_id, status_p2, judul_skripsi, status)
      VALUES (?, ?, ?, 'menunggu', ?, ?, ?, 'diajukan')
    `, [id, mahasiswaId, pembimbing1Id, pembimbing2Id || null, pembimbing2Id ? 'menunggu' : 'disetujui', judulSkripsi || null]);

    return res.status(201).json({ success: true, message: 'Pengajuan pembimbing berhasil dikirim ke dosen terkait.' });
  } catch (err) {
    console.error('applySupervisor error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengajukan pembimbing.' });
  }
};

// GET /api/thesis/my-supervision — Dosen: mahasiswa bimbingan & permohonan yang menunggu persetujuan
exports.getMySupervision = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.json({ success: true, data: [] });
    }
    const dosenId = req.user.id;
    const [rows] = await db.pool.query(`
      SELECT 
        ta.id, ta.judul_skripsi, ta.status, ta.status_p1, ta.status_p2,
        CASE 
          WHEN ta.pembimbing1_id = ? THEN 'Pembimbing 1'
          WHEN ta.pembimbing2_id = ? THEN 'Pembimbing 2'
        END AS peran,
        CASE 
          WHEN ta.pembimbing1_id = ? THEN ta.status_p1
          WHEN ta.pembimbing2_id = ? THEN ta.status_p2
        END AS statusSaya,
        mhs.id AS mahasiswaId, mhs.name AS mahasiswaName, mhs.nim AS mahasiswaNim,
        mhs.jurusan AS mahasiswaJurusan, mhs.semester AS mahasiswaSemester,
        mhs.phone AS mahasiswaPhone, mhs.email AS mahasiswaEmail
      FROM thesis_assignments ta
      JOIN users mhs ON ta.mahasiswa_id = mhs.id
      WHERE ta.pembimbing1_id = ? OR ta.pembimbing2_id = ?
      ORDER BY ta.created_at DESC
    `, [dosenId, dosenId, dosenId, dosenId, dosenId, dosenId]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getMySupervision error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data bimbingan.' });
  }
};

// POST /api/thesis/respond-supervision — Dosen: Setujui / Tolak Permohonan Bimbingan
exports.respondSupervision = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    const dosenId = req.user.id;
    const { assignmentId, action } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Aksi tidak valid.' });
    }

    const [rows] = await db.pool.query('SELECT * FROM thesis_assignments WHERE id = ?', [assignmentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pengajuan tidak ditemukan.' });
    }

    const assignment = rows[0];
    const isP1 = assignment.pembimbing1_id === dosenId;
    const isP2 = assignment.pembimbing2_id === dosenId;

    if (!isP1 && !isP2) {
      return res.status(403).json({ success: false, message: 'Anda bukan dosen pembimbing yang dituju.' });
    }

    const newStatus = action === 'approve' ? 'disetujui' : 'ditolak';

    let updateSql = '';
    if (isP1) {
      updateSql = 'UPDATE thesis_assignments SET status_p1 = ? WHERE id = ?';
    } else {
      updateSql = 'UPDATE thesis_assignments SET status_p2 = ? WHERE id = ?';
    }
    await db.pool.query(updateSql, [newStatus, assignmentId]);

    // Recalculate overall status
    const [updated] = await db.pool.query('SELECT * FROM thesis_assignments WHERE id = ?', [assignmentId]);
    const u = updated[0];

    let finalStatus = 'diajukan';
    if (u.status_p1 === 'ditolak' || u.status_p2 === 'ditolak') {
      finalStatus = 'ditolak';
    } else if (u.status_p1 === 'disetujui' && (!u.pembimbing2_id || u.status_p2 === 'disetujui')) {
      finalStatus = 'aktif';
    }

    await db.pool.query('UPDATE thesis_assignments SET status = ? WHERE id = ?', [finalStatus, assignmentId]);

    return res.json({
      success: true,
      message: action === 'approve' 
        ? 'Anda telah menyetujui permohonan bimbingan skripsi ini.' 
        : 'Anda telah menolak permohonan bimbingan skripsi ini.'
    });
  } catch (err) {
    console.error('respondSupervision error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses respon pembimbing.' });
  }
};

// POST /api/thesis/supervisors — Admin: tambah/assign pembagian pembimbing langsung
exports.createSupervisor = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    const { mahasiswaId, pembimbing1Id, pembimbing2Id, judulSkripsi } = req.body;
    if (!mahasiswaId || !pembimbing1Id) {
      return res.status(400).json({ success: false, message: 'Mahasiswa dan Pembimbing 1 wajib diisi.' });
    }
    const id = 'TA-' + Date.now();
    await db.pool.query(
      'INSERT INTO thesis_assignments (id, mahasiswa_id, pembimbing1_id, status_p1, pembimbing2_id, status_p2, judul_skripsi, status) VALUES (?, ?, ?, \'disetujui\', ?, \'disetujui\', ?, \'aktif\')',
      [id, mahasiswaId, pembimbing1Id, pembimbing2Id || null, judulSkripsi || null]
    );
    return res.status(201).json({ success: true, message: 'Pembagian pembimbing berhasil ditambahkan.', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Mahasiswa ini sudah memiliki pembimbing yang ditugaskan.' });
    }
    console.error('createSupervisor error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan data.' });
  }
};


// PUT /api/thesis/supervisors/:id — Admin: edit pembagian
exports.updateSupervisor = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    const { id } = req.params;
    const { pembimbing1Id, pembimbing2Id, judulSkripsi, status } = req.body;
    await db.pool.query(
      'UPDATE thesis_assignments SET pembimbing1_id=?, pembimbing2_id=?, judul_skripsi=?, status=? WHERE id=?',
      [pembimbing1Id, pembimbing2Id || null, judulSkripsi || null, status || 'aktif', id]
    );
    return res.json({ success: true, message: 'Data pembimbing berhasil diperbarui.' });
  } catch (err) {
    console.error('updateSupervisor error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data.' });
  }
};

// DELETE /api/thesis/supervisors/:id — Admin: hapus pembagian
exports.deleteSupervisor = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    await db.pool.query('DELETE FROM thesis_assignments WHERE id=?', [req.params.id]);
    return res.json({ success: true, message: 'Data pembimbing berhasil dihapus.' });
  } catch (err) {
    console.error('deleteSupervisor error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus data.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  JADWAL UJIAN
// ═══════════════════════════════════════════════════════════════════

// Helper: ambil data ujian lengkap (dengan mahasiswa & penguji)
async function fetchExamsWithDetails(whereClause, params) {
  const [rows] = await db.pool.query(`
    SELECT
      te.id, te.jenis_ujian, te.tanggal, te.jam_mulai, te.jam_selesai,
      te.ruangan, te.status, te.catatan, te.created_at,
      mhs.id AS mahasiswaId, mhs.name AS mahasiswaName, mhs.nim AS mahasiswaNim,
      mhs.jurusan AS mahasiswaJurusan
    FROM thesis_exams te
    JOIN users mhs ON te.mahasiswa_id = mhs.id
    ${whereClause}
    ORDER BY te.tanggal ASC, te.jam_mulai ASC
  `, params);

  // Ambil penguji untuk setiap ujian
  const examIds = rows.map(r => r.id);
  let examinerMap = {};
  if (examIds.length > 0) {
    const placeholders = examIds.map(() => '?').join(',');
    const [examiners] = await db.pool.query(`
      SELECT tee.exam_id, u.id AS dosenId, u.name AS dosenName, u.bidang AS dosenBidang
      FROM thesis_exam_examiners tee
      JOIN users u ON tee.dosen_id = u.id
      WHERE tee.exam_id IN (${placeholders})
    `, examIds);
    examiners.forEach(e => {
      if (!examinerMap[e.exam_id]) examinerMap[e.exam_id] = [];
      examinerMap[e.exam_id].push({ dosenId: e.dosenId, dosenName: e.dosenName, dosenBidang: e.dosenBidang });
    });
  }

  return rows.map(r => ({
    ...r,
    jenisLabel: jenisLabel(r.jenis_ujian),
    tanggalFormatted: fmtDate(r.tanggal),
    jamMulai: fmtTime(r.jam_mulai),
    jamSelesai: fmtTime(r.jam_selesai),
    penguji: examinerMap[r.id] || []
  }));
}

// GET /api/thesis/exams — Admin: semua jadwal ujian
exports.getAllExams = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.json({ success: true, data: [] });
    }
    const data = await fetchExamsWithDetails('', []);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getAllExams error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil jadwal ujian.' });
  }
};

// GET /api/thesis/my-exam — Mahasiswa: jadwal ujian saya
exports.getMyExam = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.json({ success: true, data: [] });
    }
    const data = await fetchExamsWithDetails('WHERE te.mahasiswa_id = ?', [req.user.id]);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getMyExam error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil jadwal ujian.' });
  }
};

// GET /api/thesis/my-exams-as-examiner — Dosen: jadwal ujian sebagai penguji
exports.getMyExamsAsExaminer = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.json({ success: true, data: [] });
    }
    const [examIds] = await db.pool.query(
      'SELECT exam_id FROM thesis_exam_examiners WHERE dosen_id = ?',
      [req.user.id]
    );
    if (examIds.length === 0) return res.json({ success: true, data: [] });

    const ids = examIds.map(r => r.exam_id);
    const placeholders = ids.map(() => '?').join(',');
    const data = await fetchExamsWithDetails(`WHERE te.id IN (${placeholders})`, ids);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getMyExamsAsExaminer error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil jadwal ujian.' });
  }
};

// POST /api/thesis/exams — Admin: buat jadwal ujian
exports.createExam = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    const { mahasiswaId, jenisUjian, tanggal, jamMulai, jamSelesai, ruangan, catatan, pengujiIds } = req.body;
    if (!mahasiswaId || !jenisUjian || !tanggal || !jamMulai || !jamSelesai || !ruangan) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }
    const id = 'TE-' + Date.now();
    await db.pool.query(
      'INSERT INTO thesis_exams (id, mahasiswa_id, jenis_ujian, tanggal, jam_mulai, jam_selesai, ruangan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, mahasiswaId, jenisUjian, tanggal, jamMulai, jamSelesai, ruangan, catatan || null]
    );
    // Simpan penguji
    if (pengujiIds && pengujiIds.length > 0) {
      const examinerRows = pengujiIds.map(did => [id, did]);
      await db.pool.query('INSERT INTO thesis_exam_examiners (exam_id, dosen_id) VALUES ?', [examinerRows]);
    }
    return res.status(201).json({ success: true, message: 'Jadwal ujian berhasil dibuat.', id });
  } catch (err) {
    console.error('createExam error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan jadwal ujian.' });
  }
};

// PUT /api/thesis/exams/:id — Admin: edit jadwal ujian
exports.updateExam = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    const { id } = req.params;
    const { jenisUjian, tanggal, jamMulai, jamSelesai, ruangan, status, catatan, pengujiIds } = req.body;
    await db.pool.query(
      'UPDATE thesis_exams SET jenis_ujian=?, tanggal=?, jam_mulai=?, jam_selesai=?, ruangan=?, status=?, catatan=? WHERE id=?',
      [jenisUjian, tanggal, jamMulai, jamSelesai, ruangan, status || 'mendatang', catatan || null, id]
    );
    if (pengujiIds !== undefined) {
      await db.pool.query('DELETE FROM thesis_exam_examiners WHERE exam_id=?', [id]);
      if (pengujiIds.length > 0) {
        const examinerRows = pengujiIds.map(did => [id, did]);
        await db.pool.query('INSERT INTO thesis_exam_examiners (exam_id, dosen_id) VALUES ?', [examinerRows]);
      }
    }
    return res.json({ success: true, message: 'Jadwal ujian berhasil diperbarui.' });
  } catch (err) {
    console.error('updateExam error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal ujian.' });
  }
};

// DELETE /api/thesis/exams/:id — Admin: hapus jadwal ujian
exports.deleteExam = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) {
      return res.status(503).json({ success: false, message: 'Database tidak tersedia.' });
    }
    await db.pool.query('DELETE FROM thesis_exam_examiners WHERE exam_id=?', [req.params.id]);
    await db.pool.query('DELETE FROM thesis_exams WHERE id=?', [req.params.id]);
    return res.json({ success: true, message: 'Jadwal ujian berhasil dihapus.' });
  } catch (err) {
    console.error('deleteExam error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus jadwal ujian.' });
  }
};

// GET /api/thesis/students — Admin/Dosen: daftar mahasiswa (untuk dropdown form)
exports.getStudents = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) return res.json({ success: true, data: [] });
    const [rows] = await db.pool.query(
      "SELECT id, name, nim, jurusan, semester FROM users WHERE role='mahasiswa' ORDER BY name"
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data mahasiswa.' });
  }
};

// GET /api/thesis/lecturers — Admin: daftar dosen (untuk dropdown form)
exports.getLecturers = async (req, res) => {
  try {
    if (!db.isConnected || !db.pool) return res.json({ success: true, data: [] });
    const [rows] = await db.pool.query(
      "SELECT id, name, nip, bidang FROM users WHERE role='dosen' ORDER BY name"
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data dosen.' });
  }
};
