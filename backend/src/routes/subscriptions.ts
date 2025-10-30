import { Router } from 'express';
import * as subscriptionController from '../controllers/subscriptionController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, subscriptionController.createSubscription);
router.get('/current', requireAuth, subscriptionController.getCurrentSubscription);

export default router;
