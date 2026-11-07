/**
 * Utility Helpers - StayEase Hotel Booking Management System
 *
 * Pure / near-pure helper functions used across multiple services.
 */

import crypto from 'crypto';

/**
 * Generate a unique booking reference.
 * Format: SE-YYYYMMDD-XXXX  (e.g. SE-20261107-A3F9)
 *
 * @returns {string} Booking reference string.
 */
export const generateBookingReference = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // 4 random alphanumeric characters (uppercase)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    randomPart += chars[randomBytes[i] % chars.length];
  }

  return `SE-${datePart}-${randomPart}`;
};

/**
 * Calculate the number of nights between two dates.
 *
 * @param {Date|string} checkIn  Check-in date.
 * @param {Date|string} checkOut Check-out date.
 * @returns {number} Number of nights (always >= 0).
 */
export const calculateNights = (checkIn, checkOut) => {
  const start = normalizeDate(new Date(checkIn));
  const end = normalizeDate(new Date(checkOut));
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
};

/**
 * Get an array of dates between checkIn (inclusive) and checkOut (exclusive).
 * Each date is normalized to midnight UTC.
 *
 * @param {Date|string} checkIn  Start date (inclusive).
 * @param {Date|string} checkOut End date (exclusive).
 * @returns {Date[]} Array of Date objects at midnight UTC.
 */
export const getDatesBetween = (checkIn, checkOut) => {
  const dates = [];
  const current = normalizeDate(new Date(checkIn));
  const end = normalizeDate(new Date(checkOut));

  while (current < end) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

/**
 * Generate a simulated transaction ID.
 * Format: TXN-XXXXXXXXXXXXX  (13 random hex characters)
 *
 * @returns {string} Transaction ID string.
 */
export const generateTransactionId = () => {
  const randomHex = crypto.randomBytes(7).toString('hex').toUpperCase().slice(0, 13);
  return `TXN-${randomHex}`;
};

/**
 * Normalize a date to midnight UTC (strips the time component).
 *
 * @param {Date|string} date  The date to normalize.
 * @returns {Date} A new Date object set to 00:00:00.000 UTC.
 */
export const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
