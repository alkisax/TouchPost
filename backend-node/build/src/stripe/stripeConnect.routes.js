"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verification_middleware_1 = require("../login/middleware/verification.middleware");
const stripeConnect_controller_1 = require("./stripeConnect.controller");
const router = (0, express_1.Router)();
router.use(verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkOrganizationRole('ADMIN'));
router.post('/account', stripeConnect_controller_1.stripeConnectController.createConnectedAccount);
router.post('/onboarding-link', stripeConnect_controller_1.stripeConnectController.createOnboardingLink);
router.get('/status', stripeConnect_controller_1.stripeConnectController.getConnectedAccountStatus);
exports.default = router;
//# sourceMappingURL=stripeConnect.routes.js.map