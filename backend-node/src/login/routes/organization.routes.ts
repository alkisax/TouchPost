import { Router } from 'express';

import { organizationController } from '../controllers/organization.controller';
import { middleware } from '../middleware/verification.middleware';

const router = Router();

router.get(
  '/',
  middleware.verifyToken,
  middleware.checkGlobalRole('SUPERADMIN'),
  organizationController.findAll,
);

router.get(
  '/mine',
  middleware.verifyToken,
  middleware.checkAdminOrSuperAdmin,
  organizationController.findMine,
);

router.get(
  '/:id',
  middleware.verifyToken,
  middleware.checkAdminOrSuperAdmin,
  organizationController.findById,
);

router.post(
  '/',
  middleware.verifyToken,
  middleware.checkAdminOrSuperAdmin,
  organizationController.create,
);

router.put(
  '/:id',
  middleware.verifyToken,
  middleware.checkAdminOrSuperAdmin,
  organizationController.updateById,
);

router.delete(
  '/:id',
  middleware.verifyToken,
  middleware.checkAdminOrSuperAdmin,
  organizationController.remove,
);

export default router;
