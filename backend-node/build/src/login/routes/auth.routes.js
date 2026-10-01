"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/login/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const limiter_1 = require("../../utils/limiter");
const router = (0, express_1.Router)();
// LOGIN
router.post("/login", (0, limiter_1.limiter)(1, 150), auth_controller_1.authController.login);
// Register
router.post("/register-admin", (0, limiter_1.limiter)(1, 150), auth_controller_1.authController.registerAdmin);
router.post("/register-user", (0, limiter_1.limiter)(1, 150), auth_controller_1.authController.registerUser);
// REFRESH TOKEN
router.post("/refresh", (0, limiter_1.limiter)(1, 150), auth_controller_1.authController.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map