import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import plansRouter from './routes/plans';
import subscriptionsRouter from './routes/subscriptions';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/subscriptions', subscriptionsRouter);

// Central error handler
app.use(errorHandler);

export default app;
