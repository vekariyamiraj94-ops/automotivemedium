import express from 'express';
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminSettings,
  adminLogout,
} from '../controllers/adminProfileController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Logout endpoint to clear HTTP-only cookie
router.post('/logout', adminLogout);

// Protect all admin profile routes for authenticated admins
router.use(protect, authorize('admin'));

router.route('/profile')
  .get(getAdminProfile)
  .put(updateAdminProfile);

router.put('/change-password', changeAdminPassword);
router.put('/settings', updateAdminSettings);

export default router;
