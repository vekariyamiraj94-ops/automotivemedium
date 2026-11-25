import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user (Restricted - Public Admin Registration Prohibited)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, username, email, password, role, phone, serviceCentre } = req.body;

  // Strict Security: Do not allow public admin registration
  if (role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Security Alert: Public admin registration is strictly disabled.',
    });
  }

  const userExists = await User.findOne({
    $or: [{ email: email?.toLowerCase() }, { username: username?.toLowerCase() }],
  });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists with this email or username' });
  }

  const user = await User.create({
    name,
    username: username || email?.split('@')[0],
    email: email?.toLowerCase(),
    password,
    role: role || 'service_advisor',
    phone: phone || '',
    serviceCentre: serviceCentre || null,
  });

  const token = generateToken(user._id);

  // Set HTTP-only Cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    },
  });
};

// @desc    Login user & get token (Stored in secure HTTP-only Cookie)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const identifier = (req.body.username || req.body.email || '').trim().toLowerCase();
  const password = req.body.password;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username/email and password',
    });
  }

  // Find user by either email, username, or 'admin' keyword
  let user;
  if (identifier === 'admin') {
    user = await User.findOne({
      $or: [{ role: 'admin' }, { username: 'admin' }, { email: 'admin@automotivemedium.com' }],
    }).select('+password');
  } else {
    user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');
  }

  // Verify user and password with bcrypt
  let isMatch = false;
  if (user) {
    isMatch = await user.matchPassword(password);
    // User requested tolerance for 'admin@123' and 'Admin@123'
    if (!isMatch && (password === 'admin@123' || password === 'Admin@123')) {
      isMatch = await user.matchPassword('Admin@123') || await user.matchPassword('admin@123');
    }
  }

  if (!user || !isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username/email or password',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated. Contact System Administrator.',
    });
  }

  const token = generateToken(user._id);

  // Set HTTP-Only Cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      username: user.username || 'admin',
      email: user.email,
      role: user.role,
      token,
    },
  });
};

// @desc    Logout user & clear HTTP-Only Cookie
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('serviceCentre');
  res.json({ success: true, data: user });
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
export const getUsers = async (req, res) => {
  const users = await User.find().select('-password').populate('serviceCentre');
  res.json({ success: true, count: users.length, data: users });
};
