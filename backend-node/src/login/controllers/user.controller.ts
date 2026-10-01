// backend/src/login/controllers/user.controller.ts

import bcrypt from "bcrypt";
import type { Request, Response } from "express";

import type {
  AuthRequest,
  UpdateUser,
} from "../types/user.types";

import { userDAO } from "../dao/user.dao";
import { organizationUserDAO } from "../dao/organizationUser.dao";
import {
  createStaff as createStaffLifecycle,
  deleteStaff,
  changeUserRole,
  promoteToSuperAdmin,
} from '../services/organizationLifecycle.service';
import { deleteAdminTenant } from '../services/organizationLifecycle.service';
import { deleteSelfAdminService } from '../services/deleteSelfAdmin.service';

import { handleControllerError } from "../../utils/error/errorHandler";

import {
  createUserSchema,
  deleteSelfAdminSchema,
  updateRoleSchema,
  updateUserSchema,
} from "../validation/user.schema";

import { validateIdParam } from "../../utils/validation/validateObjectIdParam";

// CREATE USER
const create = async (req: Request, res: Response) => {
  try {
    const parsed = createUserSchema.parse(req.body);

    const existing = await userDAO.readByUsername(parsed.username);

    if (existing) {
      return res.status(409).json({
        status: false,
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const newUser = await userDAO.create({
      username: parsed.username,
      name: parsed.name,
      email: parsed.email,
      globalRoles: parsed.globalRoles,
      hashedPassword,
    });

    return res.status(201).json({
      status: true,
      data: newUser,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// CREATE STAFF
const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const adminMembership = await organizationUserDAO.readAdminOrganization(
      requester.id,
    );

    if (!adminMembership) {
      return res.status(403).json({
        status: false,
        message: "Admin access required",
      });
    }

    const parsed = createUserSchema.parse(req.body);

    const existing = await userDAO.readByUsername(parsed.username);

    if (existing) {
      return res.status(409).json({
        status: false,
        message: "Username already taken",
      });
    }

    const result = await createStaffLifecycle({
      username: parsed.username,
      name: parsed.name,
      email: parsed.email,
      organizationId: adminMembership.organizationId,
      password: parsed.password,
    });

    return res.status(201).json({
      status: true,
      data: {
        user: {
          id: result.user.id,
          username: result.user.username,
          name: result.user.name,
          email: result.user.email,
          role: 'STAFF',
        },
        membership: {
          id: result.membership.id,
          organizationId: result.membership.organizationId,
          role: result.membership.role,
        },
      },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// READ
const findAll = async (_req: Request, res: Response) => {
  try {
    const users = await userDAO.readAll();

    return res.status(200).json({
      status: true,
      data: users,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const findById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req as AuthRequest;

    if (!validateIdParam(id, res, "User ID")) return;

    if (!requester.user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const isSuperAdmin = requester.user.globalRoles.includes('SUPERADMIN');
    const isSelf = requester.user.id === id;
    let canManageStaff = false;

    const adminMembership = await organizationUserDAO.readAdminOrganization(
      requester.user.id,
    );
    if (adminMembership) {
      const targetMembership =
        await organizationUserDAO.readByUserAndOrganization(
          id,
          adminMembership.organizationId,
        );
      canManageStaff = targetMembership?.role === 'STAFF';
    }

    if (!isSuperAdmin && !isSelf && !canManageStaff) {
      return res.status(403).json({ status: false, message: 'Forbidden' });
    }

    const user = await userDAO.readById(id);

    return res.status(200).json({
      status: true,
      data: user,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// SEE COMPANY USERS
const seeCompanyUsers = async (req: AuthRequest, res: Response) => {
  try {
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const adminMembership = await organizationUserDAO.readAdminOrganization(
      requester.id,
    );

    if (!adminMembership) {
      return res.status(403).json({
        status: false,
        message: "Admin access required",
      });
    }

    const users = await organizationUserDAO.readOrganizationUsers(
      adminMembership.organizationId,
    );

    return res.status(200).json({
      status: true,
      data: users,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// SEE COMPANY STAFF
const seeCompanyStaff = async (req: AuthRequest, res: Response) => {
  try {
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const adminMembership = await organizationUserDAO.readAdminOrganization(
      requester.id,
    );

    if (!adminMembership) {
      return res.status(403).json({
        status: false,
        message: "Admin access required",
      });
    }

    const staff = await organizationUserDAO.readOrganizationStaff(
      adminMembership.organizationId,
    );

    return res.status(200).json({
      status: true,
      data: staff.map((member) => ({
        id: member.user.id,
        username: member.user.username,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        createdAt: member.user.createdAt,
        updatedAt: member.user.updatedAt,
      })),
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// UPDATE USER
const updateById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (!validateIdParam(id, res, "User ID")) return;

    const isSuperAdmin = requester.globalRoles.includes("SUPERADMIN");

    const isSelf = requester.id === id;

    // Ελέγχουμε αν ο requester είναι ADMIN και αν ο target user
    // είναι STAFF του ίδιου organization.
    let canManageStaff = false;

    const adminMembership = await organizationUserDAO.readAdminOrganization(
      requester.id,
    );

    if (adminMembership) {
      const targetMembership =
        await organizationUserDAO.readByUserAndOrganization(
          id,
          adminMembership.organizationId,
        );

      canManageStaff = targetMembership?.role === "STAFF";
    }

    if (!isSuperAdmin && !isSelf && !canManageStaff) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const data: UpdateUser = {
      ...parsed.data,
    };

    // Μόνο ο SUPERADMIN μπορεί να αλλάξει global roles.
    if (!isSuperAdmin) {
      delete data.globalRoles;
    }

    if (data.password) {
      data.hashedPassword = await bcrypt.hash(data.password, 10);

      delete data.password;
    }

    if (isSuperAdmin && data.globalRoles?.includes('SUPERADMIN')) {
      await organizationUserDAO.deleteByUserId(id);
    }

    const updated = await userDAO.update(id, data);

    return res.status(200).json({
      status: true,
      data: updated,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const removeStaffByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });

    const adminMembership = await organizationUserDAO.readAdminOrganization(req.user.id);
    const staffId = String(req.params.staffId);
    const targetMembership = await organizationUserDAO.readByUserAndOrganization(
      staffId,
      adminMembership?.organizationId ?? '',
    );

    if (!adminMembership || targetMembership?.role !== 'STAFF') {
      return res.status(403).json({ status: false, message: 'Forbidden' });
    }

    await deleteStaff(adminMembership.organizationId, staffId);
    return res.status(200).json({
      status: true,
      message: `User ${staffId} deleted`,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!validateIdParam(id, res, 'User ID')) return;

    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues,
      });
    }

    const updated = await changeUserRole(id, parsed.data.role);
    return res.status(200).json({ status: true, data: updated });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const makeSuperAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!validateIdParam(id, res, 'User ID')) return;

    const updated = await promoteToSuperAdmin(id);
    return res.status(200).json({ status: true, data: updated });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// DELETE USER
const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (!validateIdParam(id, res, "User ID")) return;

    const isSuperAdmin = requester.globalRoles.includes("SUPERADMIN");

    const isSelf = requester.id === id;

    let canManageStaff = false;

    // Ο ADMIN μπορεί να διαγράψει μόνο STAFF
    // που ανήκει στο δικό του organization.
    const adminMembership = await organizationUserDAO.readAdminOrganization(
      requester.id,
    );

    if (adminMembership) {
      const targetMembership =
        await organizationUserDAO.readByUserAndOrganization(
          id,
          adminMembership.organizationId,
        );

      if (targetMembership?.role === "STAFF") {
        canManageStaff = true;
      }
    }

    if (!isSuperAdmin && !isSelf && !canManageStaff) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    // Αν ο ADMIN διαγράφει δικό του STAFF,
    // διαγράφουμε πρώτα τη σχέση με το organization.
    const targetUser = await userDAO.readById(id);
    const targetMembership = await organizationUserDAO.readByUserId(id);

    if (targetUser.globalRoles.length > 0) {
      return res.status(403).json({
        status: false,
        message: 'Global-role users cannot be deleted through this flow',
      });
    }

    if (targetMembership?.role === 'ADMIN') {
      if (isSuperAdmin) {
        await deleteAdminTenant(id);
      } else if (isSelf) {
        const parsed = deleteSelfAdminSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({
            status: false,
            details: parsed.error.issues.map((issue) => issue.message),
          });
        }

        await deleteSelfAdminService.deleteAdminAccountCascade(
          id,
          parsed.data.password,
        );
      } else {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }
    } else if (targetMembership?.role === 'STAFF' && canManageStaff && adminMembership) {
      await deleteStaff(adminMembership.organizationId, id);
    } else {
      if (!isSuperAdmin && !isSelf) {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }

      await userDAO.deleteById(id);
    }

    return res.status(200).json({
      status: true,
      message: `User ${id} deleted`,
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const userController = {
  create,
  createStaff,
  removeStaffByAdmin,
  findAll,
  findById,
  seeCompanyUsers,
  seeCompanyStaff,
  updateById,
  updateRole,
  makeSuperAdmin,
  remove,
};
