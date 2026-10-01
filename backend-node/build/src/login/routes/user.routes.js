"use strict";
// backend/src/login/routes/user.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const verification_middleware_1 = require("../middleware/verification.middleware");
const limiter_1 = require("../../utils/limiter");
const deleteSelfAdmin_controller_1 = require("../controllers/deleteSelfAdmin.controller");
const router = (0, express_1.Router)();
// Διαγράφει αποκλειστικά τον λογαριασμό του authenticated ADMIN.
router.delete('/self', verification_middleware_1.middleware.verifyToken, deleteSelfAdmin_controller_1.deleteSelfAdminController.deleteSelfAdmin);
// CREATE USER - SUPERADMIN ONLY
router.post("/", verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkGlobalRole("SUPERADMIN"), (0, limiter_1.limiter)(15, 5), user_controller_1.userController.create);
// READ ORGANIZATION USERS - ADMIN ONLY
router.get("/organization", verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkOrganizationRole("ADMIN"), user_controller_1.userController.seeCompanyUsers);
// READ ALL USERS - SUPERADMIN ONLY
router.get("/", verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkGlobalRole("SUPERADMIN"), user_controller_1.userController.findAll);
// READ USER BY ID - SUPERADMIN ONLY
router.get("/:id", verification_middleware_1.middleware.verifyToken, user_controller_1.userController.findById);
// Ενημέρωση monetization κατάστασης μόνο από SUPERADMIN.
// UPDATE USER
// Ο controller ελέγχει αν είναι ο ίδιος ο user ή SUPERADMIN.
router.put("/:id", verification_middleware_1.middleware.verifyToken, user_controller_1.userController.updateById);
router.put('/:id/role', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkGlobalRole('SUPERADMIN'), user_controller_1.userController.updateRole);
router.put('/:id/superadmin', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkGlobalRole('SUPERADMIN'), user_controller_1.userController.makeSuperAdmin);
// DELETE USER
// Ο controller ελέγχει αν είναι ο ίδιος ο user ή SUPERADMIN.
router.delete("/:id", verification_middleware_1.middleware.verifyToken, user_controller_1.userController.remove);
exports.default = router;
//# sourceMappingURL=user.routes.js.map