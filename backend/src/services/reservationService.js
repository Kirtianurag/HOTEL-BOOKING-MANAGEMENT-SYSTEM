/**
 * Reservation Service - StayEase Hotel Booking Management System
 *
 * Orchestrates the full reservation lifecycle:
 *   create (HOLD) → confirm (CONFIRMED) → cancel / expire
 */

import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import { calculatePrice } from './pricingService.js';
import { createHold, confirmLocks, releaseLocks, cleanExpiredHolds } from './inventoryLockService.js';
import { createAuditLog } from './auditService.js';
import {
  generateBookingReference,
  generateTransactionId,
  normalizeDate,
} from '../utils/helpers.js';
import { AppError } from '../middleware/errorMiddleware.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. CREATE RESERVATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new reservation in HOLD status.
 */
export const createReservation = async ({
  userId,
  roomId,
  checkIn,
  checkOut,
  numberOfGuests,
  guestDetails,
  idempotencyKey,
}) => {
  // ── Idempotency guard ──
  if (idempotencyKey) {
    const existing = await Reservation.findOne({ idempotencyKey })
      .populate('room')
      .populate('roomType');
    if (existing) return existing;
  }

  // Clean expired holds before doing anything
  await cleanExpiredHolds();

  // ── Fetch & validate room ──
  const room = await Room.findById(roomId).populate('roomType');

  if (!room) {
    throw new AppError('Room not found', 404);
  }
  if (!room.isActive) {
    throw new AppError('Room is not active', 400);
  }
  if (room.status !== 'available') {
    throw new AppError('Room is not currently operational/available', 400);
  }

  // ── Capacity check ──
  if (room.roomType && numberOfGuests > room.roomType.maxOccupancy) {
    throw new AppError(
      `Room capacity exceeded – maximum ${room.roomType.maxOccupancy} guests allowed`,
      400,
    );
  }

  // ── Pricing ──
  const pricing = await calculatePrice({
    roomType: room.roomType,
    checkIn,
    checkOut,
    roomTypeId: room.roomType._id,
  });

  // ── Build the reservation ──
  const bookingReference = generateBookingReference();
  const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const reservation = await Reservation.create({
    bookingReference,
    guest: userId,
    room: roomId,
    roomType: room.roomType._id,
    checkIn: normalizeDate(checkIn),
    checkOut: normalizeDate(checkOut),
    numberOfGuests,
    numberOfNights: pricing.numberOfNights,
    guestDetails,
    status: 'HOLD',
    holdExpiresAt,
    pricing: {
      nightlyRate: pricing.nightlyRate,
      subtotal: pricing.subtotal,
      taxRate: pricing.taxRate,
      taxAmount: pricing.taxAmount,
      totalAmount: pricing.totalAmount,
    },
    payment: {
      method: 'simulated',
      status: 'pending',
    },
    ...(idempotencyKey && { idempotencyKey }),
  });

  // ── Lock the inventory ──
  try {
    await createHold({
      roomId,
      reservationId: reservation._id,
      checkIn,
      checkOut,
      holdMinutes: 10,
    });
  } catch (err) {
    // If lock creation fails (e.g. 409 conflict), delete the pending reservation
    await Reservation.findByIdAndDelete(reservation._id);
    throw err;
  }

  // ── Audit trail ──
  await createAuditLog({
    userId,
    userRole: 'guest',
    action: 'RESERVATION_CREATED',
    entityType: 'Reservation',
    entityId: reservation._id,
    newValues: {
      bookingReference,
      roomId,
      checkIn,
      checkOut,
      totalAmount: pricing.totalAmount,
      status: 'HOLD',
    },
  });

  return reservation;
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONFIRM RESERVATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Confirm a HOLD reservation, simulating payment.
 */
export const confirmReservation = async ({
  reservationId,
  userId,
  paymentMethod = 'simulated',
  idempotencyKey,
}) => {
  const reservation = await Reservation.findById(reservationId)
    .populate('room')
    .populate('roomType');

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  // Ownership check
  if (reservation.guest.toString() !== userId.toString()) {
    throw new AppError('Not authorized to confirm this reservation', 403);
  }

  // Already confirmed check (Idempotent return)
  if (reservation.status === 'CONFIRMED') {
    return reservation;
  }

  // Status check
  if (reservation.status !== 'HOLD') {
    throw new AppError(`Cannot confirm a reservation with status '${reservation.status}'`, 400);
  }

  // Expiry check
  if (reservation.holdExpiresAt && new Date() > reservation.holdExpiresAt) {
    throw new AppError('Hold has expired – please create a new reservation', 410);
  }

  const previousStatus = reservation.status;
  const transactionId = generateTransactionId();
  const now = new Date();

  reservation.status = 'CONFIRMED';
  reservation.confirmedAt = now;
  reservation.holdExpiresAt = undefined;
  reservation.payment = {
    method: paymentMethod,
    status: 'completed',
    transactionId,
    paidAt: now,
  };

  // ── Attempt with MongoDB transaction if replica set is active ──
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    await reservation.save({ session });
    await confirmLocks(reservation._id);
    await session.commitTransaction();
  } catch (txErr) {
    if (session) {
      try { await session.abortTransaction(); } catch (_) {}
      session.endSession();
      session = null;
    }
    // Direct atomic save if transactions unsupported on standalone Mongo
    await reservation.save();
    await confirmLocks(reservation._id);
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // ── Audit trail ──
  await createAuditLog({
    userId,
    userRole: 'guest',
    action: 'RESERVATION_CONFIRMED',
    entityType: 'Reservation',
    entityId: reservation._id,
    previousValues: { status: previousStatus },
    newValues: {
      status: 'CONFIRMED',
      transactionId,
      paymentMethod,
    },
  });

  return reservation;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CANCEL RESERVATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancel a reservation and release its inventory locks.
 */
export const cancelReservation = async ({ reservationId, userId, reason, userRole }) => {
  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  // Ownership check – admin and staff may cancel any reservation
  const isPrivileged = userRole === 'admin' || userRole === 'staff';
  if (!isPrivileged && reservation.guest.toString() !== userId.toString()) {
    throw new AppError('Not authorized to cancel this reservation', 403);
  }

  // Status check – only HOLD and CONFIRMED can be cancelled
  if (!['HOLD', 'CONFIRMED'].includes(reservation.status)) {
    throw new AppError(
      `Cannot cancel a reservation with status '${reservation.status}'`,
      400,
    );
  }

  const previousStatus = reservation.status;

  // Release inventory locks
  await releaseLocks(reservation._id);

  // Update the reservation
  reservation.status = 'CANCELLED';
  reservation.cancelledAt = new Date();
  reservation.cancelReason = reason || 'Cancelled by user';

  // If it was already confirmed, mark payment as refunded
  if (previousStatus === 'CONFIRMED') {
    reservation.payment = {
      ...reservation.payment?.toObject?.() || reservation.payment,
      status: 'refunded',
    };
  }

  await reservation.save();

  // ── Audit trail ──
  await createAuditLog({
    userId,
    userRole: userRole || 'guest',
    action: 'RESERVATION_CANCELLED',
    entityType: 'Reservation',
    entityId: reservation._id,
    previousValues: { status: previousStatus },
    newValues: {
      status: 'CANCELLED',
      cancelReason: reservation.cancelReason,
    },
  });

  return reservation;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET SINGLE RESERVATION
// ─────────────────────────────────────────────────────────────────────────────

export const getReservation = async (paramsOrId, maybeUserId, maybeUserRole) => {
  let reservationId, userId, userRole;
  if (typeof paramsOrId === 'object' && paramsOrId !== null && !paramsOrId._bsontype) {
    reservationId = paramsOrId.reservationId;
    userId = paramsOrId.userId;
    userRole = paramsOrId.userRole;
  } else {
    reservationId = paramsOrId;
    userId = maybeUserId;
    userRole = maybeUserRole;
  }

  const reservation = await Reservation.findById(reservationId)
    .populate('room')
    .populate('roomType')
    .populate('guest', '-password');

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  const isPrivileged = userRole === 'admin' || userRole === 'staff';
  if (!isPrivileged && reservation.guest._id.toString() !== userId.toString()) {
    throw new AppError('Not authorized to view this reservation', 403);
  }

  return reservation;
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET GUEST RESERVATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getGuestReservations = async (paramsOrUserId) => {
  const userId =
    typeof paramsOrUserId === 'object' && paramsOrUserId !== null && !paramsOrUserId._bsontype
      ? paramsOrUserId.userId
      : paramsOrUserId;

  const reservations = await Reservation.find({ guest: userId })
    .populate('room')
    .populate('roomType')
    .sort({ createdAt: -1 });

  return reservations;
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET ALL RESERVATIONS (staff / admin)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllReservations = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    bookingReference,
  } = filters;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (bookingReference) {
    query.bookingReference = { $regex: bookingReference, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [reservations, total] = await Promise.all([
    Reservation.find(query)
      .populate('room')
      .populate('roomType')
      .populate('guest', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Reservation.countDocuments(query),
  ]);

  return {
    reservations,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};

export default {
  createReservation,
  confirmReservation,
  cancelReservation,
  getReservation,
  getGuestReservations,
  getAllReservations,
};
