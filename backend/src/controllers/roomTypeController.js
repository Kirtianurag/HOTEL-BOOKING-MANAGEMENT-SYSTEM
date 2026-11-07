import RoomType from '../models/RoomType.js';
import Room from '../models/Room.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get all room types
 * @route   GET /api/room-types
 * @access  Public
 */
export const getRoomTypes = asyncHandler(async (req, res, next) => {
  const filter = {};
  if (req.query.activeOnly === 'true') {
    filter.isActive = true;
  }

  const roomTypes = await RoomType.find(filter);

  res.status(200).json({
    success: true,
    data: roomTypes,
  });
});

/**
 * @desc    Get single room type by ID
 * @route   GET /api/room-types/:id
 * @access  Public
 */
export const getRoomType = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.findById(req.params.id);

  if (!roomType) {
    throw new AppError('Room type not found', 404);
  }

  res.status(200).json({
    success: true,
    data: roomType,
  });
});

/**
 * @desc    Create a new room type
 * @route   POST /api/room-types
 * @access  Private/Admin
 */
export const createRoomType = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.create(req.body);

  await AuditLog.create({
    userId: req.user._id,
    action: 'ROOM_TYPE_CREATE',
    entityType: 'RoomType',
    entityId: roomType._id,
    description: `Room type created: ${roomType.name}`,
    newValues: roomType.toObject(),
  });

  res.status(201).json({
    success: true,
    data: roomType,
  });
});

/**
 * @desc    Update a room type
 * @route   PUT /api/room-types/:id
 * @access  Private/Admin
 */
export const updateRoomType = asyncHandler(async (req, res, next) => {
  let roomType = await RoomType.findById(req.params.id);

  if (!roomType) {
    throw new AppError('Room type not found', 404);
  }

  const previousValues = roomType.toObject();

  roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await AuditLog.create({
    userId: req.user._id,
    action: 'ROOM_TYPE_UPDATE',
    entityType: 'RoomType',
    entityId: roomType._id,
    description: `Room type updated: ${roomType.name}`,
    previousValues,
    newValues: roomType.toObject(),
  });

  res.status(200).json({
    success: true,
    data: roomType,
  });
});

/**
 * @desc    Delete a room type
 * @route   DELETE /api/room-types/:id
 * @access  Private/Admin
 */
export const deleteRoomType = asyncHandler(async (req, res, next) => {
  const roomType = await RoomType.findById(req.params.id);

  if (!roomType) {
    throw new AppError('Room type not found', 404);
  }

  // Check that no rooms reference this type
  const roomCount = await Room.countDocuments({ roomType: roomType._id });
  if (roomCount > 0) {
    throw new AppError(
      `Cannot delete room type. ${roomCount} room(s) still reference this type.`,
      400
    );
  }

  await roomType.deleteOne();

  await AuditLog.create({
    userId: req.user._id,
    action: 'ROOM_TYPE_DELETE',
    entityType: 'RoomType',
    entityId: roomType._id,
    description: `Room type deleted: ${roomType.name}`,
    previousValues: roomType.toObject(),
  });

  res.status(200).json({
    success: true,
    message: 'Room type deleted successfully',
  });
});
