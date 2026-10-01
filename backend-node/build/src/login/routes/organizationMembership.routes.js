"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationMembership_controller_1 = require("../controllers/organizationMembership.controller");
const verification_middleware_1 = require("../middleware/verification.middleware");
const organizationMonetization_controller_1 = require("../controllers/organizationMonetization.controller");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const router = (0, express_1.Router)();
router.use(verification_middleware_1.middleware.verifyToken);
router.get('/mine', organizationMembership_controller_1.organizationMembershipController.getMine);
const withMineOrganization = async (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ status: false, message: 'Unauthorized' });
    const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(req.user.id);
    if (!membership || !['ADMIN', 'STAFF'].includes(membership.role)) {
        return res.status(403).json({ status: false, message: 'Forbidden' });
    }
    req.params.organizationId = membership.organizationId;
    return next();
};
router.get('/mine/ad-status', withMineOrganization, organizationMonetization_controller_1.organizationMonetizationController.readOrganizationMonetization);
router.post('/mine/ad-free', withMineOrganization, organizationMonetization_controller_1.organizationMonetizationController.recordAdWatched);
router.get('/user/:userId', verification_middleware_1.middleware.checkGlobalRole('SUPERADMIN'), organizationMembership_controller_1.organizationMembershipController.getByUser);
router.get('/company/:organizationId', verification_middleware_1.middleware.checkAdminOrSuperAdmin, organizationMembership_controller_1.organizationMembershipController.getByOrganization);
router.get('/company/:organizationId/staff', verification_middleware_1.middleware.checkAdminOrSuperAdmin, organizationMembership_controller_1.organizationMembershipController.getStaffByOrganization);
exports.default = router;
//# sourceMappingURL=organizationMembership.routes.js.map