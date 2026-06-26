import type { NextFunction, Request, Response } from 'express';
import { seiTasksRepository } from '../Repository/sei-tasks/sei-tasks.prisma-repository.js';
import { createSeiTasksService } from '../services/sei-tasks/sei-tasks.service.js';
import { createSeiTaskSchema, listSeiTasksQuerySchema, updateSeiTaskSchema } from '../utils/validation/sei-tasks.schemas.js';

const seiTasksService = createSeiTasksService(seiTasksRepository);

export const listSeiTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listSeiTasksQuerySchema.parse(req.query);
    return res.json(await seiTasksService.list(req.user!, query));
  } catch (error) {
    return next(error);
  }
};

export const createSeiTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSeiTaskSchema.parse(req.body);
    return res.status(201).json(await seiTasksService.create(req.user!, data));
  } catch (error) {
    return next(error);
  }
};

export const updateSeiTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSeiTaskSchema.parse(req.body);
    return res.json(await seiTasksService.update(req.user!, req.params.id as string, data));
  } catch (error) {
    return next(error);
  }
};

export const checkSeiTaskInAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await seiTasksService.checkAdUser(req.user!, req.params.id as string));
  } catch (error) {
    return next(error);
  }
};

export const importSeiTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!Buffer.isBuffer(req.body)) return res.status(400).json({ message: 'Invalid file' });
    const header = req.headers['x-file-name'];
    const fileName = typeof header === 'string' && header.trim() ? header.trim() : 'sei-import.xlsx';

    return res.json(await seiTasksService.importFromBuffer(req.user!, fileName, req.body));
  } catch (error) {
    return next(error);
  }
};
