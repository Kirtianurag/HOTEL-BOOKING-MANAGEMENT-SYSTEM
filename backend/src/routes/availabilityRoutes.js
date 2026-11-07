import { Router } from 'express';
import {
  searchAvailability,
  calculatePricing,
} from '../controllers/availabilityController.js';

const router = Router();

router.get('/search', searchAvailability);
router.post('/pricing', calculatePricing);

export default router;
