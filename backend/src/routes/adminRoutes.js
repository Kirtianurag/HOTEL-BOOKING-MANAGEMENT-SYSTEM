import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  createStaff,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// All routes require admin
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.post('/users/staff', createStaff);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);

export default router;
