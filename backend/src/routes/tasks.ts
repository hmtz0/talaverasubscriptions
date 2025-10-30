import { Router } from 'express';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { validate } from '../middleware/validate';
import { taskCreateSchema, taskUpdateSchema } from '../schemas/task.schema';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', validate(taskCreateSchema), createTask);
router.get('/', listTasks);
router.get('/:id', getTask);
router.patch('/:id', validate(taskUpdateSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
