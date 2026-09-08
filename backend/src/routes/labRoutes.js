const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', labController.getAllLabs);
router.get('/:id', labController.getLabById);
router.post('/', authenticateToken, authorizeRoles('admin'), labController.createLab);
router.put('/:id', authenticateToken, authorizeRoles('admin'), labController.updateLab);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), labController.deleteLab);

module.exports = router;
