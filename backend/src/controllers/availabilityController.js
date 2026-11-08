import availabilityService from '../services/availabilityService.js';
import pricingService from '../services/pricingService.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Search available rooms for given dates
 * @route   GET /api/availability/search
 * @access  Public
 */
export const searchAvailability = asyncHandler(async (req, res, next) => {
  const { checkIn, checkOut, guests, roomType, roomTypeId } = req.query;

  if (!checkIn || !checkOut) {
    throw new AppError('Please provide checkIn and checkOut dates', 400);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate dates
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }

  if (checkInDate < today) {
    throw new AppError('Check-in date cannot be in the past', 400);
  }

  if (checkOutDate <= checkInDate) {
    throw new AppError('Check-out date must be after check-in date', 400);
  }

  const availableRooms = await availabilityService.searchAvailableRooms({
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: guests ? Number(guests) : undefined,
    roomTypeId: roomTypeId || roomType,
  });

  res.status(200).json({
    success: true,
    data: availableRooms,
  });
});

/**
 * @desc    Calculate pricing breakdown for a stay
 * @route   POST /api/availability/pricing
 * @access  Public
 */
export const calculatePricing = asyncHandler(async (req, res, next) => {
  const { roomTypeId, checkIn, checkOut } = req.body;

  if (!roomTypeId || !checkIn || !checkOut) {
    throw new AppError('Please provide roomTypeId, checkIn, and checkOut', 400);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }

  if (checkOutDate <= checkInDate) {
    throw new AppError('Check-out date must be after check-in date', 400);
  }

  const pricing = await pricingService.calculatePricing({
    roomTypeId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
  });

  res.status(200).json({
    success: true,
    data: pricing,
  });
});
