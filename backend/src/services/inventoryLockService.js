/**
 * Inventory Lock Service - StayEase Hotel Booking Management System
 *
 * CRITICAL SERVICE — prevents double-booking by managing per-room-night
 * lock documents (RoomNightLock).
 *
 * Hold → Confirm → Release lifecycle:
 *   1. createHold()        – inserts lock docs with status "hold" + TTL
 *   2. confirmLocks()      – promotes locks to "confirmed" (permanent)
 *   3. releaseLocks()      – removes lock docs (cancellation)
 *   4. cleanExpiredHolds() – garbage-collects stale holds
 *   5. checkAvailability() – verifies a room is free for a date range
 */

import mongoose from 'mongoose';
import RoomNightLock from '../models/RoomNightLock.js';
import Reservation from '../models/Reservation.js';
import { getDatesBetween } from '../utils/helpers.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Remove all expired hold locks and cancel their corresponding reservations.
 *
 * This MUST be called before any availability check to ensure stale holds
 * do not block inventory.
 */
export const cleanExpiredHolds = async () => {
  const now = new Date();

  // Delete expired RoomNightLock holds
  await RoomNightLock.deleteMany({
    status: 'hold',
    expiresAt: { $lt: now },
  });

  // Cancel reservations whose holds have expired
  await Reservation.updateMany(
    {
      status: 'HOLD',
      holdExpiresAt: { $lt: now },
    },
    {
      $set: {
        status: 'CANCELLED',
        cancelledAt: now,
        cancelReason: 'Hold expired – payment not completed in time',
      },
    },
  );
};

/**
 * Create hold locks for a room across a date range.
 *
 * Uses MongoDB transactions when replica sets are enabled, and falls back to
 * database-level compound unique constraint { room: 1, stayDate: 1 } for atomicity
 * in standalone environments.
 * A duplicate-key error (11000) means the room is already locked for
 * at least one of those nights → 409 Conflict.
 */
export const createHold = async ({ roomId, reservationId, checkIn, checkOut, holdMinutes = 10 }) => {
  const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);
  const dates = getDatesBetween(checkIn, checkOut);

  const lockDocs = dates.map((date) => ({
    room: roomId,
    reservation: reservationId,
    stayDate: date,
    status: 'hold',
    expiresAt,
  }));

  try {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      const createdLocks = await RoomNightLock.insertMany(lockDocs, { session });
      await session.commitTransaction();
      return createdLocks;
    } catch (txErr) {
      if (session) {
        try { await session.abortTransaction(); } catch (_) {}
      }

      // If standalone Mongo environment without replica set, execute atomic insert directly
      const isReplicaSetError =
        txErr.message?.includes('Transaction numbers are only allowed') ||
        txErr.message?.includes('replica set member') ||
        txErr.message?.includes('retryable writes') ||
        txErr.errmsg?.includes('replica set member');

      if (isReplicaSetError) {
        const createdLocks = await RoomNightLock.insertMany(lockDocs);
        return createdLocks;
      }
      throw txErr;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  } catch (error) {
    // Clean up partial locks if any
    try {
      await RoomNightLock.deleteMany({ reservation: reservationId });
    } catch (_) {}

    // Duplicate key (E11000) on unique compound index { room: 1, stayDate: 1 }
    // proves the room is already held or booked for this date!
    if (
      error.code === 11000 ||
      (error.writeErrors && error.writeErrors.some((e) => e.code === 11000)) ||
      error.message?.includes('E11000') ||
      error.errmsg?.includes('E11000')
    ) {
      throw new AppError('Room not available for selected dates', 409);
    }

    throw error;
  }
};

/**
 * Promote all hold locks for a reservation to "confirmed" (permanent).
 */
export const confirmLocks = async (reservationId) => {
  const result = await RoomNightLock.updateMany(
    { reservation: reservationId },
    {
      $set: { status: 'confirmed' },
      $unset: { expiresAt: '' },
    },
  );

  return result;
};

/**
 * Remove all lock documents for a reservation (used on cancellation).
 */
export const releaseLocks = async (reservationId) => {
  const result = await RoomNightLock.deleteMany({ reservation: reservationId });
  return result;
};

/**
 * Check whether a room is available for every night in a date range.
 */
export const checkAvailability = async ({ roomId, checkIn, checkOut }) => {
  await cleanExpiredHolds();

  const dates = getDatesBetween(checkIn, checkOut);

  const existingLock = await RoomNightLock.findOne({
    room: roomId,
    stayDate: { $in: dates },
  });

  return !existingLock;
};

export default {
  cleanExpiredHolds,
  createHold,
  confirmLocks,
  releaseLocks,
  checkAvailability,
};
