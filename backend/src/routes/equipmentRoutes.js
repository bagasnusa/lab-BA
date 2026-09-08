const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', equipmentController.getAllEquipments);
router.post('/', authenticateToken, authorizeRoles('admin'), equipmentController.createEquipment);
router.put('/:id', authenticateToken, authorizeRoles('admin'), equipmentController.updateEquipment);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), equipmentController.deleteEquipment);

module.exports = router;
