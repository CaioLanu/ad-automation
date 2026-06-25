import bcrypt from 'bcryptjs';
import { generateRefreshToken, hashRefreshToken } from '../../shared/security/refresh-token.js';
import { signAccessToken } from '../../shared/security/jwt.js';
import type { AuthRepository, AuthUserRecord } from './auth.repository.js';
import { hasLoginPermission } from './permissions.js';

const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const toAccessTokenPayload = (user: Pick<AuthUserRecord, 'id' | 'permission' | 'rg' | 'name'>) => ({
  sub: user.id,
  permission: user.permission,
  rg: user.rg,
  name: user.name,
});

const canLogin = (user: AuthUserRecord) => user.isActive && hasLoginPermission(user.permission);

export const createAuthService = (repository: AuthRepository) => ({
  login: async (rg: string, password: string) => {
    const user = await repository.findUserByRg(rg);

    if (!user || !canLogin(user)) return null;

    if (!(await bcrypt.compare(password, user.passwordHash))) return null;

    const refreshToken = generateRefreshToken();
    const session = await repository.createSession({
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return {
      accessToken: signAccessToken(toAccessTokenPayload(user)),
      refreshToken,
      sessionId: session.id,
    };
  },

  refresh: async (refreshToken: string) => {
    const session = await repository.findSessionByRefreshTokenHash(hashRefreshToken(refreshToken));

    if (!session || session.revokedAt || session.expiresAt < new Date() || !canLogin(session.user)) return null;

    return { accessToken: signAccessToken(toAccessTokenPayload(session.user)) };
  },

  logout: async (userId: string, refreshToken: string) =>
    repository.revokeSession({
      userId,
      refreshTokenHash: hashRefreshToken(refreshToken),
    }),
});
