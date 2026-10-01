"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organization_controller_1 = require("../controllers/organization.controller");
const verification_middleware_1 = require("../middleware/verification.middleware");
const router = (0, express_1.Router)();
router.get('/', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkGlobalRole('SUPERADMIN'), organization_controller_1.organizationController.findAll);
router.get('/mine', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkAdminOrSuperAdmin, organization_controller_1.organizationController.findMine);
router.get('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkAdminOrSuperAdmin, organization_controller_1.organizationController.findById);
router.post('/', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkAdminOrSuperAdmin, organization_controller_1.organizationController.create);
router.put('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkAdminOrSuperAdmin, organization_controller_1.organizationController.updateById);
router.delete('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkAdminOrSuperAdmin, organization_controller_1.organizationController.remove);
exports.default = router;
//# sourceMappingURL=organization.routes.js.map