import { decodeAccessToken } from './jwt';
import { clearAuthSession, loadAuthSession, saveAuthSession, type AuthSession } from './storage';

export const LOGIN_PERMISSIONS = ['ADMINISTRATORS', 'DESENVOLVIMENTO'] as const;

export const ADMIN_DENIED_MESSAGE =
  'A sua conta não possui permissão para entrar. Os tokens foram apagados por segurança.';

export const INVALID_SESSION_MESSAGE = 'Sessão inválida. Faça login novamente.';
export const EXPIRED_SESSION_MESSAGE = 'Sessão expirada. Faça login novamente.';

const hasExpired = (exp?: number) => typeof exp === 'number' && exp * 1000 <= Date.now();

export const createSessionFromTokens = (accessToken: string, refreshToken: string) => {
  try {
    const payload = decodeAccessToken(accessToken);

    if (!LOGIN_PERMISSIONS.includes(payload.permission as (typeof LOGIN_PERMISSIONS)[number])) {
      clearAuthSession();
      return { error: ADMIN_DENIED_MESSAGE } as const;
    }

    if (hasExpired(payload.exp)) {
      clearAuthSession();
      return { error: EXPIRED_SESSION_MESSAGE } as const;
    }

    const session: AuthSession = {
      accessToken,
      refreshToken,
      user: {
        id: payload.sub,
        rg: payload.rg,
        name: payload.name,
        permission: payload.permission,
      },
      expiresAt: payload.exp ? payload.exp * 1000 : undefined,
    };

    saveAuthSession(session);
    return { session } as const;
  } catch {
    clearAuthSession();
    return { error: INVALID_SESSION_MESSAGE } as const;
  }
};

export const restoreSession = () => {
  const existing = loadAuthSession();
  if (!existing) return { session: null, error: null } as const;

  try {
    const payload = decodeAccessToken(existing.accessToken);
    if (!LOGIN_PERMISSIONS.includes(payload.permission as (typeof LOGIN_PERMISSIONS)[number])) {
      clearAuthSession();
      return { session: null, error: ADMIN_DENIED_MESSAGE } as const;
    }

    if (hasExpired(payload.exp)) {
      clearAuthSession();
      return { session: null, error: EXPIRED_SESSION_MESSAGE } as const;
    }

    const session: AuthSession = {
      ...existing,
      user: {
        id: payload.sub,
        rg: payload.rg,
        name: payload.name,
        permission: payload.permission,
      },
      expiresAt: payload.exp ? payload.exp * 1000 : existing.expiresAt,
    };

    saveAuthSession(session);
    return { session, error: null } as const;
  } catch {
    clearAuthSession();
    return { session: null, error: INVALID_SESSION_MESSAGE } as const;
  }
};

export const signOutLocally = () => {
  clearAuthSession();
};
