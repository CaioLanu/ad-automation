import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export type AccessTokenPayload = { sub: string; permission: string; rg: string; name: string };
export const signAccessToken = (payload: AccessTokenPayload) => jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
