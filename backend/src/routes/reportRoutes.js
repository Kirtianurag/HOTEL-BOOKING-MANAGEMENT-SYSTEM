import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueReport,
  getOccupancyReport,
  getArrivals,
  getDepartures,
  getRoomTypePerformance,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// All routes require admin
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReport);
router.get('/occupancy', getOccupancyReport);
router.get('/arrivals', getArrivals);
router.get('/departures', getDepartures);
router.get('/room-types', getRoomTypePerformance);

export default router;
