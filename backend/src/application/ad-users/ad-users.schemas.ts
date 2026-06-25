import { z } from 'zod';

const rgSchema = z.string().trim().min(1).max(64);
const adIdSchema = z.string().trim().min(1).max(128);
const nameSchema = z.string().trim().min(1).max(255);
const groupNameSchema = z.string().trim().min(1).max(255);
const memberOfSchema = z.array(groupNameSchema).min(1).transform((values) => [...new Set(values)]);

export const createAdUserSchema = z.object({
  rg: rgSchema,
  name: nameSchema,
  adId: adIdSchema,
  isActive: z.boolean().optional(),
  memberOf: memberOfSchema,
});

export const updateAdUserSchema = z
  .object({
    rg: rgSchema.optional(),
    name: nameSchema.optional(),
    adId: adIdSchema.optional(),
    isActive: z.boolean().optional(),
    memberOf: memberOfSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export type CreateAdUserInput = z.infer<typeof createAdUserSchema>;
export type UpdateAdUserInput = z.infer<typeof updateAdUserSchema>;
