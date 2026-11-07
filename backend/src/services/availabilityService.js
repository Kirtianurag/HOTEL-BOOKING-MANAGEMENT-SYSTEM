/**
 * Availability Service - StayEase Hotel Booking Management System
 *
 * Searches for rooms that are fully available across a requested date
 * range and returns them with pricing information.
 */

import Room from '../models/Room.js';
import RoomNightLock from '../models/RoomNightLock.js';
import { cleanExpiredHolds } from './inventoryLockService.js';
import { calculatePrice } from './pricingService.js';
import { getDatesBetween, normalizeDate } from '../utils/helpers.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Search for rooms available for every night of a requested stay.
 *
 * @param {Object}  params
 * @param {Date|string} params.checkIn    Check-in date.
 * @param {Date|string} params.checkOut   Check-out date.
 * @param {number}  [params.guests]       Minimum occupancy the room must support.
 * @param {import('mongoose').Types.ObjectId|string} [params.roomTypeId] Filter by room type.
 * @returns {Promise<Object[]>} Array of available rooms with pricing.
 */
export const searchAvailableRooms = async ({ checkIn, checkOut, guests, roomTypeId }) => {
  // Clean stale holds before any availability logic
  await cleanExpiredHolds();

  // ── Validate & normalize dates ──
  const parsedCheckIn = normalizeDate(new Date(checkIn));
  const parsedCheckOut = normalizeDate(new Date(checkOut));

  if (isNaN(parsedCheckIn.getTime()) || isNaN(parsedCheckOut.getTime())) {
    throw new AppError('Invalid check-in or check-out date', 400);
  }

  if (parsedCheckOut <= parsedCheckIn) {
    throw new AppError('Check-out date must be after check-in date', 400);
  }

  // ── Build the room query ──
  const roomQuery = {
    status: 'available',
    isActive: true,
  };

  if (roomTypeId) {
    roomQuery.roomType = roomTypeId;
  }

  // Fetch candidate rooms with their room type details
  const rooms = await Room.find(roomQuery).populate('roomType');

  // Filter by guest capacity if specified
  let candidateRooms = rooms;
  if (guests) {
    const guestCount = Number(guests);
    candidateRooms = rooms.filter(
      (room) => room.roomType && room.roomType.maxOccupancy >= guestCount,
    );
  }

  // ── Date array for the requested stay ──
  const stayDates = getDatesBetween(parsedCheckIn, parsedCheckOut);

  // ── Filter out rooms with ANY existing locks on those dates ──
  const availableRooms = [];

  for (const room of candidateRooms) {
    const lockCount = await RoomNightLock.countDocuments({
      room: room._id,
      stayDate: { $in: stayDates },
    });

    if (lockCount === 0) {
      // Room is fully available – compute pricing
      const pricing = await calculatePrice({
        roomType: room.roomType,
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
        roomTypeId: room.roomType._id,
      });

      availableRooms.push({
        room: room.toObject(),
        pricing,
      });
    }
  }

  return availableRooms;
};

export default {
  searchAvailableRooms,
};
