"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationMonetization_controller_1 = require("../controllers/organizationMonetization.controller");
const verification_middleware_1 = require("../middleware/verification.middleware");
const router = (0, express_1.Router)();
router.get('/:organizationId/monetization', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkOrganizationRoles(['ADMIN', 'STAFF']), organizationMonetization_controller_1.organizationMonetizationController.readOrganizationMonetization);
router.post('/:organizationId/ad-watched', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkOrganizationRoles(['ADMIN', 'STAFF']), organizationMonetization_controller_1.organizationMonetizationController.recordAdWatched);
exports.default = router;
//# sourceMappingURL=organizationMonetization.routes.js.map