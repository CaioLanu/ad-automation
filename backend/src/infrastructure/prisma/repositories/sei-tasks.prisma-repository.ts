import type { Prisma } from '@prisma/client';
import type {
  SeiImportBatchDto,
  SeiImportSummary,
  SeiTaskDto,
  SeiTasksRepository,
} from '../../../application/sei-tasks/repository.js';
import type { CreateSeiTaskInput, UpdateSeiTaskInput } from '../../../application/sei-tasks/schemas.js';
import type { ParsedSeiImportRow } from '../../../application/sei-tasks/xlsx-parser.js';
import { prisma } from '../client.js';

type SeiTaskRecord = {
  id: string;
  batchId: string | null;
  sector: string;
  name: string;
  rgLogin: string;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string;
  action: 'CREATE' | 'UPDATE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'INVALID';
  validationErrors: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

type SeiImportBatchRecord = {
  id: string;
  fileName: string;
  totalRows: number;
  importedRows: number;
  invalidRows: number;
  actorUserId: string | null;
  createdAt: Date;
};

const toDto = (task: SeiTaskRecord): SeiTaskDto => ({
  id: task.id,
  batchId: task.batchId,
  sector: task.sector,
  name: task.name,
  rgLogin: task.rgLogin,
  functionalId: task.functionalId,
  cpf: task.cpf,
  role: task.role,
  personalEmail: task.personalEmail,
  personalPhone: task.personalPhone,
  profile: task.profile,
  action: task.action,
  status: task.status,
  validationErrors: task.validationErrors,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

const toBatchDto = (batch: SeiImportBatchRecord): SeiImportBatchDto => ({
  id: batch.id,
  fileName: batch.fileName,
  totalRows: batch.totalRows,
  importedRows: batch.importedRows,
  invalidRows: batch.invalidRows,
  actorUserId: batch.actorUserId,
  createdAt: batch.createdAt.toISOString(),
});

const snapshotTask = (task: SeiTaskRecord) => ({
  batchId: task.batchId,
  sector: task.sector,
  name: task.name,
  rgLogin: task.rgLogin,
  functionalId: task.functionalId,
  cpf: task.cpf,
  role: task.role,
  personalEmail: task.personalEmail,
  personalPhone: task.personalPhone,
  profile: task.profile,
  action: task.action,
  status: task.status,
  validationErrors: task.validationErrors,
});

const audit = (tx: Prisma.TransactionClient, actorUserId: string | null, action: string, entityType: string, entityId: string, metadata: Prisma.InputJsonValue) =>
  tx.auditLog.create({ data: { actorUserId, action, entityType, entityId, metadata } });

export const seiTasksRepository: SeiTasksRepository = {
  list: async (filters) => {
    const tasks = await (prisma as any).seiTask.findMany({
      where: {
        ...(filters.search ? { OR: [{ name: { contains: filters.search } }, { rgLogin: { contains: filters.search } }, { sector: { contains: filters.search } }] } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.action ? { action: filters.action } : {}),
        ...(filters.sector ? { sector: { contains: filters.sector } } : {}),
        ...(filters.profile ? { profile: { contains: filters.profile } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return tasks.map(toDto);
  },

  create: (actorUserId, data) =>
    prisma.$transaction(async (tx) => {
      const created = await (tx as any).seiTask.create({ data });
      await audit(tx, actorUserId, 'SEI_TASK_CREATED', 'SeiTask', created.id, { after: snapshotTask(created) });
      return toDto(created);
    }),

  update: (actorUserId, id, data) =>
    prisma.$transaction(async (tx) => {
      const before = await (tx as any).seiTask.findUniqueOrThrow({ where: { id } });
      const updated = await (tx as any).seiTask.update({ where: { id }, data });
      await audit(tx, actorUserId, 'SEI_TASK_UPDATED', 'SeiTask', updated.id, { before: snapshotTask(before), after: snapshotTask(updated) });
      return toDto(updated);
    }),

  importFromRows: (actorUserId, fileName, rows: ParsedSeiImportRow[]) =>
    prisma.$transaction(async (tx) => {
      const invalidRows = rows.filter((row) => row.errors.length > 0);
      const validRows = rows.filter((row) => row.errors.length === 0);
      const batch = await (tx as any).seiImportBatch.create({
        data: {
          fileName,
          totalRows: rows.length,
          importedRows: validRows.length,
          invalidRows: invalidRows.length,
          actorUserId,
        },
      });

      const createdValid = await Promise.all(
        validRows.map((entry) => (tx as any).seiTask.create({ data: { ...entry.row, batchId: batch.id } })),
      );
      const createdInvalid = await Promise.all(
        invalidRows.map((entry) =>
          (tx as any).seiTask.create({
            data: {
              ...entry.row,
              batchId: batch.id,
              status: 'INVALID',
              validationErrors: entry.errors as Prisma.InputJsonValue,
            },
          }),
        ),
      );

      await audit(tx, actorUserId, 'SEI_IMPORT_BATCH_CREATED', 'SeiImportBatch', batch.id, {
        fileName,
        totalRows: rows.length,
        importedRows: validRows.length,
        invalidRows: invalidRows.length,
        taskIds: [...createdValid, ...createdInvalid].map((task) => task.id),
      });

      return {
        ...toBatchDto(batch),
        batchId: batch.id,
        tasks: [...createdValid, ...createdInvalid].map(toDto),
      } satisfies SeiImportSummary;
    }),
};
