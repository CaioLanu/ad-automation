export type AuthUserRecord = {
  id: string;
  rg: string;
  name: string;
  permission: string;
  isActive: boolean;
  passwordHash: string;
};

export type AuthSessionRecord = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: AuthUserRecord;
};

export type AuthRepository = {
  findUserByRg(rg: string): Promise<AuthUserRecord | null>;
  createSession(input: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string }>;
  findSessionByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSessionRecord | null>;
  revokeSession(input: { userId: string; refreshTokenHash: string }): Promise<void>;
};
