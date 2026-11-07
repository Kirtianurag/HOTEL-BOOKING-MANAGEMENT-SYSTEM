import reservationService from '../services/reservationService.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Create a new reservation
 * @route   POST /api/reservations
 * @access  Private
 */
export const createReservation = asyncHandler(async (req, res, next) => {
  const { roomId, checkIn, checkOut, numberOfGuests, guestDetails, idempotencyKey } = req.body;

  const reservation = await reservationService.createReservation({
    userId: req.user._id,
    roomId,
    checkIn,
    checkOut,
    numberOfGuests,
    guestDetails,
    idempotencyKey,
  });

  res.status(201).json({
    success: true,
    data: reservation,
  });
});

/**
 * @desc    Confirm a reservation (process payment)
 * @route   POST /api/reservations/:id/confirm
 * @access  Private
 */
export const confirmReservation = asyncHandler(async (req, res, next) => {
  const { paymentMethod, idempotencyKey } = req.body;

  const reservation = await reservationService.confirmReservation({
    reservationId: req.params.id,
    userId: req.user._id,
    paymentMethod,
    idempotencyKey,
  });

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

/**
 * @desc    Cancel a reservation
 * @route   POST /api/reservations/:id/cancel
 * @access  Private
 */
export const cancelReservation = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const reservation = await reservationService.cancelReservation({
    reservationId: req.params.id,
    userId: req.user._id,
    reason,
  });

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

/**
 * @desc    Get a single reservation
 * @route   GET /api/reservations/:id
 * @access  Private
 */
export const getReservation = asyncHandler(async (req, res, next) => {
  const reservation = await reservationService.getReservation({
    reservationId: req.params.id,
    userId: req.user._id,
    userRole: req.user.role,
  });

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

/**
 * @desc    Get current user's reservations
 * @route   GET /api/reservations/my
 * @access  Private
 */
export const getMyReservations = asyncHandler(async (req, res, next) => {
  const reservations = await reservationService.getGuestReservations({
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: reservations,
  });
});

/**
 * @desc    Get all reservations (staff/admin)
 * @route   GET /api/reservations/all
 * @access  Private/Staff, Admin
 */
export const getAllReservations = asyncHandler(async (req, res, next) => {
  const { page, limit, status, search } = req.query;

  const result = await reservationService.getAllReservations({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    status,
    search,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
