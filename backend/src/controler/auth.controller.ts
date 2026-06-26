import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { authRepository } from '../Repository/auth/auth.prisma-repository.js';
import { createAuthService } from '../services/auth/auth.service.js';

const loginSchema = z.object({ rg: z.string().trim().min(1), password: z.string().min(1) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });
const authService = createAuthService(authRepository);

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rg, password } = loginSchema.parse(req.body);
    const result = await authService.login(rg, password);

    if (!result) return res.status(401).json({ message: 'Invalid credentials' });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);

    if (!result) return res.status(401).json({ message: 'Invalid refresh token' });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await authService.logout(req.user!.id, refreshToken);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
