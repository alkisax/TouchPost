"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDAO = void 0;
// backend/src/login/dao/user.dao.ts
const mongodb_1 = require("mongodb");
const users_models_1 = require("../models/users.models");
const errors_types_1 = require("../../utils/error/errors.types");
// SAFE MAPPER
const toUserDAO = (user) => {
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
const create = async (userData) => {
    try {
        const user = new users_models_1.UserModel({
            username: userData.username,
            name: userData.name,
            email: userData.email,
            globalRoles: userData.globalRoles ?? [],
            hashedPassword: userData.hashedPassword,
        });
        const saved = await user.save();
        return toUserDAO(saved);
    }
    catch (err) {
        // Το 11000 είναι MongoDB error code για duplicate key. Δηλαδή όταν παραβιάζεται unique: true
        if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
            throw new errors_types_1.ValidationError("Username or email already exists");
        }
        throw new errors_types_1.DatabaseError("Error creating user");
    }
};
// READ
const readAll = async () => {
    const users = await users_models_1.UserModel.find().sort({ createdAt: -1 });
    return users.map((user) => toUserDAO(user));
};
const readById = async (userId) => {
    const user = await users_models_1.UserModel.findById(userId);
    if (!user) {
        throw new errors_types_1.NotFoundError("User not found");
    }
    return toUserDAO(user);
};
const readByUsername = async (username) => {
    return await users_models_1.UserModel.findOne({ username });
};
const readByEmail = async (email) => {
    return await users_models_1.UserModel.findOne({ email });
};
// UPDATE
const update = async (userId, userData) => {
    const updated = await users_models_1.UserModel.findByIdAndUpdate(userId, userData, {
        returnDocument: 'after',
    });
    if (!updated) {
        throw new errors_types_1.NotFoundError("User not found");
    }
    return toUserDAO(updated);
};
const updateProfile = async (userId, userData) => {
    const updated = await users_models_1.UserModel.findByIdAndUpdate(userId, { $set: userData }, { returnDocument: 'after' });
    if (!updated) {
        throw new errors_types_1.NotFoundError('User not found');
    }
    return toUserDAO(updated);
};
// UPDATE GLOBAL ROLES (εδω μονο superadmin. είναι το μόνο που ανήκει στον γενικό user. οι άλλοι roles είναι organization specific γιατί μπορεί κάποιος να είναι staff σε ένα organization και user σε άλλο)
const updateGlobalRolesById = async (userId, globalRoles) => {
    const user = await users_models_1.UserModel.findById(userId);
    if (!user) {
        throw new errors_types_1.NotFoundError("User not found");
    }
    user.globalRoles = globalRoles;
    await user.save();
    return toUserDAO(user);
};
// DELETE
const deleteById = async (userId) => {
    const deleted = await users_models_1.UserModel.findByIdAndDelete(userId);
    if (!deleted) {
        throw new errors_types_1.NotFoundError("User not found");
    }
    return toUserDAO(deleted);
};
exports.userDAO = {
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
//# sourceMappingURL=user.dao.js.map