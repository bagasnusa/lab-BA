const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/quick-login', authController.quickLogin);
router.post('/register', authController.register);
router.get('/me', authenticateToken, authController.getMe);
router.get('/users', authController.getAllUsers);
router.get('/lecturers', authController.getLecturers);

module.exports = router;
