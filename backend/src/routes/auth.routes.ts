import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { login, logout, refresh } from '../controler/auth.controller.js';

export const authRouter = Router()
  .post('/login', login)
  .post('/refresh', refresh)
  .post('/logout', authenticate, logout);
