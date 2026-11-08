import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import RoomNightLock from '../models/RoomNightLock.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Check in a guest
 * @route   POST /api/staff/:id/checkin
 * @access  Private/Staff, Admin
 */
export const checkIn = asyncHandler(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  if (reservation.status !== 'CONFIRMED') {
    throw new AppError(
      `Cannot check in. Reservation status is ${reservation.status}. Must be CONFIRMED.`,
      400
    );
  }

  // Verify check-in date is today or in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = new Date(reservation.checkIn);
  checkInDate.setHours(0, 0, 0, 0);

  if (checkInDate > today) {
    throw new AppError('Cannot check in before the scheduled check-in date', 400);
  }

  reservation.status = 'CHECKED_IN';
  reservation.checkedInAt = new Date();
  await reservation.save();

  // Mark assigned room as occupied
  if (reservation.room) {
    await Room.findByIdAndUpdate(reservation.room, { status: 'occupied' });
  }

  await AuditLog.create({
    userId: req.user._id,
    action: 'RESERVATION_CHECK_IN',
    entityType: 'Reservation',
    entityId: reservation._id,
    description: `Guest checked in for reservation ${reservation.bookingReference}`,
  });

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

/**
 * @desc    Check out a guest
 * @route   POST /api/staff/:id/checkout
 * @access  Private/Staff, Admin
 */
export const checkOut = asyncHandler(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  if (reservation.status !== 'CHECKED_IN') {
    throw new AppError(
      `Cannot check out. Reservation status is ${reservation.status}. Must be CHECKED_IN.`,
      400
    );
  }

  reservation.status = 'CHECKED_OUT';
  reservation.checkedOutAt = new Date();
  await reservation.save();

  // Mark room as cleaning after checkout
  if (reservation.room) {
    await Room.findByIdAndUpdate(reservation.room, { status: 'cleaning' });
  }

  // Release room-night locks
  await RoomNightLock.deleteMany({ reservation: reservation._id });

  await AuditLog.create({
    userId: req.user._id,
    action: 'RESERVATION_CHECK_OUT',
    entityType: 'Reservation',
    entityId: reservation._id,
    description: `Guest checked out for reservation ${reservation.bookingReference}`,
  });

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

/**
 * @desc    Get today's arrivals (confirmed reservations with checkIn = today)
 * @route   GET /api/staff/arrivals
 * @access  Private/Staff, Admin
 */
export const getTodaysArrivals = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const arrivals = await Reservation.find({
    status: 'CONFIRMED',
    checkIn: { $gte: today, $lt: tomorrow },
  })
    .populate('guest', 'firstName lastName email phone')
    .populate({
      path: 'room',
      populate: { path: 'roomType' },
    });

  res.status(200).json({
    success: true,
    data: arrivals,
  });
});

/**
 * @desc    Get today's departures (checked-in reservations with checkOut = today)
 * @route   GET /api/staff/departures
 * @access  Private/Staff, Admin
 */
export const getTodaysDepartures = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const departures = await Reservation.find({
    status: 'CHECKED_IN',
    checkOut: { $gte: today, $lt: tomorrow },
  })
    .populate('guest', 'firstName lastName email phone')
    .populate({
      path: 'room',
      populate: { path: 'roomType' },
    });

  res.status(200).json({
    success: true,
    data: departures,
  });
});

/**
 * @desc    Search reservations by booking reference or guest name
 * @route   GET /api/staff/search
 * @access  Private/Staff, Admin
 */
export const searchReservations = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    throw new AppError('Please provide a search query', 400);
  }

  // Try to find by booking reference first
  const byReference = await Reservation.find({
    bookingReference: { $regex: q, $options: 'i' },
  })
    .populate('guest', 'firstName lastName email phone')
    .populate({
      path: 'room',
      populate: { path: 'roomType' },
    });

  if (byReference.length > 0) {
    return res.status(200).json({
      success: true,
      data: byReference,
    });
  }

  // Otherwise, search by guest name
  // Find users whose names match the query
  const User = (await import('../models/User.js')).default;
  const matchingUsers = await User.find({
    $or: [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
    ],
  }).select('_id');

  const userIds = matchingUsers.map((u) => u._id);

  const byGuestName = await Reservation.find({
    guest: { $in: userIds },
  })
    .populate('guest', 'firstName lastName email phone')
    .populate({
      path: 'room',
      populate: { path: 'roomType' },
    });

  res.status(200).json({
    success: true,
    data: byGuestName,
  });
});
