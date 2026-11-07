import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodaysArrivals,
  getTodaysDepartures,
  searchReservations,
} from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// All routes require staff or admin
router.use(protect, authorize('staff', 'admin'));

router.get('/arrivals', getTodaysArrivals);
router.get('/departures', getTodaysDepartures);
router.get('/search', searchReservations);
router.post('/:id/checkin', checkIn);
router.post('/:id/checkout', checkOut);

export default router;
