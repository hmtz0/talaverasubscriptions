import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProjectSchema } from '../schemas/project.schema';
import * as projectController from '../controllers/projectController';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', projectController.listProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);
router.delete('/:id', projectController.deleteProject);

export default router;
