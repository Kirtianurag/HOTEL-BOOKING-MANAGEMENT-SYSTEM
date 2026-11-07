import Room from '../models/Room.js';
import RoomType from '../models/RoomType.js';
import Reservation from '../models/Reservation.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get all rooms with optional filters
 * @route   GET /api/rooms
 * @access  Public
 */
export const getRooms = asyncHandler(async (req, res, next) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.roomType) {
    filter.roomType = req.query.roomType;
  }
  if (req.query.floor) {
    filter.floor = Number(req.query.floor);
  }

  const rooms = await Room.find(filter).populate('roomType');

  res.status(200).json({
    success: true,
    data: rooms,
  });
});

/**
 * @desc    Get single room by ID
 * @route   GET /api/rooms/:id
 * @access  Public
 */
export const getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('roomType');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Private/Admin
 */
export const createRoom = asyncHandler(async (req, res, next) => {
  // Validate room type exists
  const roomType = await RoomType.findById(req.body.roomType);
  if (!roomType) {
    throw new AppError('Invalid room type. Room type not found.', 400);
  }

  const room = await Room.create(req.body);

  await AuditLog.create({
    userId: req.user._id,
    action: 'ROOM_CREATE',
    entityType: 'Room',
    entityId: room._id,
    description: `Room created: ${room.roomNumber}`,
    newValues: room.toObject(),
  });

  res.status(201).json({
    success: true,
    data: room,
  });
});

/**
 * @desc    Update a room
 * @route   PUT /api/rooms/:id
 * @access  Private/Admin
 */
export const updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const previousValues = room.toObject();

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await AuditLog.create({
    userId: req.user._id,
    action: 'ROOM_UPDATE',
    entityType: 'Room',
    entityId: room._id,
    description: `Room updated: ${room.roomNumber}`,
    previousValues,
    newValues: room.toObject(),
  });

  res.status(200).json({
    success: true,
    data: room,
  });
});

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Private/Admin
 */
export const deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  // Check no active reservations reference this room
  const activeReservationCount = await Reservation.countDocuments({
    room: room._id,
    status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
  });

  if (activeReservationCount > 0) {
    throw new AppError(
      `Cannot delete room. ${activeReservationCount} active reservation(s) exist.`,
      400
    );
  }

  await room.deleteOne();

  await AuditLog.create({
    userId: req.user._id,
    action: 'ROOM_DELETE',
    entityType: 'Room',
    entityId: room._id,
    description: `Room deleted: ${room.roomNumber}`,
    previousValues: room.toObject(),
  });

  res.status(200).json({
    success: true,
    message: 'Room deleted successfully',
  });
});

/**
 * @desc    Update room operational status
 * @route   PATCH /api/rooms/:id/status
 * @access  Private/Admin, Staff
 */
export const updateRoomStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ['available', 'cleaning', 'maintenance', 'inactive'];
  if (!status || !validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      400
    );
  }

  let room = await Room.findById(req.params.id);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const previousStatus = room.status;
  room.status = status;
  await room.save();

  await AuditLog.create({
    userId: req.user._id,
    action: 'ROOM_STATUS_UPDATE',
    entityType: 'Room',
    entityId: room._id,
    description: `Room ${room.roomNumber} status changed from ${previousStatus} to ${status}`,
    previousValues: { status: previousStatus },
    newValues: { status },
  });

  res.status(200).json({
    success: true,
    data: room,
  });
});
