import type { AuthGuardRepository } from '../../../application/auth/auth-guard.repository.js';
import { prisma } from '../client.js';

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
