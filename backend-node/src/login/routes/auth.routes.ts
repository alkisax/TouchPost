// backend/src/login/routes/auth.routes.ts
import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { limiter } from "../../utils/limiter";

const router = Router();

// LOGIN
router.post("/login", limiter(1, 150), authController.login);

// Register
router.post("/register-admin", limiter(1, 150), authController.registerAdmin);
router.post("/register-user", limiter(1, 150), authController.registerUser);

// REFRESH TOKEN
router.post("/refresh", limiter(1, 150), authController.refreshToken);

export default router;
