"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superadminController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_dao_1 = require("../dao/user.dao");
const organization_dao_1 = require("../dao/organization.dao");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const organization_models_1 = require("../models/organization.models");
const errorHandler_1 = require("../../utils/error/errorHandler");
const validateObjectIdParam_1 = require("../../utils/validation/validateObjectIdParam");
const errors_types_1 = require("../../utils/error/errors.types");
const superadmin_dao_1 = require("./superadmin.dao");
const superadmin_schema_1 = require("./superadmin.schema");
const organizationLifecycle_service_1 = require("../services/organizationLifecycle.service");
const users_models_1 = require("../models/users.models");
const organizationUser_models_1 = require("../models/organizationUser.models");
const managedUser = async (userId) => {
    const user = await users_models_1.UserModel.findById(userId).lean();
    if (!user || user.globalRoles.includes('SUPERADMIN')) {
        return null;
    }
    const membership = await organizationUser_models_1.OrganizationUserModel.findOne({ userId }).lean();
    let organization = null;
    if (membership) {
        const found = await organization_models_1.OrganizationModel.findById(membership.organizationId).lean();
        if (!found) {
            return null;
        }
        organization = {
            id: found._id.toString(),
            name: found.name,
            slug: found.slug,
        };
    }
    const role = membership?.role ?? 'USER';
    return {
        user: {
            id: user._id.toString(),
            username: user.username,
            name: user.name ?? null,
            email: user.email ?? null,
            role,
        },
        organization,
        membership: membership
            ? { id: membership._id.toString(), role: membership.role }
            : null,
    };
};
const listUsers = async (_req, res) => {
    try {
        const users = await users_models_1.UserModel.find({ globalRoles: { $size: 0 } })
            .sort({ createdAt: -1 })
            .lean();
        const data = (await Promise.all(users.map((user) => managedUser(user._id.toString())))).filter(Boolean);
        return res.status(200).json({ status: true, data });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getUser = async (req, res) => {
    try {
        const data = await managedUser(String(req.params.userId));
        if (!data) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        return res.status(200).json({ status: true, data });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const createPlainUser = async (req, res) => {
    try {
        const parsed = superadmin_schema_1.createStaffSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues,
            });
        }
        const existing = await user_dao_1.userDAO.readByUsername(parsed.data.username);
        if (existing) {
            return res.status(409).json({
                status: false,
                message: 'Username already taken',
            });
        }
        const created = await (0, organizationLifecycle_service_1.createUser)(parsed.data);
        const data = await managedUser(created.id);
        return res.status(201).json({ status: true, data });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const updateManagedUser = async (req, res) => {
    try {
        const id = String(req.params.userId);
        const current = await managedUser(id);
        if (!current)
            return res.status(404).json({ status: false, message: 'User not found' });
        const parsed = superadmin_schema_1.updateAdminSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ status: false, details: parsed.error.issues });
        const updated = await user_dao_1.userDAO.updateProfile(id, await parseProfileUpdate(parsed.data));
        const data = await managedUser(updated.id);
        return res.status(200).json({ status: true, data });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const deletePlainUser = async (req, res) => {
    try {
        const id = String(req.params.userId);
        const current = await managedUser(id);
        if (!current || current.membership)
            return res.status(400).json({ status: false, message: 'Only plain USER accounts can be deleted' });
        await user_dao_1.userDAO.deleteById(id);
        return res.status(200).json({ status: true, message: 'User deleted successfully' });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const listAdmins = async (_req, res) => {
    try {
        const memberships = await superadmin_dao_1.superadminDAO.readAdminMemberships();
        return res.status(200).json({
            status: true,
            data: memberships,
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        const user = await user_dao_1.userDAO.readById(userId);
        const membership = await superadmin_dao_1.superadminDAO.readMembershipByUserId(userId);
        if (!membership || membership.role !== 'ADMIN') {
            throw new errors_types_1.NotFoundError('ADMIN membership not found');
        }
        return res.status(200).json({
            status: true,
            data: { user, membership },
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const listOrganizations = async (_req, res) => {
    try {
        const organizations = await superadmin_dao_1.superadminDAO.readOrganizationsWithCounts();
        return res.status(200).json({ status: true, data: organizations });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        const organization = await organization_dao_1.organizationDAO.readById(organizationId);
        const members = await superadmin_dao_1.superadminDAO.readMembersByOrganizationId(organizationId);
        return res.status(200).json({
            status: true,
            data: {
                organization,
                admins: members.filter((member) => member.role === 'ADMIN'),
                staff: members.filter((member) => member.role === 'STAFF'),
                memberCount: members.length,
            },
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getSummary = async (_req, res) => {
    try {
        return res.status(200).json({
            status: true,
            data: await superadmin_dao_1.superadminDAO.readSummary(),
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const parseProfileUpdate = async (input) => {
    const data = {
        username: input.username,
        name: input.name,
        email: input.email,
    };
    if (input.password) {
        data.hashedPassword = await bcrypt_1.default.hash(input.password, 10);
    }
    return data;
};
const createAdmin = async (req, res) => {
    try {
        const parsed = superadmin_schema_1.createAdminSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues.map((issue) => issue.message),
            });
        }
        const existing = await user_dao_1.userDAO.readByUsername(parsed.data.username);
        if (existing) {
            return res.status(409).json({ status: false, message: 'Username already taken' });
        }
        const result = await (0, organizationLifecycle_service_1.createAdminWithOrganization)({
            username: parsed.data.username,
            name: parsed.data.name,
            email: parsed.data.email,
            password: parsed.data.password,
            organizationName: parsed.data.organizationName,
        });
        return res.status(201).json({ status: true, data: await managedUser(result.user.id) });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const updateUserAdStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        const parsed = superadmin_schema_1.updateUserAdStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues.map((issue) => issue.message),
            });
        }
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(userId);
        if (!membership || !['ADMIN', 'STAFF'].includes(membership.role)) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const organization = await organization_models_1.OrganizationModel.findByIdAndUpdate(membership.organizationId, {
            hasPaid: parsed.data.hasPaid,
            adFreeUntil: parsed.data.adFreeUntil ?? null,
        }, { returnDocument: 'after' });
        if (!organization) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        return res.status(200).json({
            status: true,
            data: {
                hasPaid: organization.hasPaid,
                adFreeUntil: organization.adFreeUntil ?? null,
            },
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getUserAdStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        const user = await users_models_1.UserModel.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(userId);
        if (!membership || !['ADMIN', 'STAFF'].includes(membership.role)) {
            return res.status(404).json({
                status: false,
                message: 'User organization monetization status not found',
            });
        }
        const organization = await organization_models_1.OrganizationModel.findById(membership.organizationId).lean();
        if (!organization) {
            return res.status(404).json({
                status: false,
                message: 'User organization monetization status not found',
            });
        }
        const effectiveAdFreeUntil = organization.adFreeUntil && organization.adFreeUntil > new Date()
            ? organization.adFreeUntil
            : null;
        return res.status(200).json({
            status: true,
            data: {
                hasPaid: organization.hasPaid,
                adFreeUntil: effectiveAdFreeUntil,
            },
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const updateAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(userId);
        if (!membership || membership.role !== 'ADMIN') {
            throw new errors_types_1.NotFoundError('ADMIN membership not found');
        }
        const parsed = superadmin_schema_1.updateAdminSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues.map((issue) => issue.message),
            });
        }
        const data = await parseProfileUpdate(parsed.data);
        const updated = await user_dao_1.userDAO.updateProfile(userId, data);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const deleteAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        if (req.user?.id === userId) {
            throw new errors_types_1.ValidationError('SUPERADMIN cannot delete its own account here');
        }
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(userId);
        if (!membership || membership.role !== 'ADMIN') {
            throw new errors_types_1.NotFoundError('ADMIN membership not found');
        }
        await (0, organizationLifecycle_service_1.deleteAdminTenant)(userId);
        return res.status(200).json({
            status: true,
            message: 'ADMIN and organization data deleted successfully',
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const createStaff = async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        await organization_dao_1.organizationDAO.readById(organizationId);
        const parsed = superadmin_schema_1.createStaffSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues.map((issue) => issue.message),
            });
        }
        const existing = await user_dao_1.userDAO.readByUsername(parsed.data.username);
        if (existing) {
            return res.status(409).json({ status: false, message: 'Username already taken' });
        }
        const result = await (0, organizationLifecycle_service_1.createStaff)({
            username: parsed.data.username,
            name: parsed.data.name,
            email: parsed.data.email,
            organizationId,
            password: parsed.data.password,
        });
        return res.status(201).json({ status: true, data: await managedUser(result.user.id) });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const updateStaff = async (req, res) => {
    try {
        const { organizationId, userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        await organization_dao_1.organizationDAO.readById(organizationId);
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(userId, organizationId);
        if (!membership || membership.role !== 'STAFF') {
            throw new errors_types_1.NotFoundError('STAFF membership not found');
        }
        const parsed = superadmin_schema_1.updateStaffSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues.map((issue) => issue.message),
            });
        }
        const data = await parseProfileUpdate(parsed.data);
        const updated = await user_dao_1.userDAO.updateProfile(userId, data);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const removeStaff = async (req, res) => {
    try {
        const { organizationId, userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(userId, organizationId);
        if (!membership || membership.role !== 'STAFF') {
            throw new errors_types_1.NotFoundError('STAFF membership not found');
        }
        await (0, organizationLifecycle_service_1.deleteStaff)(organizationId, userId);
        return res.status(200).json({
            status: true,
            message: 'STAFF membership removed',
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const deleteStaffByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        const user = await users_models_1.UserModel.findById(userId).lean();
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(userId);
        if (!user ||
            user.globalRoles.length > 0 ||
            !membership ||
            membership.role !== 'STAFF') {
            return res.status(404).json({
                status: false,
                message: 'Staff user not found',
            });
        }
        await (0, organizationLifecycle_service_1.deleteStaff)(membership.organizationId, userId);
        return res.status(200).json({
            status: true,
            message: 'Staff deleted successfully',
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
exports.superadminController = {
    listUsers,
    getUser,
    createPlainUser,
    updateManagedUser,
    deletePlainUser,
    listAdmins,
    getAdmin,
    listOrganizations,
    getOrganization,
    getSummary,
    updateUserAdStatus,
    getUserAdStatus,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    createStaff,
    updateStaff,
    removeStaff,
    deleteStaffByUserId,
};
//# sourceMappingURL=superadmin.controller.js.map