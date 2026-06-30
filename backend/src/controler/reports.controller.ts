import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { reportsRepository } from '../Repository/reports/reports.prisma-repository.js';
import { createReportsService } from '../services/reports/reports.service.js';

const reportsService = createReportsService(reportsRepository);

const reportQuerySchema = z.object({
  domain: z.enum(['ALL', 'AD', 'SEI']).default('AD'),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine((value) => Date.parse(value.startDate) <= Date.parse(value.endDate), {
  message: 'Data inicial deve ser anterior ou igual à data final.',
  path: ['startDate'],
});

export const getReportSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = reportQuerySchema.parse(req.query);
    return res.json(await reportsService.getSummary(req.user!, filters));
  } catch (error) {
    return next(error);
  }
};
