import type { Response } from 'express';
import bcrypt from 'bcrypt';
import type { AuthRequest, UpdateUserProfile } from '../types/user.types';
import { userDAO } from '../dao/user.dao';
import { organizationDAO } from '../dao/organization.dao';
import { organizationUserDAO } from '../dao/organizationUser.dao';
import { OrganizationModel } from '../models/organization.models';
import { handleControllerError } from '../../utils/error/errorHandler';
import { validateIdParam } from '../../utils/validation/validateObjectIdParam';
import { NotFoundError, ValidationError } from '../../utils/error/errors.types';
import {
  superadminDAO,
} from './superadmin.dao';
import {
  createAdminSchema,
  createStaffSchema,
  updateAdminSchema,
  updateStaffSchema,
  updateUserAdStatusSchema,
} from './superadmin.schema';
import {
  createAdminWithOrganization,
  createStaff as createStaffLifecycle,
  createUser as createUserLifecycle,
  deleteAdminTenant,
  deleteStaff,
} from '../services/organizationLifecycle.service';
import { UserModel } from '../models/users.models';
import { OrganizationUserModel } from '../models/organizationUser.models';

const managedUser = async (userId: string) => {
  const user = await UserModel.findById(userId).lean();
  if (!user || user.globalRoles.includes('SUPERADMIN')) {
    return null;
  }

  const membership = await OrganizationUserModel.findOne({ userId }).lean();
  let organization = null;
  if (membership) {
    const found = await OrganizationModel.findById(
      membership.organizationId,
    ).lean();

    if (!found) {
      return null;
    }

    organization = {
      id: found._id.toString(),
      name: found.name,
      slug: found.slug,
    };
  }

  const role = membership?.role ?? 'USER';
  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      name: user.name ?? null,
      email: user.email ?? null,
      role,
    },
    organization,
    membership: membership
      ? { id: membership._id.toString(), role: membership.role }
      : null,
  };
};

const listUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await UserModel.find({ globalRoles: { $size: 0 } })
      .sort({ createdAt: -1 })
      .lean();
    const data = (
      await Promise.all(
        users.map((user) => managedUser(user._id.toString())),
      )
    ).filter(Boolean);

    return res.status(200).json({ status: true, data });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const data = await managedUser(String(req.params.userId));
    if (!data) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    return res.status(200).json({ status: true, data });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const createPlainUser = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues,
      });
    }

    const existing = await userDAO.readByUsername(parsed.data.username);
    if (existing) {
      return res.status(409).json({
        status: false,
        message: 'Username already taken',
      });
    }

    const created = await createUserLifecycle(parsed.data);
    const data = await managedUser(created.id);
    return res.status(201).json({ status: true, data });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateManagedUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.userId);
    const current = await managedUser(id);
    if (!current) return res.status(404).json({ status: false, message: 'User not found' });
    const parsed = updateAdminSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ status: false, details: parsed.error.issues });
    const updated = await userDAO.updateProfile(id, await parseProfileUpdate(parsed.data));
    const data = await managedUser(updated.id);
    return res.status(200).json({ status: true, data });
  } catch (error) { return handleControllerError(res, error); }
};

const deletePlainUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.userId);
    const current = await managedUser(id);
    if (!current || current.membership) return res.status(400).json({ status: false, message: 'Only plain USER accounts can be deleted' });
    await userDAO.deleteById(id);
    return res.status(200).json({ status: true, message: 'User deleted successfully' });
  } catch (error) { return handleControllerError(res, error); }
};

const listAdmins = async (_req: AuthRequest, res: Response) => {
  try {
    const memberships = await superadminDAO.readAdminMemberships();

    return res.status(200).json({
      status: true,
      data: memberships,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!validateIdParam(userId, res, 'User ID')) return;

    const user = await userDAO.readById(userId);
    const membership = await superadminDAO.readMembershipByUserId(userId);

    if (!membership || membership.role !== 'ADMIN') {
      throw new NotFoundError('ADMIN membership not found');
    }

    return res.status(200).json({
      status: true,
      data: { user, membership },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const listOrganizations = async (_req: AuthRequest, res: Response) => {
  try {
    const organizations = await superadminDAO.readOrganizationsWithCounts();
    return res.status(200).json({ status: true, data: organizations });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    if (!validateIdParam(organizationId, res, 'Organization ID')) return;

    const organization = await organizationDAO.readById(organizationId);
    const members = await superadminDAO.readMembersByOrganizationId(
      organizationId,
    );

    return res.status(200).json({
      status: true,
      data: {
        organization,
        admins: members.filter((member) => member.role === 'ADMIN'),
        staff: members.filter((member) => member.role === 'STAFF'),
        memberCount: members.length,
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getSummary = async (_req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({
      status: true,
      data: await superadminDAO.readSummary(),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const parseProfileUpdate = async (
  input: {
    username?: string;
    name?: string;
    email?: string;
    password?: string;
  },
): Promise<UpdateUserProfile> => {
  const data: UpdateUserProfile = {
    username: input.username,
    name: input.name,
    email: input.email,
  };

  if (input.password) {
    data.hashedPassword = await bcrypt.hash(input.password, 10);
  }

  return data;
};

const createAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const existing = await userDAO.readByUsername(parsed.data.username);
    if (existing) {
      return res.status(409).json({ status: false, message: 'Username already taken' });
    }

    const result = await createAdminWithOrganization({
      username: parsed.data.username,
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      organizationName: parsed.data.organizationName,
    });

    return res.status(201).json({ status: true, data: await managedUser(result.user.id) });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateUserAdStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!validateIdParam(userId, res, 'User ID')) return;

    const parsed = updateUserAdStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const membership = await organizationUserDAO.readByUserId(userId);
    if (!membership || !['ADMIN', 'STAFF'].includes(membership.role)) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const organization = await OrganizationModel.findByIdAndUpdate(
      membership.organizationId,
      {
        hasPaid: parsed.data.hasPaid,
        adFreeUntil: parsed.data.adFreeUntil ?? null,
      },
      { returnDocument: 'after' },
    );

    if (!organization) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    return res.status(200).json({
      status: true,
      data: {
        hasPaid: organization.hasPaid,
        adFreeUntil: organization.adFreeUntil ?? null,
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getUserAdStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!validateIdParam(userId, res, 'User ID')) return;

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const membership = await organizationUserDAO.readByUserId(userId);
    if (!membership || !['ADMIN', 'STAFF'].includes(membership.role)) {
      return res.status(404).json({
        status: false,
        message: 'User organization monetization status not found',
      });
    }

    const organization = await OrganizationModel.findById(
      membership.organizationId,
    ).lean();

    if (!organization) {
      return res.status(404).json({
        status: false,
        message: 'User organization monetization status not found',
      });
    }

    const effectiveAdFreeUntil =
      organization.adFreeUntil && organization.adFreeUntil > new Date()
        ? organization.adFreeUntil
        : null;

    return res.status(200).json({
      status: true,
      data: {
        hasPaid: organization.hasPaid,
        adFreeUntil: effectiveAdFreeUntil,
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!validateIdParam(userId, res, 'User ID')) return;

    const membership = await organizationUserDAO.readByUserId(userId);
    if (!membership || membership.role !== 'ADMIN') {
      throw new NotFoundError('ADMIN membership not found');
    }

    const parsed = updateAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const data = await parseProfileUpdate(parsed.data);
    const updated = await userDAO.updateProfile(userId, data);
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const deleteAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!validateIdParam(userId, res, 'User ID')) return;

    if (req.user?.id === userId) {
      throw new ValidationError('SUPERADMIN cannot delete its own account here');
    }

    const membership = await organizationUserDAO.readByUserId(userId);
    if (!membership || membership.role !== 'ADMIN') {
      throw new NotFoundError('ADMIN membership not found');
    }

    await deleteAdminTenant(userId);

    return res.status(200).json({
      status: true,
      message: 'ADMIN and organization data deleted successfully',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    if (!validateIdParam(organizationId, res, 'Organization ID')) return;
    await organizationDAO.readById(organizationId);

    const parsed = createStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const existing = await userDAO.readByUsername(parsed.data.username);
    if (existing) {
      return res.status(409).json({ status: false, message: 'Username already taken' });
    }

    const result = await createStaffLifecycle({
      username: parsed.data.username,
      name: parsed.data.name,
      email: parsed.data.email,
      organizationId,
      password: parsed.data.password,
    });

    return res.status(201).json({ status: true, data: await managedUser(result.user.id) });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId, userId } = req.params;
    if (!validateIdParam(organizationId, res, 'Organization ID')) return;
    if (!validateIdParam(userId, res, 'User ID')) return;

    await organizationDAO.readById(organizationId);
    const membership = await organizationUserDAO.readByUserAndOrganization(
      userId,
      organizationId,
    );
    if (!membership || membership.role !== 'STAFF') {
      throw new NotFoundError('STAFF membership not found');
    }

    const parsed = updateStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: false,
        details: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const data = await parseProfileUpdate(parsed.data);
    const updated = await userDAO.updateProfile(userId, data);
    return res.status(200).json({ status: true, data: updated });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const removeStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId, userId } = req.params;
    if (!validateIdParam(organizationId, res, 'Organization ID')) return;
    if (!validateIdParam(userId, res, 'User ID')) return;

    const membership = await organizationUserDAO.readByUserAndOrganization(
      userId,
      organizationId,
    );
    if (!membership || membership.role !== 'STAFF') {
      throw new NotFoundError('STAFF membership not found');
    }

    await deleteStaff(organizationId, userId);

    return res.status(200).json({
      status: true,
      message: 'STAFF membership removed',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const deleteStaffByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!validateIdParam(userId, res, 'User ID')) return;

    const user = await UserModel.findById(userId).lean();
    const membership = await organizationUserDAO.readByUserId(userId);

    if (
      !user ||
      user.globalRoles.length > 0 ||
      !membership ||
      membership.role !== 'STAFF'
    ) {
      return res.status(404).json({
        status: false,
        message: 'Staff user not found',
      });
    }

    await deleteStaff(membership.organizationId, userId);

    return res.status(200).json({
      status: true,
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const superadminController = {
  listUsers,
  getUser,
  createPlainUser,
  updateManagedUser,
  deletePlainUser,
  listAdmins,
  getAdmin,
  listOrganizations,
  getOrganization,
  getSummary,
  updateUserAdStatus,
  getUserAdStatus,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  createStaff,
  updateStaff,
  removeStaff,
  deleteStaffByUserId,
};
