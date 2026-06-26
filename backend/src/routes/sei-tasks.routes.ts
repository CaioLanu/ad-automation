import express, { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import { checkSeiTaskInAd, createSeiTask, importSeiTasks, listSeiTasks, updateSeiTask } from '../controler/sei-tasks.controller.js';

const xlsxBodyParser = express.raw({
  type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
  limit: '10mb',
});

export const seiTasksRouter = Router()
  .use(authenticate, requirePermission('ADMINISTRATORS'))
  .get('/tasks', listSeiTasks)
  .post('/tasks', createSeiTask)
  .post('/tasks/:id/check-ad', checkSeiTaskInAd)
  .patch('/tasks/:id', updateSeiTask)
  .post('/tasks/import', xlsxBodyParser, importSeiTasks);
