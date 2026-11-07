import { Router } from 'express';
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  getReservation,
  getMyReservations,
  getAllReservations,
} from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/all', protect, authorize('admin', 'staff'), getAllReservations);
router.get('/:id', protect, getReservation);
router.post('/:id/confirm', protect, confirmReservation);
router.post('/:id/cancel', protect, cancelReservation);

export default router;
