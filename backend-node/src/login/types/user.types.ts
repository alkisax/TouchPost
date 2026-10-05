// backend/src/login/types/user.types.ts

import { Document, Types } from 'mongoose';
import type { Request } from 'express';

// GLOBAL ROLES
export type GlobalRole = 'SUPERADMIN';

// ORGANIZATION ROLES
export type OrganizationRole = 'ADMIN' | 'STAFF';

// FULL MONGOOSE USER
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  name?: string;
  email?: string;
  globalRoles: GlobalRole[];
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

// SAFE USER VIEW (no password)
export interface UserView {
  id: string;
  username: string;
  name?: string;
  email?: string;
  globalRoles: GlobalRole[];
  createdAt: Date;
  updatedAt: Date;
}

// CREATE / UPDATE TYPES
export interface CreateUser {
  username: string;
  name?: string;
  email?: string;
  password: string;
  globalRoles?: GlobalRole[];
}

export interface CreateUserHash {
  username: string;
  name?: string;
  email?: string;
  hashedPassword: string;
  globalRoles?: GlobalRole[];
}

export interface UpdateUser {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  hashedPassword?: string;
  globalRoles?: GlobalRole[];
}

// AUTH REQUEST
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    globalRoles: GlobalRole[];
  };
}

export interface UpdateUserProfile {
  username?: string;
  name?: string;
  email?: string;
  hashedPassword?: string;
}
