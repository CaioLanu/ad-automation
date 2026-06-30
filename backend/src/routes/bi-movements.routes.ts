import { Router } from 'express';
import { listBiMovements, removeBiMovement, upsertManyBiMovements } from '../controler/bi-movements.controller.js';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';

export const biMovementsRouter = Router()
  .use(authenticate, requirePermission('ADMINISTRATORS'))
  .get('/', listBiMovements)
  .post('/batch', upsertManyBiMovements)
  .delete('/:id', removeBiMovement);
