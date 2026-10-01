"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationMonetizationController = void 0;
const errorHandler_1 = require("../../utils/error/errorHandler");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const organization_models_1 = require("../models/organization.models");
const validateObjectIdParam_1 = require("../../utils/validation/validateObjectIdParam");
// Η περίοδος χωρίς διαφημίσεις μετά από ad watch είναι 23 ώρες.
const AD_FREE_DURATION_HOURS = 10;
const getEffectiveAdFreeUntil = (adFreeUntil) => {
    if (!adFreeUntil || adFreeUntil <= new Date()) {
        return null;
    }
    return adFreeUntil;
};
const recordAdWatched = async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        if (!req.user) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }
        const callerMembership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(req.user.id, organizationId);
        if (!callerMembership ||
            !['ADMIN', 'STAFF'].includes(callerMembership.role)) {
            return res.status(403).json({
                status: false,
                message: 'Forbidden',
            });
        }
        const organization = await organization_models_1.OrganizationModel.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ status: false, message: 'Organization not found' });
        }
        if (organization.hasPaid) {
            return res.status(200).json({
                status: true,
                data: {
                    organizationId,
                    hasPaid: organization.hasPaid,
                    adFreeUntil: getEffectiveAdFreeUntil(organization.adFreeUntil),
                },
            });
        }
        const adFreeUntil = new Date(Date.now() + AD_FREE_DURATION_HOURS * 60 * 60 * 1000);
        organization.hasPaid = false;
        organization.adFreeUntil = adFreeUntil;
        await organization.save();
        return res.status(200).json({
            status: true,
            data: {
                organizationId,
                hasPaid: organization.hasPaid,
                adFreeUntil: getEffectiveAdFreeUntil(organization.adFreeUntil),
            },
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const readOrganizationMonetization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        if (!(0, validateObjectIdParam_1.validateIdParam)(organizationId, res, 'Organization ID'))
            return;
        if (!req.user) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }
        const callerMembership = await organizationUser_dao_1.organizationUserDAO.readByUserAndOrganization(req.user.id, organizationId);
        if (!callerMembership ||
            !['ADMIN', 'STAFF'].includes(callerMembership.role)) {
            return res.status(403).json({
                status: false,
                message: 'Forbidden',
            });
        }
        const organization = await organization_models_1.OrganizationModel.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ status: false, message: 'Organization not found' });
        }
        return res.status(200).json({
            status: true,
            data: {
                organizationId,
                hasPaid: organization.hasPaid,
                adFreeUntil: getEffectiveAdFreeUntil(organization.adFreeUntil),
            },
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
exports.organizationMonetizationController = {
    recordAdWatched,
    readOrganizationMonetization,
};
//# sourceMappingURL=organizationMonetization.controller.js.map