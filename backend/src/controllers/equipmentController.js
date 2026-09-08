const db = require('../data/db');

exports.getAllEquipments = async (req, res) => {
  try {
    let equipments = [];
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT * FROM `equipments`');
      equipments = rows.map(r => ({
        ...r,
        condition: r.condition_status
      }));
    } else {
      equipments = db.getJsonDb().equipments;
    }
    return res.json({ success: true, data: equipments });
  } catch (err) {
    console.error('getAllEquipments error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data inventaris.' });
  }
};

exports.createEquipment = async (req, res) => {
  const { name, category, total, condition, spec } = req.body;

  if (!name || !total) {
    return res.status(400).json({ success: false, message: 'Nama alat dan jumlah unit wajib diisi.' });
  }

  try {
    const newEq = {
      id: `EQ-${Date.now().toString().slice(-2)}`,
      name,
      category: category || 'Umum',
      total: Number(total),
      available: Number(total),
      condition: condition || 'Sangat Baik',
      spec: spec || ''
    };

    if (db.isConnected && db.pool) {
      await db.pool.query(
        'INSERT INTO `equipments` (id, name, category, total, available, condition_status, spec) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newEq.id, newEq.name, newEq.category, newEq.total, newEq.available, newEq.condition, newEq.spec]
      );
    } else {
      const jsonDb = db.getJsonDb();
      jsonDb.equipments.push(newEq);
      db.saveJsonDb(jsonDb);
    }

    return res.status(201).json({
      success: true,
      message: 'Inventaris alat baru berhasil ditambahkan.',
      data: newEq
    });
  } catch (err) {
    console.error('createEquipment error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan alat.' });
  }
};

exports.updateEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT * FROM `equipments` WHERE `id` = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Alat tidak ditemukan.' });
      }

      const cur = rows[0];
      const updated = {
        name: req.body.name || cur.name,
        category: req.body.category || cur.category,
        total: req.body.total !== undefined ? Number(req.body.total) : cur.total,
        available: req.body.available !== undefined ? Number(req.body.available) : cur.available,
        condition_status: req.body.condition || cur.condition_status,
        spec: req.body.spec !== undefined ? req.body.spec : cur.spec
      };

      await db.pool.query(
        'UPDATE `equipments` SET name = ?, category = ?, total = ?, available = ?, condition_status = ?, spec = ? WHERE id = ?',
        [updated.name, updated.category, updated.total, updated.available, updated.condition_status, updated.spec, id]
      );

      return res.json({
        success: true,
        message: 'Data inventaris alat berhasil diperbarui.',
        data: { id, ...updated, condition: updated.condition_status }
      });
    } else {
      const jsonDb = db.getJsonDb();
      const index = jsonDb.equipments.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Alat tidak ditemukan.' });
      }
      jsonDb.equipments[index] = { ...jsonDb.equipments[index], ...req.body, id };
      db.saveJsonDb(jsonDb);
      return res.json({ success: true, message: 'Data inventaris alat diperbarui.', data: jsonDb.equipments[index] });
    }
  } catch (err) {
    console.error('updateEquipment error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui alat.' });
  }
};

exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    if (db.isConnected && db.pool) {
      const [resDel] = await db.pool.query('DELETE FROM `equipments` WHERE `id` = ?', [id]);
      if (resDel.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Alat tidak ditemukan.' });
      }
    } else {
      const jsonDb = db.getJsonDb();
      const index = jsonDb.equipments.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Alat tidak ditemukan.' });
      }
      jsonDb.equipments.splice(index, 1);
      db.saveJsonDb(jsonDb);
    }

    return res.json({ success: true, message: 'Inventaris alat berhasil dihapus.' });
  } catch (err) {
    console.error('deleteEquipment error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus alat.' });
  }
};
