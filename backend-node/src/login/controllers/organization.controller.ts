// backend/src/login/controllers/organization.controller.ts

import type { Response } from "express";
import type { AuthRequest } from '../types/user.types';

import { organizationDAO } from "../dao/organization.dao";

import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validation/organization.schema";

import { handleControllerError } from "../../utils/error/errorHandler";
import { validateIdParam } from "../../utils/validation/validateObjectIdParam";
import { organizationUserDAO } from "../dao/organizationUser.dao";
import { createOrganizationForAdmin, deleteOrganizationPreservingAdmins } from '../services/organizationLifecycle.service';

// CREATE ORGANIZATION
const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.globalRoles.includes('SUPERADMIN')) {
      return res.status(403).json({ status: false, message: 'ADMIN access required' });
    }

    const membership = await organizationUserDAO.readByUserId(req.user.id);
    if (membership?.role !== 'ADMIN') {
      return res.status(403).json({ status: false, message: 'ADMIN access required' });
    }

    const parsed = createOrganizationSchema.parse(req.body);
    const result = await createOrganizationForAdmin(req.user.id, parsed.name);

    return res.status(201).json({
      status: true,
      data: result.organization,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// READ
const findAll = async (_req: AuthRequest, res: Response) => {
  try {
    const organizations = await organizationDAO.readAll();

    return res.status(200).json({
      status: true,
      data: organizations,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const findMine = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const membership = await organizationUserDAO.readByUserId(req.user.id);
    if (!membership || membership.role !== 'ADMIN') {
      return res.status(200).json({ status: true, data: [] });
    }

    const organization = await organizationDAO.readById(membership.organizationId);
    return res.status(200).json({ status: true, data: [organization] });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const findById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!validateIdParam(id, res, "Organization ID")) return;

    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });
    if (!req.user.globalRoles.includes('SUPERADMIN')) {
      const membership = await organizationUserDAO.readByUserAndOrganization(req.user.id, id);
      if (membership?.role !== 'ADMIN') {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }
    }

    const organization = await organizationDAO.readById(id);

    return res.status(200).json({
      status: true,
      data: organization,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// UPDATE
const updateById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!validateIdParam(id, res, "Organization ID")) return;

    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });
    if (!req.user.globalRoles.includes('SUPERADMIN')) {
      const membership = await organizationUserDAO.readByUserAndOrganization(req.user.id, id);
      if (membership?.role !== 'ADMIN') {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }
    }

    const parsed = updateOrganizationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const updated = await organizationDAO.update(id, parsed.data);

    return res.status(200).json({
      status: true,
      data: updated,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// DELETE
const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!validateIdParam(id, res, "Organization ID")) return;

    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });
    if (!req.user.globalRoles.includes('SUPERADMIN')) {
      const membership = await organizationUserDAO.readByUserAndOrganization(req.user.id, id);
      if (membership?.role !== 'ADMIN') {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }
    }

    const deleted = await deleteOrganizationPreservingAdmins(id);

    return res.status(200).json({
      status: true,
      message: `Organization ${deleted.name} deleted`,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const organizationController = {
  create,
  findAll,
  findMine,
  findById,
  updateById,
  remove,
};
