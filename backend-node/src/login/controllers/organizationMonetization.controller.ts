import type { Response } from 'express';

import { handleControllerError } from '../../utils/error/errorHandler';
import { organizationUserDAO } from '../dao/organizationUser.dao';
import { OrganizationModel } from '../models/organization.models';
import type { AuthRequest } from '../types/user.types';
import { validateIdParam } from '../../utils/validation/validateObjectIdParam';

// Η περίοδος χωρίς διαφημίσεις μετά από ad watch είναι 23 ώρες.
const AD_FREE_DURATION_HOURS = 10;

const getEffectiveAdFreeUntil = (adFreeUntil?: Date | null) => {
  if (!adFreeUntil || adFreeUntil <= new Date()) {
    return null;
  }

  return adFreeUntil;
};

const recordAdWatched = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;

    if (!validateIdParam(organizationId, res, 'Organization ID')) return;

    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    const callerMembership =
      await organizationUserDAO.readByUserAndOrganization(
        req.user.id,
        organizationId,
      );

    if (
      !callerMembership ||
      !['ADMIN', 'STAFF'].includes(callerMembership.role)
    ) {
      return res.status(403).json({
        status: false,
        message: 'Forbidden',
      });
    }

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ status: false, message: 'Organization not found' });
    }

    if (organization.hasPaid) {
      return res.status(200).json({
        status: true,
        data: {
          organizationId,
          hasPaid: organization.hasPaid,
          adFreeUntil: getEffectiveAdFreeUntil(organization.adFreeUntil),
        },
      });
    }

    const adFreeUntil = new Date(
      Date.now() + AD_FREE_DURATION_HOURS * 60 * 60 * 1000,
    );
    organization.hasPaid = false;
    organization.adFreeUntil = adFreeUntil;
    await organization.save();

    return res.status(200).json({
      status: true,
      data: {
        organizationId,
        hasPaid: organization.hasPaid,
        adFreeUntil: getEffectiveAdFreeUntil(organization.adFreeUntil),
      },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const readOrganizationMonetization = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { organizationId } = req.params;

    if (!validateIdParam(organizationId, res, 'Organization ID')) return;

    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    const callerMembership =
      await organizationUserDAO.readByUserAndOrganization(
        req.user.id,
        organizationId,
      );

    if (
      !callerMembership ||
      !['ADMIN', 'STAFF'].includes(callerMembership.role)
    ) {
      return res.status(403).json({
        status: false,
        message: 'Forbidden',
      });
    }

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ status: false, message: 'Organization not found' });
    }

    return res.status(200).json({
      status: true,
      data: {
        organizationId,
        hasPaid: organization.hasPaid,
        adFreeUntil: getEffectiveAdFreeUntil(organization.adFreeUntil),
      },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const organizationMonetizationController = {
  recordAdWatched,
  readOrganizationMonetization,
};
