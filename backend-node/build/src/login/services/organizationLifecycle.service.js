"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoteToSuperAdmin = exports.changeUserRole = exports.deleteOrganizationPreservingAdmins = exports.deleteAdminTenant = exports.deleteStaff = exports.createStaff = exports.createOrganizationForAdmin = exports.createUser = exports.createAdminWithOrganization = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const organization_models_1 = require("../models/organization.models");
const organizationUser_models_1 = require("../models/organizationUser.models");
const users_models_1 = require("../models/users.models");
const organization_dao_1 = require("../dao/organization.dao");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const user_dao_1 = require("../dao/user.dao");
const errors_types_1 = require("../../utils/error/errors.types");
const createUserDocument = async (input) => new users_models_1.UserModel({
    username: input.username,
    name: input.name,
    email: input.email,
    hashedPassword: await bcrypt_1.default.hash(input.password, 10),
    globalRoles: [],
});
const createAdminWithOrganization = async (input) => {
    const session = await mongoose_1.default.startSession();
    try {
        let userView;
        let organizationView;
        let membershipView;
        await session.withTransaction(async () => {
            const user = await createUserDocument(input);
            await user.save({ session });
            const organization = await organization_dao_1.organizationDAO.create({ name: input.organizationName }, session);
            const membership = new organizationUser_models_1.OrganizationUserModel({
                userId: user._id,
                organizationId: organization.id,
                role: 'ADMIN',
            });
            await membership.save({ session });
            userView = user_dao_1.userDAO.toUserDAO(user);
            organizationView = organization;
            membershipView = organizationUser_dao_1.organizationUserDAO.toOrganizationUserDAO(membership);
        });
        return { user: userView, organization: organizationView, membership: membershipView };
    }
    finally {
        await session.endSession();
    }
};
exports.createAdminWithOrganization = createAdminWithOrganization;
const createUser = async (input) => {
    const user = await createUserDocument(input);
    const saved = await user.save();
    return user_dao_1.userDAO.toUserDAO(saved);
};
exports.createUser = createUser;
const createOrganizationForAdmin = async (adminUserId, name) => {
    const adminMembership = await organizationUser_models_1.OrganizationUserModel.findOne({
        userId: adminUserId,
        role: 'ADMIN',
    });
    if (adminMembership) {
        throw new errors_types_1.ValidationError('ADMIN already belongs to an organization');
    }
    const session = await mongoose_1.default.startSession();
    try {
        let organizationView;
        let membershipView;
        await session.withTransaction(async () => {
            const organization = await organization_dao_1.organizationDAO.create({ name }, session);
            const membership = new organizationUser_models_1.OrganizationUserModel({
                userId: adminUserId,
                organizationId: organization.id,
                role: 'ADMIN',
            });
            const savedMembership = await membership.save({ session });
            organizationView = organization;
            membershipView = organizationUser_dao_1.organizationUserDAO.toOrganizationUserDAO(savedMembership);
        });
        return { organization: organizationView, membership: membershipView };
    }
    finally {
        await session.endSession();
    }
};
exports.createOrganizationForAdmin = createOrganizationForAdmin;
const createStaff = async (input) => {
    const organization = await organization_models_1.OrganizationModel.findById(input.organizationId);
    if (!organization)
        throw new errors_types_1.NotFoundError('Organization not found');
    const session = await mongoose_1.default.startSession();
    try {
        let userView;
        let membershipView;
        await session.withTransaction(async () => {
            const user = await createUserDocument(input);
            await user.save({ session });
            const membership = new organizationUser_models_1.OrganizationUserModel({
                userId: user._id,
                organizationId: organization._id,
                role: 'STAFF',
            });
            await membership.save({ session });
            userView = user_dao_1.userDAO.toUserDAO(user);
            membershipView = organizationUser_dao_1.organizationUserDAO.toOrganizationUserDAO(membership);
        });
        return { user: userView, membership: membershipView };
    }
    finally {
        await session.endSession();
    }
};
exports.createStaff = createStaff;
const deleteStaff = async (organizationId, userId) => {
    const membership = await organizationUser_models_1.OrganizationUserModel.findOne({
        organizationId,
        userId,
        role: 'STAFF',
    });
    if (!membership)
        throw new errors_types_1.NotFoundError('STAFF membership not found');
    const user = await users_models_1.UserModel.findById(userId);
    if (!user)
        throw new errors_types_1.NotFoundError('User not found');
    if (user.globalRoles.length > 0) {
        throw new errors_types_1.ValidationError('A STAFF deletion cannot remove a global-role user');
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await organizationUser_models_1.OrganizationUserModel.deleteOne({ _id: membership._id }, { session });
            await users_models_1.UserModel.deleteOne({ _id: user._id }, { session });
        });
    }
    finally {
        await session.endSession();
    }
};
exports.deleteStaff = deleteStaff;
const deleteAdminTenant = async (userId) => {
    const user = await users_models_1.UserModel.findById(userId);
    if (!user)
        throw new errors_types_1.NotFoundError('User not found');
    if (user.globalRoles.length > 0) {
        throw new errors_types_1.ValidationError('Accounts with global roles cannot own an organization');
    }
    const memberships = await organizationUser_models_1.OrganizationUserModel.find({ userId });
    if (memberships.length !== 1 || memberships[0].role !== 'ADMIN') {
        throw new errors_types_1.ValidationError('ADMIN must have exactly one organization membership');
    }
    const organizationId = memberships[0].organizationId;
    const organizationMemberships = await organizationUser_models_1.OrganizationUserModel.find({ organizationId });
    const adminCount = organizationMemberships.filter((item) => item.role === 'ADMIN').length;
    if (adminCount !== 1) {
        throw new errors_types_1.ValidationError('Organization must have exactly one ADMIN');
    }
    const staffIds = organizationMemberships
        .filter((item) => item.role === 'STAFF')
        .map((item) => item.userId);
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await organizationUser_models_1.OrganizationUserModel.deleteMany({ organizationId }, { session });
            if (staffIds.length > 0) {
                await users_models_1.UserModel.deleteMany({ _id: { $in: staffIds }, globalRoles: { $size: 0 } }, { session });
            }
            await organization_models_1.OrganizationModel.deleteOne({ _id: organizationId }, { session });
            await users_models_1.UserModel.deleteOne({ _id: userId }, { session });
        });
    }
    finally {
        await session.endSession();
    }
};
exports.deleteAdminTenant = deleteAdminTenant;
const deleteOrganizationPreservingAdmins = async (organizationId) => {
    const organization = await organization_models_1.OrganizationModel.findById(organizationId);
    if (!organization)
        throw new errors_types_1.NotFoundError('Organization not found');
    const memberships = await organizationUser_models_1.OrganizationUserModel.find({ organizationId });
    const staffIds = memberships
        .filter((membership) => membership.role === 'STAFF')
        .map((membership) => membership.userId);
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await organizationUser_models_1.OrganizationUserModel.deleteMany({ organizationId }, { session });
            if (staffIds.length > 0) {
                await users_models_1.UserModel.deleteMany({ _id: { $in: staffIds }, globalRoles: { $size: 0 } }, { session });
            }
            await organization_models_1.OrganizationModel.deleteOne({ _id: organizationId }, { session });
        });
        return organization_dao_1.organizationDAO.toOrganizationDAO(organization);
    }
    finally {
        await session.endSession();
    }
};
exports.deleteOrganizationPreservingAdmins = deleteOrganizationPreservingAdmins;
const changeUserRole = async (userId, role) => {
    const user = await users_models_1.UserModel.findById(userId);
    if (!user)
        throw new errors_types_1.NotFoundError('User not found');
    const membership = await organizationUser_models_1.OrganizationUserModel.findOne({ userId });
    if ((role === 'ADMIN' || role === 'STAFF') && !membership) {
        throw new errors_types_1.ValidationError('The user must already belong to an organization');
    }
    if (role === 'ADMIN' && membership) {
        const anotherAdmin = await organizationUser_models_1.OrganizationUserModel.findOne({
            organizationId: membership.organizationId,
            role: 'ADMIN',
            userId: { $ne: userId },
        });
        if (anotherAdmin)
            throw new errors_types_1.ValidationError('Organization already has an ADMIN');
    }
    const session = await mongoose_1.default.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            if (role === 'USER') {
                await organizationUser_models_1.OrganizationUserModel.deleteOne({ userId }, { session });
            }
            else {
                await organizationUser_models_1.OrganizationUserModel.updateOne({ userId }, { role }, { session });
            }
            user.globalRoles = [];
            await user.save({ session });
            result = user_dao_1.userDAO.toUserDAO(user);
        });
        return result;
    }
    finally {
        await session.endSession();
    }
};
exports.changeUserRole = changeUserRole;
const promoteToSuperAdmin = async (userId) => {
    const user = await users_models_1.UserModel.findById(userId);
    if (!user)
        throw new errors_types_1.NotFoundError('User not found');
    const session = await mongoose_1.default.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            await organizationUser_models_1.OrganizationUserModel.deleteOne({ userId }, { session });
            user.globalRoles = ['SUPERADMIN'];
            await user.save({ session });
            result = user_dao_1.userDAO.toUserDAO(user);
        });
        return result;
    }
    finally {
        await session.endSession();
    }
};
exports.promoteToSuperAdmin = promoteToSuperAdmin;
//# sourceMappingURL=organizationLifecycle.service.js.map