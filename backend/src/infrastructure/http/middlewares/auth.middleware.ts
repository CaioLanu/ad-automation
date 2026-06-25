import type { NextFunction, Request, Response } from 'express';
import { hasLoginPermission, type LoginPermission } from '../../../application/auth/permissions.js';
import { verifyAccessToken } from '../../../shared/security/jwt.js';
import { authGuardRepository } from '../../prisma/repositories/auth-guard.prisma-repository.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = verifyAccessToken(token);
    const user = await authGuardRepository.findActiveUserById(payload.sub);
    if (!user || !hasLoginPermission(user.permission)) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const requirePermission = (...permissions: LoginPermission[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !hasLoginPermission(req.user.permission) || !permissions.includes(req.user.permission)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
