import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// All routes require admin
router.use(protect, authorize('admin'));

router.get('/', getAuditLogs);

export default router;
