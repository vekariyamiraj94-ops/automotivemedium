import express from 'express';
import {
  getInventoryParts,
  createInventoryPart,
  updateInventoryPart,
  deleteInventoryPart,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getInventoryParts)
  .post(protect, authorize('admin', 'service_advisor'), createInventoryPart);
router
  .route('/:id')
  .put(protect, authorize('admin', 'service_advisor'), updateInventoryPart)
  .delete(protect, authorize('admin'), deleteInventoryPart);

export default router;
