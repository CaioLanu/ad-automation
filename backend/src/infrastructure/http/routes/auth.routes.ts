import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createAuthService } from '../../../application/auth/auth.service.js';
import { authRepository } from '../../prisma/repositories/auth.prisma-repository.js';

const loginSchema = z.object({ rg: z.string().trim().min(1), password: z.string().min(1) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });
const authService = createAuthService(authRepository);

export const authRouter = Router()
  .post('/login', async (req, res, next) => {
    try {
      const { rg, password } = loginSchema.parse(req.body);
      const result = await authService.login(rg, password);

      if (!result) return res.status(401).json({ message: 'Invalid credentials' });

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  })
  .post('/refresh', async (req, res, next) => {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const result = await authService.refresh(refreshToken);

      if (!result) return res.status(401).json({ message: 'Invalid refresh token' });

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  })
  .post('/logout', authenticate, async (req, res, next) => {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      await authService.logout(req.user!.id, refreshToken);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });
