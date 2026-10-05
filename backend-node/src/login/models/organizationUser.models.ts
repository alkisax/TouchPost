// backend/src/login/models/organizationUser.models.ts

import mongoose from 'mongoose';

import type { IOrganizationUser } from '../types/organizationUser.types';

const Schema = mongoose.Schema;

const organizationUserSchema = new Schema<IOrganizationUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['ADMIN', 'STAFF'],
      required: true,
      index: true,
    },
  },
  {
    collection: 'OrganizationUsers',
    timestamps: true,
  },
);

// Ένας user μπορεί να έχει μόνο μία σχέση με το ίδιο organization
organizationUserSchema.index({ userId: 1 }, { unique: true });

export const OrganizationUserModel = mongoose.model<IOrganizationUser>(
  'OrganizationUser',
  organizationUserSchema,
);
