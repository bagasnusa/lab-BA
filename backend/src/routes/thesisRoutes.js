const express = require('express');
const router = express.Router();
const thesisController = require('../controllers/thesisController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public/Helper endpoints
router.get('/students', authenticateToken, thesisController.getStudents);
router.get('/lecturers', authenticateToken, thesisController.getLecturers);

// Mahasiswa endpoints
router.get('/my-supervisor', authenticateToken, thesisController.getMySupervisor);
router.post('/apply-supervisor', authenticateToken, requireRole('mahasiswa'), thesisController.applySupervisor);
router.get('/my-exam', authenticateToken, thesisController.getMyExam);

// Dosen endpoints
router.get('/my-supervision', authenticateToken, thesisController.getMySupervision);
router.post('/respond-supervision', authenticateToken, requireRole('dosen'), thesisController.respondSupervision);
router.get('/my-exams-as-examiner', authenticateToken, thesisController.getMyExamsAsExaminer);

// Admin endpoints - Pembimbing
router.get('/supervisors', authenticateToken, thesisController.getAllSupervisors);
router.post('/supervisors', authenticateToken, requireRole('admin'), thesisController.createSupervisor);
router.put('/supervisors/:id', authenticateToken, requireRole('admin'), thesisController.updateSupervisor);
router.delete('/supervisors/:id', authenticateToken, requireRole('admin'), thesisController.deleteSupervisor);

// Admin endpoints - Jadwal Ujian
router.get('/exams', authenticateToken, thesisController.getAllExams);
router.post('/exams', authenticateToken, requireRole('admin'), thesisController.createExam);
router.put('/exams/:id', authenticateToken, requireRole('admin'), thesisController.updateExam);
router.delete('/exams/:id', authenticateToken, requireRole('admin'), thesisController.deleteExam);

module.exports = router;
