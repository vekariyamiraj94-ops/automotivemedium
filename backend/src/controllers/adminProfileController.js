import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

/**
 * @desc   Get current Admin Profile
 * @route  GET /api/admin/profile
 * @access Private (Admin only)
 */
export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('serviceCentre', 'name city code');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin profile not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update Admin Profile (Name, Username, Email, Phone, Avatar)
 * @route  PUT /api/admin/profile
 * @access Private (Admin only)
 */
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, username, email, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Check username uniqueness if changed
    if (username && username.toLowerCase() !== user.username) {
      const usernameExists = await User.findOne({
        username: username.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken by another account.',
        });
      }
      user.username = username.toLowerCase().trim();
    }

    // Check email uniqueness if changed
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another user.',
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('serviceCentre', 'name city code');

    res.json({
      success: true,
      message: 'Admin profile updated successfully!',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Change Admin Password securely with bcrypt
 * @route  PUT /api/admin/change-password
 * @access Private (Admin only)
 */
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Current, New, and Confirm Password) are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation password do not match.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long for security.',
      });
    }

    // Fetch user with hashed password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isCurrentMatch = await user.matchPassword(currentPassword);
    if (!isCurrentMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password. Please re-enter your current password.',
      });
    }

    // Set new password (pre-save hook will hash with bcrypt)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully! Please use your new password for future sign-ins.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update Admin Account & Notification Preferences
 * @route  PUT /api/admin/settings
 * @access Private (Admin only)
 */
export const updateAdminSettings = async (req, res) => {
  try {
    const { notifications, language, dateFormat } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (notifications) {
      user.notifications = {
        emailNotifications: notifications.emailNotifications ?? user.notifications.emailNotifications,
        bookingNotifications: notifications.bookingNotifications ?? user.notifications.bookingNotifications,
        lowStockAlerts: notifications.lowStockAlerts ?? user.notifications.lowStockAlerts,
        serviceUpdates: notifications.serviceUpdates ?? user.notifications.serviceUpdates,
      };
    }

    if (language) user.language = language;
    if (dateFormat) user.dateFormat = dateFormat;

    await user.save();

    res.json({
      success: true,
      message: 'Account preferences updated successfully!',
      data: {
        notifications: user.notifications,
        language: user.language,
        dateFormat: user.dateFormat,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Admin Logout & Invalidate Session Cookie
 * @route  POST /api/admin/logout
 * @access Private
 */
export const adminLogout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });

  res.json({
    success: true,
    message: 'Admin logged out successfully.',
  });
};
