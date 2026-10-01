import { Document, Types } from 'mongoose';
import type { Request } from 'express';
export type GlobalRole = 'SUPERADMIN';
export type OrganizationRole = 'ADMIN' | 'STAFF';
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
export interface UserView {
    id: string;
    username: string;
    name?: string;
    email?: string;
    globalRoles: GlobalRole[];
    createdAt: Date;
    updatedAt: Date;
}
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
