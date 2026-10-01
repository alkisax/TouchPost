"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verification_middleware_1 = require("../login/middleware/verification.middleware");
const stripe_payment_controller_1 = require("./stripe.payment.controller");
const router = (0, express_1.Router)();
// Payment creation is tenant-scoped through the authenticated ADMIN. The
// organization is resolved from the JWT user, not from request-supplied IDs.
router.post('/checkout', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkOrganizationRole('ADMIN'), stripe_payment_controller_1.stripePaymentController.createCheckoutSession);
exports.default = router;
//# sourceMappingURL=stripe.payment.routes.js.map