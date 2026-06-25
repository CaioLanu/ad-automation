import type { AuthenticatedUser } from '../application/auth/authenticated-user.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
