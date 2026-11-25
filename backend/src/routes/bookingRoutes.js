import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBookings).post(protect, createBooking);
router
  .route('/:id')
  .get(getBookingById)
  .put(protect, updateBooking)
  .delete(protect, authorize('admin'), deleteBooking);

export default router;
