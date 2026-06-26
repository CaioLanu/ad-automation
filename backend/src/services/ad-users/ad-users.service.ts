import { randomUUID } from 'node:crypto';
import type { AdUsersRepository } from '../../Repository/ad-users/ad-users.repository.js';
import type { ActorContext } from '../../utils/auth/authenticated-user.js';
import { hasLoginPermission } from '../../utils/auth/permissions.js';
import { parseAdWorkbook } from '../../utils/parsers/ad-users-xlsx-parser.js';
import type { CreateAdUserInput, UpdateAdUserInput } from '../../utils/validation/ad-users.schemas.js';

const assertAdmin = (actor: ActorContext) => {
  if (!hasLoginPermission(actor.permission) || actor.permission !== 'ADMINISTRATORS') {
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

  importAdUsers: async (actor: ActorContext, fileName: string, buffer: Buffer) => {
    assertAdmin(actor);
    let rows;
    try {
      rows = parseAdWorkbook(buffer);
    } catch {
      const error = new Error('Arquivo XLSX inválido ou fora do padrão esperado.') as Error & { status: number };
      error.status = 400;
      throw error;
    }
    const batchId = randomUUID();
    return repository.importUsers(actor.id, fileName || 'ad-import.xlsx', batchId, rows);
  },
});
