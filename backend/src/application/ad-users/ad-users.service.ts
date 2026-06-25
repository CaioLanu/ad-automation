import type { ActorContext, AdUsersRepository } from './ad-users.repository.js';
import type { CreateAdUserInput, UpdateAdUserInput } from './ad-users.schemas.js';
import { hasLoginPermission } from '../auth/permissions.js';

const assertAdmin = (actor: ActorContext) => {
  if (!hasLoginPermission(actor.permission)) {
    const error = new Error('Forbidden') as Error & { status: number };
    error.status = 403;
    throw error;
  }
};

export const createAdUsersService = (repository: AdUsersRepository) => ({
  listAdUsers: (actor: ActorContext) => {
    assertAdmin(actor);
    return repository.list();
  },

  getAdUser: (actor: ActorContext, id: string) => {
    assertAdmin(actor);
    return repository.findById(id);
  },

  createAdUser: (actor: ActorContext, data: CreateAdUserInput) => {
    assertAdmin(actor);
    return repository.create(actor.id, data);
  },

  updateAdUser: (actor: ActorContext, id: string, data: UpdateAdUserInput) => {
    assertAdmin(actor);
    return repository.update(actor.id, id, data);
  },

  deactivateAdUser: (actor: ActorContext, id: string) => {
    assertAdmin(actor);
    return repository.deactivate(actor.id, id);
  },
});
