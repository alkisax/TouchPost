// backend/src/login/models/organization.models.ts

import mongoose from 'mongoose';
import type { IOrganization } from '../types/organization.types';

const Schema = mongoose.Schema;

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'organization name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    stripeConnectedAccountId: {
      type: String,
      required: false,
    },
    stripeOnboardingComplete: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
    adFreeUntil: {
      type: Date,
    },
  },
  {
    collection: 'Organizations',
    timestamps: true,
  },
);

export const OrganizationModel = mongoose.model<IOrganization>(
  'Organization',
  organizationSchema,
);
