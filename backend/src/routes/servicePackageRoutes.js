import express from 'express';
import {
  getServicePackages,
  createServicePackage,
  updateServicePackage,
  deleteServicePackage,
} from '../controllers/servicePackageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getServicePackages).post(protect, authorize('admin'), createServicePackage);
router
  .route('/:id')
  .put(protect, authorize('admin'), updateServicePackage)
  .delete(protect, authorize('admin'), deleteServicePackage);

export default router;
