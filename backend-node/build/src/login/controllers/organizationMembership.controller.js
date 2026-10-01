"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationMembershipController = void 0;
const organization_dao_1 = require("../dao/organization.dao");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const errorHandler_1 = require("../../utils/error/errorHandler");
const validateObjectIdParam_1 = require("../../utils/validation/validateObjectIdParam");
const getMine = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(req.user.id);
        if (!membership)
            return res.status(200).json({ status: true, data: [] });
        const organization = await organization_dao_1.organizationDAO.readById(membership.organizationId);
        return res.status(200).json({ status: true, data: [organization] });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(userId, res, 'User ID'))
            return;
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(userId);
        return res.status(200).json({ status: true, data: membership ? [membership] : [] });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getByOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        if (!req.user)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        if (!req.user.globalRoles.includes('SUPERADMIN')) {
            const membership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(req.user.id, organizationId);
            if (membership?.role !== 'ADMIN') {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
        }
        const memberships = await organizationUser_dao_1.organizationUserDAO.readByOrganizationId(organizationId);
        return res.status(200).json({ status: true, data: memberships });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getStaffByOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        if (!req.user)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        if (!req.user.globalRoles.includes('SUPERADMIN')) {
            const membership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(req.user.id, organizationId);
            if (membership?.role !== 'ADMIN') {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
        }
        const staff = await organizationUser_dao_1.organizationUserDAO.readOrganizationStaff(organizationId);
        return res.status(200).json({ status: true, data: staff });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
exports.organizationMembershipController = {
    getMine,
    getByUser,
    getByOrganization,
    getStaffByOrganization,
};
//# sourceMappingURL=organizationMembership.controller.js.map