import express, { Router } from 'express';
import { authenticate, requirePermission } from '../middlewares/auth.middleware.js';
import { createSeiTasksService } from '../../../application/sei-tasks/service.js';
import { createSeiTaskSchema, listSeiTasksQuerySchema, updateSeiTaskSchema } from '../../../application/sei-tasks/schemas.js';
import { seiTasksRepository } from '../../prisma/repositories/sei-tasks.prisma-repository.js';

const seiTasksService = createSeiTasksService(seiTasksRepository);

export const seiTasksRouter = Router()
  .use(authenticate, requirePermission('ADMINISTRATORS'))
  .get('/tasks', async (req, res, next) => {
    try {
      const query = listSeiTasksQuerySchema.parse(req.query);
      return res.json(await seiTasksService.list(req.user!, query));
    } catch (error) {
      return next(error);
    }
  })
  .post('/tasks', async (req, res, next) => {
    try {
      const data = createSeiTaskSchema.parse(req.body);
      return res.status(201).json(await seiTasksService.create(req.user!, data));
    } catch (error) {
      return next(error);
    }
  })
  .patch('/tasks/:id', async (req, res, next) => {
    try {
      const data = updateSeiTaskSchema.parse(req.body);
      return res.json(await seiTasksService.update(req.user!, req.params.id, data));
    } catch (error) {
      return next(error);
    }
  })
  .post(
    '/tasks/import',
    express.raw({ type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'], limit: '10mb' }),
    async (req, res, next) => {
      try {
        if (!Buffer.isBuffer(req.body)) return res.status(400).json({ message: 'Invalid file' });
        const header = req.headers['x-file-name'];
        const fileName = typeof header === 'string' && header.trim() ? header.trim() : 'sei-import.xlsx';
        return res.json(await seiTasksService.importFromBuffer(req.user!, fileName, req.body));
      } catch (error) {
        return next(error);
      }
    },
  );
