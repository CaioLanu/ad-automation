import type { BiMovementFilters, BiMovementUpsertInput, BiMovementsRepository } from '../../Repository/bi-movements/bi-movements.repository.js';
import type { ActorContext } from '../../utils/auth/authenticated-user.js';
import { hasLoginPermission } from '../../utils/auth/permissions.js';

const assertAdmin = (actor: ActorContext) => {
  if (!hasLoginPermission(actor.permission) || actor.permission !== 'ADMINISTRATORS') {
    const error = new Error('Forbidden') as Error & { status: number };
    error.status = 403;
    throw error;
  }
};

export const createBiMovementsService = (repository: BiMovementsRepository) => ({
  list: (actor: ActorContext, filters: BiMovementFilters) => {
    assertAdmin(actor);
    return repository.list(filters);
  },

  upsertMany: (actor: ActorContext, inputs: BiMovementUpsertInput[]) => {
    assertAdmin(actor);
    return repository.upsertMany(actor.id, inputs);
  },

  remove: (actor: ActorContext, id: string) => {
    assertAdmin(actor);
    return repository.remove(actor.id, id);
  },
});
