"use strict";
// backend/src/login/controllers/organization.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationController = void 0;
const organization_dao_1 = require("../dao/organization.dao");
const organization_schema_1 = require("../validation/organization.schema");
const errorHandler_1 = require("../../utils/error/errorHandler");
const validateObjectIdParam_1 = require("../../utils/validation/validateObjectIdParam");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const organizationLifecycle_service_1 = require("../services/organizationLifecycle.service");
// CREATE ORGANIZATION
const create = async (req, res) => {
    try {
        if (!req.user || req.user.globalRoles.includes('SUPERADMIN')) {
            return res.status(403).json({ status: false, message: 'ADMIN access required' });
        }
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(req.user.id);
        if (membership?.role !== 'ADMIN') {
            return res.status(403).json({ status: false, message: 'ADMIN access required' });
        }
        const parsed = organization_schema_1.createOrganizationSchema.parse(req.body);
        const result = await (0, organizationLifecycle_service_1.createOrganizationForAdmin)(req.user.id, parsed.name);
        return res.status(201).json({
            status: true,
            data: result.organization,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// READ
const findAll = async (_req, res) => {
    try {
        const organizations = await organization_dao_1.organizationDAO.readAll();
        return res.status(200).json({
            status: true,
            data: organizations,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const findMine = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(req.user.id);
        if (!membership || membership.role !== 'ADMIN') {
            return res.status(200).json({ status: true, data: [] });
        }
        const organization = await organization_dao_1.organizationDAO.readById(membership.organizationId);
        return res.status(200).json({ status: true, data: [organization] });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const findById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, "Organization ID"))
            return;
        if (!req.user)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        if (!req.user.globalRoles.includes('SUPERADMIN')) {
            const membership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(req.user.id, id);
            if (membership?.role !== 'ADMIN') {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
        }
        const organization = await organization_dao_1.organizationDAO.readById(id);
        return res.status(200).json({
            status: true,
            data: organization,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// UPDATE
const updateById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, "Organization ID"))
            return;
        if (!req.user)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        if (!req.user.globalRoles.includes('SUPERADMIN')) {
            const membership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(req.user.id, id);
            if (membership?.role !== 'ADMIN') {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
        }
        const parsed = organization_schema_1.updateOrganizationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                details: parsed.error.issues.map((issue) => issue.message),
            });
        }
        const updated = await organization_dao_1.organizationDAO.update(id, parsed.data);
        return res.status(200).json({
            status: true,
            data: updated,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// DELETE
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(id, res, "Organization ID"))
            return;
        if (!req.user)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        if (!req.user.globalRoles.includes('SUPERADMIN')) {
            const membership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(req.user.id, id);
            if (membership?.role !== 'ADMIN') {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
        }
        const deleted = await (0, organizationLifecycle_service_1.deleteOrganizationPreservingAdmins)(id);
        return res.status(200).json({
            status: true,
            message: `Organization ${deleted.name} deleted`,
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
exports.organizationController = {
    create,
    findAll,
    findMine,
    findById,
    updateById,
    remove,
};
//# sourceMappingURL=organization.controller.js.map