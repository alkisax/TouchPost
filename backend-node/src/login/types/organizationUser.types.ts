// backend/src/login/types/organizationUser.types.ts

import { Document, Types } from 'mongoose';
import type { OrganizationRole } from './user.types';

// FULL MONGOOSE ORGANIZATION USER
export interface IOrganizationUser extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
}

// SAFE ORGANIZATION USER VIEW
export interface OrganizationUserView {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationUserDetailsView {
  id: string;
  user: {
    id: string;
    username: string;
    name?: string;
    email?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  organizationId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedOrganizationUser
  extends Omit<IOrganizationUser, "userId"> {
  userId: {
    _id: Types.ObjectId;
    username: string;
    name?: string;
    email?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

