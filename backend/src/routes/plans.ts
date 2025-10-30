import { Router } from 'express';
import * as planController from '../controllers/planController';

const router = Router();

router.get('/', planController.listPlans);

export default router;
