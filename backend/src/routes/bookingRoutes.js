const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public or optional auth for viewing bookings/schedule
router.get('/', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, bookingController.getAllBookings);

router.get('/:id', bookingController.getBookingById);

// Protected routes
router.post('/', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, bookingController.createBooking);

router.patch('/:id/status', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, bookingController.updateBookingStatus);

router.post('/checkin', bookingController.checkInByQR);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
