import type { AccessTokenPayload } from './jwt';

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    rg: string;
    name: string;
    permission: AccessTokenPayload['permission'];
  };
  expiresAt?: number;
};

const STORAGE_KEY = 'ad-automation.auth';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

export const saveAuthSession = (session: AuthSession) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const loadAuthSession = () => {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearAuthSession = () => {
  const storage = getStorage();
  storage?.removeItem(STORAGE_KEY);
};
