import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { config } from '../config/env.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Generate a signed JWT for a given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Create token, set httpOnly cookie, and send JSON response.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: config.COOKIE_MAX_AGE || 7 * 24 * 60 * 60 * 1000, // default 7 days
  };

  // Remove password from output
  const userData = user.toObject ? user.toObject() : { ...user };
  delete userData.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('A user with that email already exists', 400);
  }

  // Create user with role 'guest' — password hashing handled by model pre-save hook
  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    phone,
    role: 'guest',
  });

  // Create audit log for registration / first login
  await AuditLog.create({
    userId: user._id,
    action: 'USER_REGISTER',
    entityType: 'User',
    entityId: user._id,
    description: `New user registered: ${email}`,
  });

  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide an email and password', 400);
  }

  const normalizedEmail = (email || '').trim().toLowerCase();

  // Find user and include password field for comparison
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Create audit log for login
  await AuditLog.create({
    userId: user._id,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id,
    description: `User logged in: ${email}`,
  });

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Logout user — clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @desc    Update profile (firstName, lastName, phone)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};
  if (req.body.firstName !== undefined) fieldsToUpdate.firstName = req.body.firstName;
  if (req.body.lastName !== undefined) fieldsToUpdate.lastName = req.body.lastName;
  if (req.body.phone !== undefined) fieldsToUpdate.phone = req.body.phone;

  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});
