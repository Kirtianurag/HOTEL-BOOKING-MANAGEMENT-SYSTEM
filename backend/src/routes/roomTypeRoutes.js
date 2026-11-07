import { Router } from 'express';
import {
  getRoomTypes,
  getRoomType,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} from '../controllers/roomTypeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getRoomTypes);
router.get('/:id', getRoomType);
router.post('/', protect, authorize('admin'), createRoomType);
router.put('/:id', protect, authorize('admin'), updateRoomType);
router.delete('/:id', protect, authorize('admin'), deleteRoomType);

export default router;
