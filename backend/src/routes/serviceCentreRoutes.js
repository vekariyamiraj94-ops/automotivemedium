import express from 'express';
import {
  getServiceCentres,
  createServiceCentre,
  updateServiceCentre,
  deleteServiceCentre,
} from '../controllers/serviceCentreController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getServiceCentres).post(protect, authorize('admin'), createServiceCentre);
router
  .route('/:id')
  .put(protect, authorize('admin'), updateServiceCentre)
  .delete(protect, authorize('admin'), deleteServiceCentre);

export default router;
