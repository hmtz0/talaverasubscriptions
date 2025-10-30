import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRouter from './routes/auth';
import tasksRouter from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);

// Central error handler
app.use(errorHandler);

export default app;
