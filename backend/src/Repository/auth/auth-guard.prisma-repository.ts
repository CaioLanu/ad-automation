import { prisma } from '../prisma-client.js';
import type { AuthGuardRepository } from './auth-guard.repository.js';

export const authGuardRepository: AuthGuardRepository = {
  findActiveUserById: (id) =>
    prisma.systemUser.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        rg: true,
        name: true,
        permission: true,
        isActive: true,
      },
    }),
};
