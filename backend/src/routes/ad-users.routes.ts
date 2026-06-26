import { Router } from 'express';
import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware.js';
import {
  createAdUser,
  deactivateAdUser,
  getAdUser,
  importAdUsers,
  listAdUsers,
  updateAdUser,
} from '../controler/ad-users.controller.js';

const xlsxBodyParser = express.raw({
  type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
  limit: '10mb',
});

export const adUsersRouter = Router().use(authenticate, requirePermission('ADMINISTRATORS'))
  .get('/users', listAdUsers)
  .get('/users/:id', getAdUser)
  .post('/users', createAdUser)
  .patch('/users/:id', updateAdUser)
  .delete('/users/:id', deactivateAdUser)
  .post('/users/import', xlsxBodyParser, importAdUsers);
