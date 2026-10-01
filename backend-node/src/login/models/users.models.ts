// backend/src/login/models/users.models.ts

import mongoose from 'mongoose';

import type { IUser } from '../types/user.types';

const Schema = mongoose.Schema;

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // επιτρέπει πολλα null
      trim: true,
      lowercase: true,
    },

    globalRoles: {
      type: [String],
      enum: ['SUPERADMIN'],
      default: [],
      required: true,
      index: true,
    },

    hashedPassword: {
      type: String,
      required: [true, 'password is required'],
    },

  },
  {
    collection: 'Users',
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
