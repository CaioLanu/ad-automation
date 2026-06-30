import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { BiMovementKind } from '../Repository/bi-movements/bi-movements.repository.js';
import { biMovementsRepository } from '../Repository/bi-movements/bi-movements.prisma-repository.js';
import { createBiMovementsService } from '../services/bi-movements/bi-movements.service.js';

const service = createBiMovementsService(biMovementsRepository);

const upsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(['EXONERACAO', 'NOMEACAO']),
  name: z.string().min(1).max(255),
  functionalId: z.string().min(1).max(64),
  sector: z.string().min(1).max(255),
  role: z.string().min(1).max(128),
  symbol: z.string().min(1).max(32),
  sourceFile: z.string().min(1).max(255),
});

const upsertManySchema = z.object({
  movements: z.array(upsertSchema).min(1).max(5000),
});

export const listBiMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      kind: (req.query.kind as BiMovementKind | '') ?? '',
    };
    return res.json(await service.list(req.user!, filters));
  } catch (error) {
    return next(error);
  }
};

export const upsertManyBiMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movements } = upsertManySchema.parse(req.body);
    return res.json(await service.upsertMany(req.user!, movements));
  } catch (error) {
    return next(error);
  }
};

export const removeBiMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await service.remove(req.user!, id);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};
