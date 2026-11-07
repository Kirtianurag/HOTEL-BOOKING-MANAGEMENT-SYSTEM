import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get all users with pagination and optional role filter
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get a single user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user role or active status
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const previousValues = {
    role: user.role,
    isActive: user.isActive,
  };

  if (req.body.role !== undefined) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

  await user.save({ validateModifiedOnly: true });

  await AuditLog.create({
    userId: req.user._id,
    action: 'USER_UPDATE',
    entityType: 'User',
    entityId: user._id,
    description: `User updated: ${user.email}`,
    previousValues,
    newValues: { role: user.role, isActive: user.isActive },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Create a staff user
 * @route   POST /api/admin/users/staff
 * @access  Private/Admin
 */
export const createStaff = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with that email already exists', 400);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: 'staff',
  });

  // Remove password from response
  const userData = user.toObject();
  delete userData.password;

  await AuditLog.create({
    userId: req.user._id,
    action: 'STAFF_CREATE',
    entityType: 'User',
    entityId: user._id,
    description: `Staff user created: ${email}`,
    newValues: userData,
  });

  res.status(201).json({
    success: true,
    data: userData,
  });
});
