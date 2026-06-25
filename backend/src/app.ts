import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRouter } from './infrastructure/http/routes/health.routes.js';
import { authRouter } from './infrastructure/http/routes/auth.routes.js';
import { adUsersRouter } from './infrastructure/http/routes/ad-users.routes.js';
import { seiTasksRouter } from './infrastructure/http/routes/sei-tasks.routes.js';
import { errorHandler } from './infrastructure/http/middlewares/error-handler.middleware.js';

export const app = express();
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }));
app.use(express.json());
app.use(healthRouter);
app.use('/auth', authRouter);
app.use('/ad', adUsersRouter);
app.use('/sei', seiTasksRouter);
app.use(errorHandler);
