import { Router } from 'express';
import { getReportSummary } from '../controler/reports.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';

export const reportsRouter = Router()
  .use(authenticate, requirePermission('ADMINISTRATORS'))
  .get('/summary', getReportSummary);
