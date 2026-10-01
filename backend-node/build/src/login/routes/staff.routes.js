"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const verification_middleware_1 = require("../middleware/verification.middleware");
const router = (0, express_1.Router)();
router.use(verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkOrganizationRole('ADMIN'));
router.post('/staff', user_controller_1.userController.createStaff);
router.get('/organization/staff', user_controller_1.userController.seeCompanyStaff);
router.put('/:staffId', (req, res) => {
    req.params.id = String(req.params.staffId);
    return user_controller_1.userController.updateById(req, res);
});
router.delete('/:staffId', user_controller_1.userController.removeStaffByAdmin);
exports.default = router;
//# sourceMappingURL=staff.routes.js.map