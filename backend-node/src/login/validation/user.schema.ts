// backend/src/login/validation/user.schema.ts

import { z } from 'zod';

import { passwordSchema } from './auth.schema';

// CREATE USER
export const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: passwordSchema,
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
  globalRoles: z.array(z.enum(['SUPERADMIN'])).optional(),
});

// REGISTER
// export const registerSchema = z.object({
//   username: z.string().min(1, 'Username is required'),
//   password: passwordSchema,
//   name: z.string().optional(),
//   email: z.email({ error: 'Invalid email address' }).optional(),
//   organizationName: z.string().min(1, 'Organization name is required'),
// });

// UPDATE USER
export const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  password: passwordSchema.optional(),
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
  globalRoles: z.array(z.enum(['SUPERADMIN'])).optional(),
});

export const deleteSelfAdminSchema = z.object({
  password: passwordSchema,
}).strict();

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'STAFF', 'USER']),
}).strict();
