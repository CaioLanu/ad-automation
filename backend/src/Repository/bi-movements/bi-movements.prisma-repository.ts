import { prisma } from '../prisma-client.js';
import type { BiMovementDto, BiMovementFilters, BiMovementUpsertInput, BiMovementsRepository } from './bi-movements.repository.js';

const toDto = (record: { id: string; date: Date; kind: string; name: string; functionalId: string; sector: string; role: string; symbol: string; sourceFile: string; createdAt: Date; updatedAt: Date }): BiMovementDto => ({
  id: record.id,
  date: record.date.toISOString().slice(0, 10),
  kind: record.kind as BiMovementDto['kind'],
  name: record.name,
  functionalId: record.functionalId,
  sector: record.sector,
  role: record.role,
  symbol: record.symbol,
  sourceFile: record.sourceFile,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

export const biMovementsRepository: BiMovementsRepository = {
  list: async (filters) => {
    const where: Record<string, unknown> = {};

    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: new Date(`${filters.startDate}T00:00:00.000Z`),
        lte: new Date(`${filters.endDate}T23:59:59.999Z`),
      };
    } else if (filters.startDate) {
      where.date = { gte: new Date(`${filters.startDate}T00:00:00.000Z`) };
    } else if (filters.endDate) {
      where.date = { lte: new Date(`${filters.endDate}T23:59:59.999Z`) };
    }

    if (filters.kind) {
      where.kind = filters.kind;
    }

    const records = await prisma.biMovement.findMany({
      where,
      orderBy: [{ date: 'desc' }, { name: 'asc' }],
    });

    return records.map(toDto);
  },

  upsert: async (actorUserId, input) => {
    const date = new Date(`${input.date}T00:00:00.000Z`);
    const data = {
      date,
      kind: input.kind,
      name: input.name,
      functionalId: input.functionalId,
      sector: input.sector,
      role: input.role,
      symbol: input.symbol,
      sourceFile: input.sourceFile,
    };

    const record = await prisma.biMovement.upsert({
      where: { date_functionalId_kind: { date, functionalId: input.functionalId, kind: input.kind } },
      create: data,
      update: { name: input.name, sector: input.sector, role: input.role, symbol: input.symbol, sourceFile: input.sourceFile },
    });
    return toDto(record);
  },

  upsertMany: async (actorUserId, inputs) => {
    if (inputs.length === 0) return [];

    const records = await prisma.$transaction(
      inputs.map((input) => {
        const date = new Date(`${input.date}T00:00:00.000Z`);
        return prisma.biMovement.upsert({
          where: { date_functionalId_kind: { date, functionalId: input.functionalId, kind: input.kind } },
          create: { date, kind: input.kind, name: input.name, functionalId: input.functionalId, sector: input.sector, role: input.role, symbol: input.symbol, sourceFile: input.sourceFile },
          update: { name: input.name, sector: input.sector, role: input.role, symbol: input.symbol, sourceFile: input.sourceFile },
        });
      }),
    );

    return records.map(toDto);
  },

  remove: async (actorUserId, id) => {
    await prisma.biMovement.delete({ where: { id } });
  },
};
