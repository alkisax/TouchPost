import { z } from 'zod';
import { passwordSchema } from '../validation/auth.schema';

const identityFields = {
  username: z.string().min(1).optional(),
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
};

export const createAdminSchema = z.object({
  username: z.string().min(1),
  password: passwordSchema,
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
  organizationName: z.string().min(1),
}).strict();

export const createStaffSchema = z.object({
  username: z.string().min(1),
  password: passwordSchema,
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
}).strict();

export const updateAdminSchema = z.object({
  ...identityFields,
  password: passwordSchema.optional(),
}).strict();

export const updateStaffSchema = updateAdminSchema;

export const updateUserAdStatusSchema = z.object({
  hasPaid: z.boolean(),
  adFreeUntil: z.coerce.date().nullable().optional(),
}).strict();
