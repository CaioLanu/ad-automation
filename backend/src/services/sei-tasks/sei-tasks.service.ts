import type { SeiTasksRepository } from '../../Repository/sei-tasks/sei-tasks.repository.js';
import type { ActorContext } from '../../utils/auth/authenticated-user.js';
import { hasLoginPermission } from '../../utils/auth/permissions.js';
import { parseSeiWorkbook } from '../../utils/parsers/sei-tasks-xlsx-parser.js';
import type { CreateSeiTaskInput, ListSeiTasksQuery, UpdateSeiTaskInput } from '../../utils/validation/sei-tasks.schemas.js';

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

  checkAdUser: (actor: ActorContext, id: string) => {
    assertAdministratorsOnly(actor);
    return repository.checkAdUser(actor.id, id);
  },

  importFromBuffer: (actor: ActorContext, fileName: string, buffer: Buffer) => {
    assertAdministratorsOnly(actor);
    return repository.importFromRows(actor.id, fileName, parseSeiWorkbook(buffer));
  },
});
