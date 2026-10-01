import type { Response } from 'express';

import { organizationDAO } from '../dao/organization.dao';
import { organizationUserDAO } from '../dao/organizationUser.dao';
import type { AuthRequest } from '../types/user.types';
import { handleControllerError } from '../../utils/error/errorHandler';
import { validateIdParam } from '../../utils/validation/validateObjectIdParam';

const getMine = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });
    const membership = await organizationUserDAO.readByUserId(req.user.id);
    if (!membership) return res.status(200).json({ status: true, data: [] });
    const organization = await organizationDAO.readById(membership.organizationId);
    return res.status(200).json({ status: true, data: [organization] });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getByUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!validateIdParam(userId, res, 'User ID')) return;
    const membership = await organizationUserDAO.readByUserId(userId);
    return res.status(200).json({ status: true, data: membership ? [membership] : [] });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getByOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    if (!validateIdParam(organizationId, res, 'Organization ID')) return;
    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    if (!req.user.globalRoles.includes('SUPERADMIN')) {
      const membership = await organizationUserDAO.readByUserAndOrganization(
        req.user.id,
        organizationId,
      );
      if (membership?.role !== 'ADMIN') {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }
    }

    const memberships = await organizationUserDAO.readByOrganizationId(organizationId);
    return res.status(200).json({ status: true, data: memberships });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getStaffByOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    if (!validateIdParam(organizationId, res, 'Organization ID')) return;
    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    if (!req.user.globalRoles.includes('SUPERADMIN')) {
      const membership = await organizationUserDAO.readByUserAndOrganization(
        req.user.id,
        organizationId,
      );
      if (membership?.role !== 'ADMIN') {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }
    }

    const staff = await organizationUserDAO.readOrganizationStaff(organizationId);
    return res.status(200).json({ status: true, data: staff });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const organizationMembershipController = {
  getMine,
  getByUser,
  getByOrganization,
  getStaffByOrganization,
};
