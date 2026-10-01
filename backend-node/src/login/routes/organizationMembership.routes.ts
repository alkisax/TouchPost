import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { organizationMembershipController } from '../controllers/organizationMembership.controller';
import { middleware } from '../middleware/verification.middleware';
import { organizationMonetizationController } from '../controllers/organizationMonetization.controller';
import { organizationUserDAO } from '../dao/organizationUser.dao';

const router = Router();

router.use(middleware.verifyToken);

router.get('/mine', organizationMembershipController.getMine);

const withMineOrganization = async (
  req: Request & { user?: { id: string } },
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });
  const membership = await organizationUserDAO.readByUserId(req.user.id);
  if (!membership || !['ADMIN', 'STAFF'].includes(membership.role)) {
    return res.status(403).json({ status: false, message: 'Forbidden' });
  }
  req.params.organizationId = membership.organizationId;
  return next();
};

router.get(
  '/mine/ad-status',
  withMineOrganization,
  organizationMonetizationController.readOrganizationMonetization,
);

router.post(
  '/mine/ad-free',
  withMineOrganization,
  organizationMonetizationController.recordAdWatched,
);

router.get(
  '/user/:userId',
  middleware.checkGlobalRole('SUPERADMIN'),
  organizationMembershipController.getByUser,
);

router.get(
  '/company/:organizationId',
  middleware.checkAdminOrSuperAdmin,
  organizationMembershipController.getByOrganization,
);

router.get(
  '/company/:organizationId/staff',
  middleware.checkAdminOrSuperAdmin,
  organizationMembershipController.getStaffByOrganization,
);

export default router;
