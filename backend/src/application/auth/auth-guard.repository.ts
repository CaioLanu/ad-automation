import type { AuthenticatedUser } from './authenticated-user.js';

export type AuthGuardRepository = {
  findActiveUserById(id: string): Promise<AuthenticatedUser | null>;
};
