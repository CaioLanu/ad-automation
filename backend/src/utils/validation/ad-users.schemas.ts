import { z } from 'zod';

const rgSchema = z.string().trim().min(1).max(64);
const adIdSchema = z.string().trim().min(1).max(128);
const nameSchema = z.string().trim().min(1).max(255);
const sectorSchema = z.string().trim().min(1).max(255);
const functionalIdSchema = z.string().trim().max(64);
const cpfSchema = z.string().trim().max(32);
const roleSchema = z.string().trim().max(128);
const personalEmailSchema = z.string().trim().max(255);
const personalPhoneSchema = z.string().trim().max(64);
const groupNameSchema = z.string().trim().min(1).max(255);
const memberOfSchema = z.array(groupNameSchema).min(1).transform((values) => [...new Set(values)]);

const baseAdUserSchema = z.object({
  adId: adIdSchema.optional().nullable(),
  rg: rgSchema.optional().nullable(),
  rgLogin: rgSchema.optional().nullable(),
  name: nameSchema,
  sector: sectorSchema.optional().nullable(),
  functionalId: functionalIdSchema.optional().nullable(),
  cpf: cpfSchema.optional().nullable(),
  role: roleSchema.optional().nullable(),
  personalEmail: personalEmailSchema.optional().nullable(),
  personalPhone: personalPhoneSchema.optional().nullable(),
  profile: z.string().trim().min(1).max(64).optional(),
  isActive: z.boolean().optional(),
  memberOf: memberOfSchema.optional(),
});

const resolveAdUserInput = (data: z.infer<typeof baseAdUserSchema>) => {
  const rgLogin = data.rgLogin ?? data.rg;
  const rg = data.rg ?? rgLogin;
  const adId = data.adId ?? rgLogin;

  return {
    ...data,
    rgLogin,
    rg,
    adId,
    profile: data.profile,
  };
};

export const createAdUserSchema = z.object({
  ...baseAdUserSchema.shape,
  rg: rgSchema.optional(),
  rgLogin: rgSchema.optional(),
  adId: adIdSchema.optional().nullable(),
  profile: z.string().trim().min(1).max(64),
  memberOf: memberOfSchema.optional(),
}).transform(resolveAdUserInput).refine((data) => Boolean(data.rgLogin), { message: 'rgLogin is required' });

export const updateAdUserSchema = z
  .object(baseAdUserSchema.partial().shape)
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const importAdUserRowSchema = z.object({
  sector: sectorSchema,
  name: nameSchema,
  rgLogin: rgSchema,
  functionalId: functionalIdSchema.optional().nullable(),
  cpf: cpfSchema.optional().nullable(),
  role: roleSchema.optional().nullable(),
  personalEmail: personalEmailSchema.optional().nullable(),
  personalPhone: personalPhoneSchema.optional().nullable(),
  profile: z.string().trim().min(1).max(64),
});

export type CreateAdUserInput = z.infer<typeof createAdUserSchema>;
export type UpdateAdUserInput = z.infer<typeof updateAdUserSchema>;
export type ImportAdUserRowInput = z.infer<typeof importAdUserRowSchema>;
