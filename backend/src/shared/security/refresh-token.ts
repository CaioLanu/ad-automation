import crypto from 'node:crypto';
import { env } from '../../config/env.js';

export const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');
export const hashRefreshToken = (token: string) => crypto.createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
