import type { AuthenticatedUser } from '../../utils/auth/authenticated-user.js';

export type AuthGuardRepository = {
  findActiveUserById(id: string): Promise<AuthenticatedUser | null>;
};
