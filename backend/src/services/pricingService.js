/**
 * Pricing Service - StayEase Hotel Booking Management System
 *
 * Calculates the total price for a stay based on per-night rate rules
 * and a fixed 12 % tax rate.
 */

import RateRule from '../models/RateRule.js';
import { calculateNights, getDatesBetween, normalizeDate } from '../utils/helpers.js';

/** Fixed tax rate (12 %) */
const TAX_RATE = 0.12;

/**
 * Calculate the full price breakdown for a stay.
 *
 * For each night, the service checks whether a RateRule override exists
 * for that specific date and room type. If no override is found the
 * room type's base rate is used.
 *
 * @param {Object}  params
 * @param {Object}  params.roomType    Populated RoomType document (must include baseRate).
 * @param {Date|string} params.checkIn  Check-in date.
 * @param {Date|string} params.checkOut Check-out date.
 * @param {import('mongoose').Types.ObjectId|string} [params.roomTypeId] Room type ID (falls back to roomType._id).
 * @returns {Promise<Object>} Price breakdown.
 */
export const calculatePrice = async ({ roomType, checkIn, checkOut, roomTypeId }) => {
  const typeId = roomTypeId || roomType._id;
  const numberOfNights = calculateNights(checkIn, checkOut);
  const nights = getDatesBetween(checkIn, checkOut);

  // Fetch all active rate rules that overlap with the stay dates
  const normalizedStart = normalizeDate(checkIn);
  const normalizedEnd = normalizeDate(checkOut);

  const rateRules = await RateRule.find({
    roomType: typeId,
    isActive: true,
    startDate: { $lte: normalizedEnd },
    endDate: { $gte: normalizedStart },
  });

  // Build the per-night breakdown
  const nightlyBreakdown = nights.map((nightDate) => {
    const normalized = normalizeDate(nightDate);

    // Look for a rate rule whose date range covers this night
    const matchingRule = rateRules.find((rule) => {
      const ruleStart = normalizeDate(rule.startDate);
      const ruleEnd = normalizeDate(rule.endDate);
      return normalized >= ruleStart && normalized <= ruleEnd;
    });

    // RateRule uses nightlyRate (fallback to rate or roomType.baseRate)
    const rawRate = matchingRule
      ? (matchingRule.nightlyRate ?? matchingRule.rate)
      : (roomType?.baseRate ?? 0);
    const rate = Number(rawRate) || 0;
    const ruleName = matchingRule ? matchingRule.name : null;

    return {
      date: normalized,
      rate,
      ruleName,
    };
  });

  // Totals
  const subtotal = Math.round(nightlyBreakdown.reduce((sum, n) => sum + (Number(n.rate) || 0), 0) * 100) / 100;
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100; // round to cents
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    nightlyRate: Number(roomType?.baseRate ?? (nightlyBreakdown[0]?.rate ?? 0)),
    nightlyBreakdown,
    numberOfNights,
    subtotal,
    taxRate: TAX_RATE,
    taxAmount,
    totalAmount,
  };
};

export default {
  calculatePrice,
};
