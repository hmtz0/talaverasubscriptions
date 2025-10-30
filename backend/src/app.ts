import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRouter from './routes/auth';
import tasksRouter from './routes/tasks';
import projectsRouter from './routes/projects';
import plansRouter from './routes/plans';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/plans', plansRouter);

// Central error handler
app.use(errorHandler);

export default app;
