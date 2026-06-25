import { z } from 'zod';

const trimmed = z.string().trim();

export const seiTaskActionSchema = z.enum(['CREATE', 'UPDATE']);
export const seiTaskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'INVALID']);

const seiTaskBaseSchema = z.object({
  sector: trimmed.min(1).max(255),
  name: trimmed.min(1).max(255),
  rgLogin: trimmed.min(1).max(64),
  functionalId: trimmed.max(64).optional().nullable(),
  cpf: trimmed.max(32).optional().nullable(),
  role: trimmed.max(128).optional().nullable(),
  personalEmail: trimmed.max(255).optional().nullable(),
  personalPhone: trimmed.max(64).optional().nullable(),
  profile: trimmed.min(1).max(64),
  action: seiTaskActionSchema.optional(),
  status: seiTaskStatusSchema.optional(),
  validationErrors: z.unknown().optional().nullable(),
});

export const createSeiTaskSchema = seiTaskBaseSchema;

export const updateSeiTaskSchema = seiTaskBaseSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export const listSeiTasksQuerySchema = z.object({
  search: trimmed.optional().or(z.literal('')),
  status: seiTaskStatusSchema.optional(),
  action: seiTaskActionSchema.optional(),
  sector: trimmed.optional().or(z.literal('')),
  profile: trimmed.optional().or(z.literal('')),
});

export type CreateSeiTaskInput = z.infer<typeof createSeiTaskSchema>;
export type UpdateSeiTaskInput = z.infer<typeof updateSeiTaskSchema>;
export type ListSeiTasksQuery = z.infer<typeof listSeiTasksQuerySchema>;

export type SeiImportRow = {
  sector: string;
  name: string;
  rgLogin: string;
  functionalId: string | null;
  cpf: string | null;
  role: string | null;
  personalEmail: string | null;
  personalPhone: string | null;
  profile: string;
};

export type SeiImportRowValidationError = {
  rowNumber: number;
  message: string;
  fields: string[];
};

export const normalizeCell = (value: unknown) => {
  if (value == null) return '';
  return String(value).trim();
};
