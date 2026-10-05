// backend/src/login/validation/organization.schema.ts

import { z } from 'zod';

// CREATE ORGANIZATION
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});

// UPDATE ORGANIZATION
export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
});