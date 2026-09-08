const jwt = require('jsonwebtoken');
const db = require('../data/db');

const JWT_SECRET = process.env.JWT_SECRET || 'lab-ilkom-super-secret-key-2026';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.' });
    }

    try {
      let user = null;
      if (db.isConnected && db.pool) {
        const [rows] = await db.pool.query('SELECT * FROM `users` WHERE `id` = ?', [decoded.id]);
        user = rows[0] || null;
      } else {
        const jsonDb = db.getJsonDb();
        user = jsonDb.users.find(u => u.id === decoded.id);
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
      }

      req.user = user;
      next();
    } catch (e) {
      console.error('Auth middleware error:', e);
      return res.status(500).json({ success: false, message: 'Gagal memverifikasi user.' });
    }
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda membutuhkan hak akses [${allowedRoles.join(', ')}] untuk tindakan ini.`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  authorizeRoles
};
