import type { RequestHandler } from 'express';

export const healthCheck: RequestHandler = (_req, res) => res.json({ status: 'ok' });
