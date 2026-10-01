// backend/src/login/routes/user.routes.ts

import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { middleware } from "../middleware/verification.middleware";
import { limiter } from "../../utils/limiter";
import { deleteSelfAdminController } from '../controllers/deleteSelfAdmin.controller';

const router = Router();

// Διαγράφει αποκλειστικά τον λογαριασμό του authenticated ADMIN.
router.delete(
  '/self',
  middleware.verifyToken,
  deleteSelfAdminController.deleteSelfAdmin,
);

// CREATE USER - SUPERADMIN ONLY
router.post(
  "/",
  middleware.verifyToken,
  middleware.checkGlobalRole("SUPERADMIN"),
  limiter(15, 5),
  userController.create,
);

// READ ORGANIZATION USERS - ADMIN ONLY
router.get(
  "/organization",
  middleware.verifyToken,
  middleware.checkOrganizationRole("ADMIN"),
  userController.seeCompanyUsers,
);

// READ ALL USERS - SUPERADMIN ONLY
router.get(
  "/",
  middleware.verifyToken,
  middleware.checkGlobalRole("SUPERADMIN"),
  userController.findAll,
);

// READ USER BY ID - SUPERADMIN ONLY
router.get(
  "/:id",
  middleware.verifyToken,
  userController.findById,
);

// Ενημέρωση monetization κατάστασης μόνο από SUPERADMIN.
// UPDATE USER
// Ο controller ελέγχει αν είναι ο ίδιος ο user ή SUPERADMIN.
router.put("/:id", middleware.verifyToken, userController.updateById);

router.put(
  '/:id/role',
  middleware.verifyToken,
  middleware.checkGlobalRole('SUPERADMIN'),
  userController.updateRole,
);

router.put(
  '/:id/superadmin',
  middleware.verifyToken,
  middleware.checkGlobalRole('SUPERADMIN'),
  userController.makeSuperAdmin,
);

// DELETE USER
// Ο controller ελέγχει αν είναι ο ίδιος ο user ή SUPERADMIN.
router.delete("/:id", middleware.verifyToken, userController.remove);

export default router;
