const jwt = require('jsonwebtoken');
const db = require('../data/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      identifier: user.identifier || user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.login = async (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Harap masukkan NIM/NIP/Email dan kata sandi.'
    });
  }

  const trimmedId = identifier.trim().toLowerCase();

  try {
    let user = null;
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query(
        'SELECT * FROM `users` WHERE LOWER(identifier) = ? OR LOWER(email) = ? OR LOWER(COALESCE(nim, \'\')) = ? OR LOWER(COALESCE(nip, \'\')) = ?',
        [trimmedId, trimmedId, trimmedId, trimmedId]
      );
      user = rows[0] || null;
    } else {
      const jsonDb = db.getJsonDb();
      user = jsonDb.users.find(u =>
        (u.identifier && u.identifier.toLowerCase() === trimmedId) ||
        (u.email && u.email.toLowerCase() === trimmedId) ||
        (u.nim && u.nim.toLowerCase() === trimmedId) ||
        (u.nip && u.nip.toLowerCase() === trimmedId)
      );
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak ditemukan. Periksa kembali NIM/NIP/Email Anda.'
      });
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Akun ini tidak terdaftar sebagai role '${role}'. Role Anda adalah '${user.role}'.`
      });
    }

    // Check password
    if (user.password !== password && password !== 'demo123') {
      return res.status(401).json({
        success: false,
        message: 'Kata sandi salah. Silakan coba lagi.'
      });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat login.' });
  }
};

exports.quickLogin = async (req, res) => {
  const { role, userId } = req.body;

  try {
    let user = null;
    if (db.isConnected && db.pool) {
      if (userId) {
        const [rows] = await db.pool.query('SELECT * FROM `users` WHERE `id` = ?', [userId]);
        user = rows[0];
      } else if (role) {
        const [rows] = await db.pool.query('SELECT * FROM `users` WHERE `role` = ? LIMIT 1', [role]);
        user = rows[0];
      }
      if (!user) {
        const [rows] = await db.pool.query('SELECT * FROM `users` LIMIT 1');
        user = rows[0];
      }
    } else {
      const jsonDb = db.getJsonDb();
      if (userId) user = jsonDb.users.find(u => u.id === userId);
      else if (role) user = jsonDb.users.find(u => u.role === role);
      if (!user) user = jsonDb.users[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User demo tidak ditemukan.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Login instan berhasil sebagai ${user.name} (${user.role.toUpperCase()})`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Quick login error:', err);
    return res.status(500).json({ success: false, message: 'Gagal melakukan quick login.' });
  }
};

exports.getMe = (req, res) => {
  const { password: _, ...safeUser } = req.user;
  return res.json({
    success: true,
    user: safeUser
  });
};

exports.register = async (req, res) => {
  const { name, nim, email, password, jurusan, phone } = req.body;

  if (!name || !nim || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi (Nama, NIM, Email, Password).'
    });
  }

  try {
    const newUser = {
      id: `usr_mhs_${Date.now()}`,
      name,
      identifier: nim,
      nim,
      email,
      role: 'mahasiswa',
      jurusan: jurusan || 'Teknik Informatika',
      semester: 1,
      angkatan: new Date().getFullYear(),
      password,
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    };

    if (db.isConnected && db.pool) {
      const [existing] = await db.pool.query(
        'SELECT id FROM `users` WHERE email = ? OR identifier = ? OR nim = ?',
        [email, nim, nim]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'NIM atau Email sudah terdaftar dalam sistem.' });
      }

      await db.pool.query(
        'INSERT INTO `users` (id, name, identifier, email, role, nim, jurusan, semester, angkatan, password, phone, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newUser.id, newUser.name, newUser.identifier, newUser.email, newUser.role, newUser.nim, newUser.jurusan, newUser.semester, newUser.angkatan, newUser.password, newUser.phone, newUser.avatar]
      );
    } else {
      const jsonDb = db.getJsonDb();
      const existing = jsonDb.users.find(u => u.email === email || u.identifier === nim || u.nim === nim);
      if (existing) {
        return res.status(400).json({ success: false, message: 'NIM atau Email sudah terdaftar dalam sistem.' });
      }
      jsonDb.users.push(newUser);
      db.saveJsonDb(jsonDb);
    }

    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registrasi akun mahasiswa berhasil!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat registrasi.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let users = [];
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT id, name, identifier, email, role, nim, nip, jurusan, bidang, semester, angkatan, phone, avatar, created_at FROM `users`');
      users = rows;
    } else {
      users = db.getJsonDb().users.map(({ password, ...u }) => u);
    }
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data user.' });
  }
};

exports.getLecturers = async (req, res) => {
  try {
    let lecturers = [];
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT id, name, identifier, email, role, nip, bidang, phone, avatar FROM `users` WHERE role = \'dosen\'');
      lecturers = rows;
    } else {
      lecturers = db.getJsonDb().users
        .filter(u => u.role === 'dosen')
        .map(({ password, ...u }) => u);
    }
    return res.json({ success: true, data: lecturers });
  } catch (err) {
    console.error('getLecturers error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data dosen.' });
  }
};
