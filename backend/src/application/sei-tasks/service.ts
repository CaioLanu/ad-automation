import type { ActorContext } from '../ad-users/ad-users.repository.js';
import { hasLoginPermission } from '../auth/permissions.js';
import { parseSeiWorkbook } from './xlsx-parser.js';
import type { SeiTasksRepository } from './repository.js';
import type { CreateSeiTaskInput, ListSeiTasksQuery, UpdateSeiTaskInput } from './schemas.js';

const assertAdministratorsOnly = (actor: ActorContext) => {
  if (!hasLoginPermission(actor.permission) || actor.permission !== 'ADMINISTRATORS') {
    const error = new Error('Forbidden') as Error & { status: number };
    error.status = 403;
    throw error;
  }
};

export const createSeiTasksService = (repository: SeiTasksRepository) => ({
  list: (actor: ActorContext, filters: ListSeiTasksQuery) => {
    assertAdministratorsOnly(actor);
    return repository.list(filters);
  },

  create: (actor: ActorContext, data: CreateSeiTaskInput) => {
    assertAdministratorsOnly(actor);
    return repository.create(actor.id, data);
  },

  update: (actor: ActorContext, id: string, data: UpdateSeiTaskInput) => {
    assertAdministratorsOnly(actor);
    return repository.update(actor.id, id, data);
  },

  importFromBuffer: (actor: ActorContext, fileName: string, buffer: Buffer) => {
    assertAdministratorsOnly(actor);
    return repository.importFromRows(actor.id, fileName, parseSeiWorkbook(buffer));
  },
});
