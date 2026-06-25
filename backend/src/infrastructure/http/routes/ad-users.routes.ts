import { Router } from 'express';
import { authenticate, requirePermission } from '../middlewares/auth.middleware.js';
import { createAdUsersService } from '../../../application/ad-users/ad-users.service.js';
import { createAdUserSchema, updateAdUserSchema } from '../../../application/ad-users/ad-users.schemas.js';
import { adUsersRepository } from '../../prisma/repositories/ad-users.prisma-repository.js';

const adUsersService = createAdUsersService(adUsersRepository);

export const adUsersRouter = Router().use(authenticate, requirePermission('ADMINISTRATORS', 'DESENVOLVIMENTO'))
  .get('/users', async (req, res, next) => {
    try {
      return res.json(await adUsersService.listAdUsers(req.user!));
    } catch (error) {
      return next(error);
    }
  })
  .get('/users/:id', async (req, res, next) => {
    try {
      const user = await adUsersService.getAdUser(req.user!, req.params.id);

      if (!user) return res.status(404).json({ message: 'Not found' });

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  })
  .post('/users', async (req, res, next) => {
    try {
      const data = createAdUserSchema.parse(req.body);
      const user = await adUsersService.createAdUser(req.user!, data);

      return res.status(201).json(user);
    } catch (error) {
      return next(error);
    }
  })
  .patch('/users/:id', async (req, res, next) => {
    try {
      const data = updateAdUserSchema.parse(req.body);
      const user = await adUsersService.updateAdUser(req.user!, req.params.id, data);

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  })
  .delete('/users/:id', async (req, res, next) => {
    try {
      return res.json(await adUsersService.deactivateAdUser(req.user!, req.params.id));
    } catch (error) {
      return next(error);
    }
  });
