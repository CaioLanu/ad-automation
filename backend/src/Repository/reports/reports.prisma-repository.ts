import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma-client.js';
import type { ReportFilters, ReportsRepository } from './reports.repository.js';

const toPeriodWhere = (filters: ReportFilters): Prisma.DateTimeFilter => ({
  gte: new Date(`${filters.startDate}T00:00:00.000Z`),
  lte: new Date(`${filters.endDate}T23:59:59.999Z`),
});

export const reportsRepository: ReportsRepository = {
  getDataset: async (filters) => {
    const period = toPeriodWhere(filters);

    const [adUsers, seiTasks, auditLogs, biMovements] = await Promise.all([
      prisma.adUser.findMany({
        select: {
          id: true,
          name: true,
          sector: true,
          profile: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.seiTask.findMany({
        where: { OR: [{ createdAt: period }, { updatedAt: period }] },
        select: {
          id: true,
          sector: true,
          profile: true,
          action: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        where: { createdAt: period },
        select: {
          id: true,
          action: true,
          entityType: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.biMovement.findMany({
        where: { date: { gte: new Date(`${filters.startDate}T00:00:00.000Z`), lte: new Date(`${filters.endDate}T23:59:59.999Z`) } },
        select: {
          id: true,
          date: true,
          kind: true,
          name: true,
          functionalId: true,
          sector: true,
          role: true,
          symbol: true,
          sourceFile: true,
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    return {
      adUsers: adUsers.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      seiTasks: seiTasks.map((task) => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
      auditLogs: auditLogs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      biMovements: biMovements.map((movement) => ({
        ...movement,
        date: movement.date.toISOString().slice(0, 10),
      })),
    };
  },
};
