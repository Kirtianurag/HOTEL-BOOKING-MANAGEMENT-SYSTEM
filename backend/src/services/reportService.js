/**
 * Report Service - StayEase Hotel Booking Management System
 *
 * Provides dashboard statistics, revenue, occupancy, arrivals / departures,
 * and room-type performance reports via MongoDB aggregation pipelines.
 */

import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import RoomNightLock from '../models/RoomNightLock.js';
import { normalizeDate, getDatesBetween } from '../utils/helpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assemble key dashboard metrics for the current day.
 *
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async () => {
  const today = normalizeDate(new Date());
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // Room counts
  const [totalRooms, availableRooms] = await Promise.all([
    Room.countDocuments({ isActive: true }),
    Room.countDocuments({ isActive: true, status: 'available' }),
  ]);

  // Occupied rooms: rooms with a CHECKED_IN reservation that spans today
  const occupiedReservations = await Reservation.find({
    status: 'CHECKED_IN',
    checkIn: { $lte: today },
    checkOut: { $gt: today },
  }).distinct('room');

  const occupiedRooms = occupiedReservations.length;

  // Today's arrivals: CONFIRMED reservations with checkIn = today
  const todayArrivals = await Reservation.countDocuments({
    status: 'CONFIRMED',
    checkIn: { $gte: today, $lt: tomorrow },
  });

  // Today's departures: CHECKED_IN reservations with checkOut = today
  const todayDepartures = await Reservation.countDocuments({
    status: 'CHECKED_IN',
    checkOut: { $gte: today, $lt: tomorrow },
  });

  // Total active reservations (non-cancelled)
  const totalReservations = await Reservation.countDocuments({
    status: { $ne: 'CANCELLED' },
  });

  // Total revenue (CONFIRMED + CHECKED_IN + CHECKED_OUT)
  const revenueAgg = await Reservation.aggregate([
    {
      $match: {
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    todayArrivals,
    todayDepartures,
    totalReservations,
    totalRevenue,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. REVENUE REPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Daily revenue breakdown within a date range.
 *
 * @param {Object}  params
 * @param {Date|string} params.startDate
 * @param {Date|string} params.endDate
 * @returns {Promise<Object>} { dailyBreakdown, totalRevenue }
 */
export const getRevenueReport = async ({ startDate, endDate }) => {
  const start = normalizeDate(new Date(startDate));
  const end = normalizeDate(new Date(endDate));

  const pipeline = [
    {
      $match: {
        status: { $nin: ['CANCELLED', 'HOLD'] },
        checkIn: { $lte: end },
        checkOut: { $gte: start },
      },
    },
    {
      // Use confirmedAt (or createdAt as fallback) to bucket revenue by day
      $addFields: {
        revenueDate: {
          $ifNull: ['$confirmedAt', '$createdAt'],
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$revenueDate' },
        },
        dailyRevenue: { $sum: '$totalAmount' },
        bookingCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: '$dailyRevenue',
        bookings: '$bookingCount',
      },
    },
  ];

  const dailyBreakdown = await Reservation.aggregate(pipeline);

  const totalRevenue = dailyBreakdown.reduce((sum, d) => sum + d.revenue, 0);

  return { dailyBreakdown, totalRevenue };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. OCCUPANCY REPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Daily occupancy rate within a date range.
 *
 * @param {Object}  params
 * @param {Date|string} params.startDate
 * @param {Date|string} params.endDate
 * @returns {Promise<Object>} { dailyBreakdown, averageOccupancy }
 */
export const getOccupancyReport = async ({ startDate, endDate }) => {
  const start = normalizeDate(new Date(startDate));
  const end = normalizeDate(new Date(endDate));

  // Total sellable rooms (active rooms with status 'available' or 'occupied')
  const totalSellableRooms = await Room.countDocuments({
    isActive: true,
    status: { $in: ['available', 'occupied'] },
  });

  if (totalSellableRooms === 0) {
    return { dailyBreakdown: [], averageOccupancy: 0 };
  }

  // Generate every date in the range
  const dates = getDatesBetween(start, end);
  const dailyBreakdown = [];

  for (const date of dates) {
    const occupiedCount = await RoomNightLock.countDocuments({
      stayDate: date,
      status: 'confirmed',
    });

    const occupancyRate = Math.round((occupiedCount / totalSellableRooms) * 10000) / 100; // two decimals

    dailyBreakdown.push({
      date: date.toISOString().split('T')[0],
      occupiedRooms: occupiedCount,
      totalSellableRooms,
      occupancyRate,
    });
  }

  const averageOccupancy =
    dailyBreakdown.length > 0
      ? Math.round(
          (dailyBreakdown.reduce((sum, d) => sum + d.occupancyRate, 0) /
            dailyBreakdown.length) *
            100,
        ) / 100
      : 0;

  return { dailyBreakdown, averageOccupancy };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. UPCOMING ARRIVALS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CONFIRMED reservations arriving in the next N days.
 *
 * @param {number} [days=7]
 * @returns {Promise<Object[]>}
 */
export const getUpcomingArrivals = async (days = 7) => {
  const today = normalizeDate(new Date());
  const futureDate = new Date(today);
  futureDate.setUTCDate(futureDate.getUTCDate() + days);

  const arrivals = await Reservation.find({
    status: 'CONFIRMED',
    checkIn: { $gte: today, $lt: futureDate },
  })
    .populate('room')
    .populate('roomType')
    .populate('user', '-password')
    .sort({ checkIn: 1 });

  return arrivals;
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. UPCOMING DEPARTURES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CHECKED_IN reservations departing in the next N days.
 *
 * @param {number} [days=7]
 * @returns {Promise<Object[]>}
 */
export const getUpcomingDepartures = async (days = 7) => {
  const today = normalizeDate(new Date());
  const futureDate = new Date(today);
  futureDate.setUTCDate(futureDate.getUTCDate() + days);

  const departures = await Reservation.find({
    status: 'CHECKED_IN',
    checkOut: { $gte: today, $lt: futureDate },
  })
    .populate('room')
    .populate('roomType')
    .populate('user', '-password')
    .sort({ checkOut: 1 });

  return departures;
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. ROOM TYPE PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Revenue and booking count grouped by room type within a date range.
 *
 * @param {Object}  params
 * @param {Date|string} params.startDate
 * @param {Date|string} params.endDate
 * @returns {Promise<Object[]>}
 */
export const getRoomTypePerformance = async ({ startDate, endDate }) => {
  const start = normalizeDate(new Date(startDate));
  const end = normalizeDate(new Date(endDate));

  const pipeline = [
    {
      $match: {
        status: { $nin: ['CANCELLED', 'HOLD'] },
        checkIn: { $lte: end },
        checkOut: { $gte: start },
      },
    },
    {
      $group: {
        _id: '$roomType',
        totalRevenue: { $sum: '$totalAmount' },
        bookingCount: { $sum: 1 },
        averageRate: { $avg: '$nightlyRate' },
        totalNights: { $sum: '$numberOfNights' },
      },
    },
    {
      $lookup: {
        from: 'roomtypes',
        localField: '_id',
        foreignField: '_id',
        as: 'roomTypeInfo',
      },
    },
    { $unwind: '$roomTypeInfo' },
    {
      $project: {
        _id: 0,
        roomTypeId: '$_id',
        roomTypeName: '$roomTypeInfo.name',
        totalRevenue: 1,
        bookingCount: 1,
        averageRate: { $round: ['$averageRate', 2] },
        totalNights: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ];

  const performance = await Reservation.aggregate(pipeline);
  return performance;
};

export default {
  getDashboardStats,
  getRevenueReport,
  getOccupancyReport,
  getUpcomingArrivals,
  getUpcomingDepartures,
  getRoomTypePerformance,
};
