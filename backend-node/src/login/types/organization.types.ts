// backend/src/login/types/organization.types.ts
import { Document, Types } from 'mongoose';

// FULL MONGOOSE ORGANIZATION
export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  stripeConnectedAccountId?: string;
  stripeOnboardingComplete?: boolean;
  hasPaid: boolean;
  adFreeUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// SAFE ORGANIZATION VIEW
export interface OrganizationView {
  id: string;
  name: string;
  slug: string;
  hasPaid: boolean;
  adFreeUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// CREATE / UPDATE TYPES
export interface CreateOrganization {
  name: string;
  slug?: string;
}

export interface UpdateOrganization {
  name?: string;
}
