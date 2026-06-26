import type { NextFunction, Request, Response } from 'express';
import { adUsersRepository } from '../Repository/ad-users/ad-users.prisma-repository.js';
import { createAdUsersService } from '../services/ad-users/ad-users.service.js';
import { createAdUserSchema, updateAdUserSchema } from '../utils/validation/ad-users.schemas.js';

const adUsersService = createAdUsersService(adUsersRepository);

export const listAdUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await adUsersService.listAdUsers(req.user!));
  } catch (error) {
    return next(error);
  }
};

export const getAdUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adUsersService.getAdUser(req.user!, req.params.id as string);

    if (!user) return res.status(404).json({ message: 'Not found' });

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const createAdUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createAdUserSchema.parse(req.body);
    const user = await adUsersService.createAdUser(req.user!, data);

    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateAdUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateAdUserSchema.parse(req.body);
    const user = await adUsersService.updateAdUser(req.user!, req.params.id as string, data);

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const deactivateAdUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json(await adUsersService.deactivateAdUser(req.user!, req.params.id as string));
  } catch (error) {
    return next(error);
  }
};

export const importAdUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!Buffer.isBuffer(req.body)) return res.status(400).json({ message: 'Invalid file' });
    const header = req.headers['x-file-name'];
    const fileName = typeof header === 'string' && header.trim() ? header.trim() : 'ad-import.xlsx';

    return res.json(await adUsersService.importAdUsers(req.user!, fileName, req.body));
  } catch (error) {
    return next(error);
  }
};
