import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Not found' });
    if (error.code === 'P2002') return res.status(409).json({ message: 'Conflict' });
  }

  const status = (error as { status?: number }).status;

  if (status && status >= 400 && status < 500) return res.status(status).json({ message: 'Request failed' });

  return res.status(500).json({ message: 'Internal server error' });
};
