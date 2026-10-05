import { Router } from 'express';

import { organizationMonetizationController } from '../controllers/organizationMonetization.controller';
import { middleware } from '../middleware/verification.middleware';

const router = Router();

router.get(
  '/:organizationId/monetization',
  middleware.verifyToken,
  middleware.checkOrganizationRoles(['ADMIN', 'STAFF']),
  organizationMonetizationController.readOrganizationMonetization,
);

router.post(
  '/:organizationId/ad-watched',
  middleware.verifyToken,
  middleware.checkOrganizationRoles(['ADMIN', 'STAFF']),
  organizationMonetizationController.recordAdWatched,
);

export default router;
