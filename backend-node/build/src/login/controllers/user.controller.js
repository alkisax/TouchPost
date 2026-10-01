"use strict";
// backend/src/login/controllers/user.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_dao_1 = require("../dao/user.dao");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const organizationLifecycle_service_1 = require("../services/organizationLifecycle.service");
const organizationLifecycle_service_2 = require("../services/organizationLifecycle.service");
const deleteSelfAdmin_service_1 = require("../services/deleteSelfAdmin.service");
const errorHandler_1 = require("../../utils/error/errorHandler");
const user_schema_1 = require("../validation/user.schema");
const validateObjectIdParam_1 = require("../../utils/validation/validateObjectIdParam");
// CREATE USER
const create = async (req, res) => {
    try {
        const parsed = user_schema_1.createUserSchema.parse(req.body);
        const existing = await user_dao_1.userDAO.readByUsername(parsed.username);
        if (existing) {
            return res.status(409).json({
                status: false,
                message: "Username already taken",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(parsed.password, 10);
        const newUser = await user_dao_1.userDAO.create({
            username: parsed.username,
            name: parsed.name,
            email: parsed.email,
            globalRoles: parsed.globalRoles,
            hashedPassword,
        });
        return res.status(201).json({
            status: true,
            data: newUser,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// CREATE STAFF
const createStaff = async (req, res) => {
    try {
        const requester = req.user;
        if (!requester) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const adminMembership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(requester.id);
        if (!adminMembership) {
            return res.status(403).json({
                status: false,
                message: "Admin access required",
            });
        }
        const parsed = user_schema_1.createUserSchema.parse(req.body);
        const existing = await user_dao_1.userDAO.readByUsername(parsed.username);
        if (existing) {
            return res.status(409).json({
                status: false,
                message: "Username already taken",
            });
        }
        const result = await (0, organizationLifecycle_service_1.createStaff)({
            username: parsed.username,
            name: parsed.name,
            email: parsed.email,
            organizationId: adminMembership.organizationId,
            password: parsed.password,
        });
        return res.status(201).json({
            status: true,
            data: {
                user: {
                    id: result.user.id,
                    username: result.user.username,
                    name: result.user.name,
                    email: result.user.email,
                    role: 'STAFF',
                },
                membership: {
                    id: result.membership.id,
                    organizationId: result.membership.organizationId,
                    role: result.membership.role,
                },
            },
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// READ
const findAll = async (_req, res) => {
    try {
        const users = await user_dao_1.userDAO.readAll();
        return res.status(200).json({
            status: true,
            data: users,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const findById = async (req, res) => {
    try {
        const { id } = req.params;
        const requester = req;
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, "User ID"))
            return;
        if (!requester.user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const isSuperAdmin = requester.user.globalRoles.includes('SUPERADMIN');
        const isSelf = requester.user.id === id;
        let canManageStaff = false;
        const adminMembership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(requester.user.id);
        if (adminMembership) {
            const targetMembership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(id, adminMembership.organizationId);
            canManageStaff = targetMembership?.role === 'STAFF';
        }
        if (!isSuperAdmin && !isSelf && !canManageStaff) {
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }
        const user = await user_dao_1.userDAO.readById(id);
        return res.status(200).json({
            status: true,
            data: user,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// SEE COMPANY USERS
const seeCompanyUsers = async (req, res) => {
    try {
        const requester = req.user;
        if (!requester) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const adminMembership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(requester.id);
        if (!adminMembership) {
            return res.status(403).json({
                status: false,
                message: "Admin access required",
            });
        }
        const users = await organizationUser_dao_1.organizationUserDAO.readOrganizationUsers(adminMembership.organizationId);
        return res.status(200).json({
            status: true,
            data: users,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// SEE COMPANY STAFF
const seeCompanyStaff = async (req, res) => {
    try {
        const requester = req.user;
        if (!requester) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const adminMembership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(requester.id);
        if (!adminMembership) {
            return res.status(403).json({
                status: false,
                message: "Admin access required",
            });
        }
        const staff = await organizationUser_dao_1.organizationUserDAO.readOrganizationStaff(adminMembership.organizationId);
        return res.status(200).json({
            status: true,
            data: staff.map((member) => ({
                id: member.user.id,
                username: member.user.username,
                name: member.user.name,
                email: member.user.email,
                role: member.role,
                createdAt: member.user.createdAt,
                updatedAt: member.user.updatedAt,
            })),
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// UPDATE USER
const updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const requester = req.user;
        if (!requester) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, "User ID"))
            return;
        const isSuperAdmin = requester.globalRoles.includes("SUPERADMIN");
        const isSelf = requester.id === id;
        // Ελέγχουμε αν ο requester είναι ADMIN και αν ο target user
        // είναι STAFF του ίδιου organization.
        let canManageStaff = false;
        const adminMembership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(requester.id);
        if (adminMembership) {
            const targetMembership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(id, adminMembership.organizationId);
            canManageStaff = targetMembership?.role === "STAFF";
        }
        if (!isSuperAdmin && !isSelf && !canManageStaff) {
            return res.status(403).json({
                status: false,
                message: "Forbidden",
            });
        }
        const parsed = user_schema_1.updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues.map((issue) => issue.message),
            });
        }
        const data = {
            ...parsed.data,
        };
        // Μόνο ο SUPERADMIN μπορεί να αλλάξει global roles.
        if (!isSuperAdmin) {
            delete data.globalRoles;
        }
        if (data.password) {
            data.hashedPassword = await bcrypt_1.default.hash(data.password, 10);
            delete data.password;
        }
        if (isSuperAdmin && data.globalRoles?.includes('SUPERADMIN')) {
            await organizationUser_dao_1.organizationUserDAO.deleteByUserId(id);
        }
        const updated = await user_dao_1.userDAO.update(id, data);
        return res.status(200).json({
            status: true,
            data: updated,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const removeStaffByAdmin = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        const adminMembership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(req.user.id);
        const staffId = String(req.params.staffId);
        const targetMembership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(staffId, adminMembership?.organizationId ?? '');
        if (!adminMembership || targetMembership?.role !== 'STAFF') {
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }
        await (0, organizationLifecycle_service_1.deleteStaff)(adminMembership.organizationId, staffId);
        return res.status(200).json({
            status: true,
            message: `User ${staffId} deleted`,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, 'User ID'))
            return;
        const parsed = user_schema_1.updateRoleSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues,
            });
        }
        const updated = await (0, organizationLifecycle_service_1.changeUserRole)(id, parsed.data.role);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const makeSuperAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, 'User ID'))
            return;
        const updated = await (0, organizationLifecycle_service_1.promoteToSuperAdmin)(id);
        return res.status(200).json({ status: true, data: updated });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// DELETE USER
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const requester = req.user;
        if (!requester) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, "User ID"))
            return;
        const isSuperAdmin = requester.globalRoles.includes("SUPERADMIN");
        const isSelf = requester.id === id;
        let canManageStaff = false;
        // Ο ADMIN μπορεί να διαγράψει μόνο STAFF
        // που ανήκει στο δικό του organization.
        const adminMembership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(requester.id);
        if (adminMembership) {
            const targetMembership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(id, adminMembership.organizationId);
            if (targetMembership?.role === "STAFF") {
                canManageStaff = true;
            }
        }
        if (!isSuperAdmin && !isSelf && !canManageStaff) {
            return res.status(403).json({
                status: false,
                message: "Forbidden",
            });
        }
        // Αν ο ADMIN διαγράφει δικό του STAFF,
        // διαγράφουμε πρώτα τη σχέση με το organization.
        const targetUser = await user_dao_1.userDAO.readById(id);
        const targetMembership = await organizationUser_dao_1.organizationUserDAO.readByUserId(id);
        if (targetUser.globalRoles.length > 0) {
            return res.status(403).json({
                status: false,
                message: 'Global-role users cannot be deleted through this flow',
            });
        }
        if (targetMembership?.role === 'ADMIN') {
            if (isSuperAdmin) {
                await (0, organizationLifecycle_service_2.deleteAdminTenant)(id);
            }
            else if (isSelf) {
                const parsed = user_schema_1.deleteSelfAdminSchema.safeParse(req.body);
                if (!parsed.success) {
                    return res.status(400).json({
                        status: false,
                        details: parsed.error.issues.map((issue) => issue.message),
                    });
                }
                await deleteSelfAdmin_service_1.deleteSelfAdminService.deleteAdminAccountCascade(id, parsed.data.password);
            }
            else {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
        }
        else if (targetMembership?.role === 'STAFF' && canManageStaff && adminMembership) {
            await (0, organizationLifecycle_service_1.deleteStaff)(adminMembership.organizationId, id);
        }
        else {
            if (!isSuperAdmin && !isSelf) {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
            await user_dao_1.userDAO.deleteById(id);
        }
        return res.status(200).json({
            status: true,
            message: `User ${id} deleted`,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
exports.userController = {
    create,
    createStaff,
    removeStaffByAdmin,
    findAll,
    findById,
    seeCompanyUsers,
    seeCompanyStaff,
    updateById,
    updateRole,
    makeSuperAdmin,
    remove,
};
//# sourceMappingURL=user.controller.js.map