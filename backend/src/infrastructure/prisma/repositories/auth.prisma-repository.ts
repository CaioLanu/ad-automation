import { prisma } from '../client.js';
import type { AuthRepository } from '../../../application/auth/auth.repository.js';

export const authRepository: AuthRepository = {
  findUserByRg: (rg) => prisma.systemUser.findUnique({ where: { rg } }),

  createSession: ({ userId, refreshTokenHash, expiresAt }) =>
    prisma.session.create({
      data: { userId, refreshTokenHash, expiresAt },
      select: { id: true },
    }),

  findSessionByRefreshTokenHash: (refreshTokenHash) =>
    prisma.session.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    }),

  revokeSession: async ({ userId, refreshTokenHash }) => {
    await prisma.session.updateMany({
      where: { refreshTokenHash, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
