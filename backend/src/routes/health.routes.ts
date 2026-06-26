import { Router } from 'express';
import { healthCheck } from '../controler/health.controller.js';

export const healthRouter = Router().get('/health', healthCheck);
