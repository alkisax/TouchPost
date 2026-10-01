"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationUserDAO = void 0;
const organizationUser_models_1 = require("../models/organizationUser.models");
const toOrganizationUserDAO = (organizationUser) => ({
    id: organizationUser._id.toString(),
    userId: organizationUser.userId.toString(),
    organizationId: organizationUser.organizationId.toString(),
    role: organizationUser.role,
    createdAt: organizationUser.createdAt,
    updatedAt: organizationUser.updatedAt,
});
const toOrganizationUserDetailsDAO = (organizationUser) => ({
    id: organizationUser._id.toString(),
    user: {
        id: organizationUser.userId._id.toString(),
        username: organizationUser.userId.username,
        name: organizationUser.userId.name,
        email: organizationUser.userId.email,
        createdAt: organizationUser.userId.createdAt,
        updatedAt: organizationUser.userId.updatedAt,
    },
    organizationId: organizationUser.organizationId.toString(),
    role: organizationUser.role,
    createdAt: organizationUser.createdAt,
    updatedAt: organizationUser.updatedAt,
});
const readByOrganizationId = async (organizationId) => {
    const organizationUsers = await organizationUser_models_1.OrganizationUserModel.find({
        organizationId,
    }).sort({ createdAt: -1 });
    return organizationUsers.map(toOrganizationUserDAO);
};
const readByUserId = async (userId) => {
    const organizationUser = await organizationUser_models_1.OrganizationUserModel.findOne({ userId });
    return organizationUser ? toOrganizationUserDAO(organizationUser) : null;
};
const readByUserAndOrganization = async (userId, organizationId) => {
    const organizationUser = await organizationUser_models_1.OrganizationUserModel.findOne({
        userId,
        organizationId,
    });
    return organizationUser ? toOrganizationUserDAO(organizationUser) : null;
};
const readOrganizationUsers = async (organizationId) => {
    const organizationUsers = await organizationUser_models_1.OrganizationUserModel.find({
        organizationId,
    })
        .populate('userId', 'username name email createdAt updatedAt')
        .sort({ createdAt: -1 });
    return organizationUsers.map(toOrganizationUserDetailsDAO);
};
const readOrganizationStaff = async (organizationId) => {
    const organizationStaff = await organizationUser_models_1.OrganizationUserModel.find({
        organizationId,
        role: 'STAFF',
    })
        .populate('userId', 'username name email createdAt updatedAt')
        .sort({ createdAt: -1 });
    return organizationStaff.map(toOrganizationUserDetailsDAO);
};
const readAdminOrganization = async (userId) => {
    const organizationUser = await organizationUser_models_1.OrganizationUserModel.findOne({
        userId,
        role: 'ADMIN',
    });
    return organizationUser ? toOrganizationUserDAO(organizationUser) : null;
};
const deleteByUserId = async (userId) => {
    await organizationUser_models_1.OrganizationUserModel.deleteMany({ userId });
};
const deleteByOrganizationId = async (organizationId) => {
    await organizationUser_models_1.OrganizationUserModel.deleteMany({ organizationId });
};
exports.organizationUserDAO = {
    toOrganizationUserDAO,
    readByOrganizationId,
    readByUserId,
    readByUserAndOrganization,
    readOrganizationUsers,
    readOrganizationStaff,
    readAdminOrganization,
    deleteByUserId,
    deleteByOrganizationId,
};
//# sourceMappingURL=organizationUser.dao.js.map