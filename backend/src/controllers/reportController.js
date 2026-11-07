import reportService from '../services/reportService.js';
import AppError from '../middleware/errorMiddleware.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/reports/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const stats = await reportService.getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Get revenue report
 * @route   GET /api/reports/revenue
 * @access  Private/Admin
 */
export const getRevenueReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 30);
  const defaultEnd = new Date(now);
  defaultEnd.setDate(defaultEnd.getDate() + 30);

  const start = startDate ? new Date(startDate) : defaultStart;
  const end = endDate ? new Date(endDate) : defaultEnd;

  const report = await reportService.getRevenueReport({
    startDate: start,
    endDate: end,
  });

  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * @desc    Get occupancy report
 * @route   GET /api/reports/occupancy
 * @access  Private/Admin
 */
export const getOccupancyReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 7);
  const defaultEnd = new Date(now);
  defaultEnd.setDate(defaultEnd.getDate() + 7);

  const start = startDate ? new Date(startDate) : defaultStart;
  const end = endDate ? new Date(endDate) : defaultEnd;

  const report = await reportService.getOccupancyReport({
    startDate: start,
    endDate: end,
  });

  res.status(200).json({
    success: true,
    data: report,
  });
});

/**
 * @desc    Get upcoming arrivals
 * @route   GET /api/reports/arrivals
 * @access  Private/Admin
 */
export const getArrivals = asyncHandler(async (req, res, next) => {
  const days = req.query.days ? Number(req.query.days) : 7;

  const arrivals = await reportService.getUpcomingArrivals({ days });

  res.status(200).json({
    success: true,
    data: arrivals,
  });
});

/**
 * @desc    Get upcoming departures
 * @route   GET /api/reports/departures
 * @access  Private/Admin
 */
export const getDepartures = asyncHandler(async (req, res, next) => {
  const days = req.query.days ? Number(req.query.days) : 7;

  const departures = await reportService.getUpcomingDepartures({ days });

  res.status(200).json({
    success: true,
    data: departures,
  });
});

/**
 * @desc    Get room type performance report
 * @route   GET /api/reports/room-types
 * @access  Private/Admin
 */
export const getRoomTypePerformance = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 30);
  const defaultEnd = new Date(now);
  defaultEnd.setDate(defaultEnd.getDate() + 30);

  const start = startDate ? new Date(startDate) : defaultStart;
  const end = endDate ? new Date(endDate) : defaultEnd;

  const report = await reportService.getRoomTypePerformance({
    startDate: start,
    endDate: end,
  });

  res.status(200).json({
    success: true,
    data: report,
  });
});
