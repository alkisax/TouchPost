// backend/src/login/dao/user.dao.ts
import { MongoServerError } from "mongodb";
import type {
  IUser,
  UserView,
  CreateUserHash,
  UpdateUser,
  GlobalRole,
  UpdateUserProfile,
} from "../types/user.types";
import { UserModel } from "../models/users.models";
import {
  NotFoundError,
  DatabaseError,
  ValidationError,
} from "../../utils/error/errors.types";

// SAFE MAPPER
const toUserDAO = (user: IUser): UserView => {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    globalRoles: user.globalRoles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// CREATE
const create = async (userData: CreateUserHash): Promise<UserView> => {
  try {
    const user = new UserModel({
      username: userData.username,
      name: userData.name,
      email: userData.email,
      globalRoles: userData.globalRoles ?? [],
      hashedPassword: userData.hashedPassword,
    });

    const saved = await user.save();

    return toUserDAO(saved);
  } catch (err: unknown) {
    // Το 11000 είναι MongoDB error code για duplicate key. Δηλαδή όταν παραβιάζεται unique: true
    if (err instanceof MongoServerError && err.code === 11000) {
      throw new ValidationError("Username or email already exists");
    }

    throw new DatabaseError("Error creating user");
  }
};

// READ
const readAll = async (): Promise<UserView[]> => {
  const users = await UserModel.find().sort({ createdAt: -1 });

  return users.map((user) => toUserDAO(user));
};

const readById = async (userId: string): Promise<UserView> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return toUserDAO(user);
};

const readByUsername = async (username: string): Promise<IUser | null> => {
  return await UserModel.findOne({ username });
};

const readByEmail = async (email: string): Promise<IUser | null> => {
  return await UserModel.findOne({ email });
};

// UPDATE
const update = async (
  userId: string,
  userData: UpdateUser,
): Promise<UserView> => {
  const updated = await UserModel.findByIdAndUpdate(userId, userData, {
    returnDocument: 'after',
  });

  if (!updated) {
    throw new NotFoundError("User not found");
  }

  return toUserDAO(updated);
};

const updateProfile = async (
  userId: string,
  userData: UpdateUserProfile,
): Promise<UserView> => {
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $set: userData },
    { returnDocument: 'after' },
  );

  if (!updated) {
    throw new NotFoundError('User not found');
  }

  return toUserDAO(updated);
};

// UPDATE GLOBAL ROLES (εδω μονο superadmin. είναι το μόνο που ανήκει στον γενικό user. οι άλλοι roles είναι organization specific γιατί μπορεί κάποιος να είναι staff σε ένα organization και user σε άλλο)
const updateGlobalRolesById = async (
  userId: string,
  globalRoles: GlobalRole[],
): Promise<UserView> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.globalRoles = globalRoles;
  await user.save();

  return toUserDAO(user);
};

// DELETE
const deleteById = async (userId: string): Promise<UserView> => {
  const deleted = await UserModel.findByIdAndDelete(userId);

  if (!deleted) {
    throw new NotFoundError("User not found");
  }

  return toUserDAO(deleted);
};

export const userDAO = {
  toUserDAO,
  create,
  readAll,
  readById,
  readByUsername,
  readByEmail,
  update,
  updateProfile,
  updateGlobalRolesById,
  deleteById,
};
