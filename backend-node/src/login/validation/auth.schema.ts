// backend/src/login/validation/auth.schema.ts
import { z } from 'zod';

// LOGIN
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(128),
});

// PASSWORD BASE RULE
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character',
  });

// SELF REGISTER (PUBLIC)
export const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: passwordSchema,
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export const registerAdminSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(100),
});

export const registerUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
});
