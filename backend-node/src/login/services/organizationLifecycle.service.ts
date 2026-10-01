import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { OrganizationModel } from '../models/organization.models';
import { OrganizationUserModel } from '../models/organizationUser.models';
import { UserModel } from '../models/users.models';
import { organizationDAO } from '../dao/organization.dao';
import { organizationUserDAO } from '../dao/organizationUser.dao';
import { userDAO } from '../dao/user.dao';
import { NotFoundError, ValidationError } from '../../utils/error/errors.types';

type UserInput = {
  username: string;
  name?: string;
  email?: string;
  password: string;
};

const createUserDocument = async (input: UserInput) =>
  new UserModel({
    username: input.username,
    name: input.name,
    email: input.email,
    hashedPassword: await bcrypt.hash(input.password, 10),
    globalRoles: [],
  });

export const createAdminWithOrganization = async (
  input: UserInput & { organizationName: string },
) => {
  const session = await mongoose.startSession();

  try {
    let userView;
    let organizationView;
    let membershipView;

    await session.withTransaction(async () => {
      const user = await createUserDocument(input);
      await user.save({ session });

      const organization = await organizationDAO.create(
        { name: input.organizationName },
        session,
      );

      const membership = new OrganizationUserModel({
        userId: user._id,
        organizationId: organization.id,
        role: 'ADMIN',
      });
      await membership.save({ session });

      userView = userDAO.toUserDAO(user);
      organizationView = organization;
      membershipView = organizationUserDAO.toOrganizationUserDAO(membership);
    });

    return { user: userView!, organization: organizationView!, membership: membershipView! };
  } finally {
    await session.endSession();
  }
};

export const createUser = async (input: UserInput) => {
  const user = await createUserDocument(input);
  const saved = await user.save();
  return userDAO.toUserDAO(saved);
};

export const createOrganizationForAdmin = async (
  adminUserId: string,
  name: string,
) => {
  const adminMembership = await OrganizationUserModel.findOne({
    userId: adminUserId,
    role: 'ADMIN',
  });
  if (adminMembership) {
    throw new ValidationError('ADMIN already belongs to an organization');
  }

  const session = await mongoose.startSession();
  try {
    let organizationView;
    let membershipView;

    await session.withTransaction(async () => {
      const organization = await organizationDAO.create({ name }, session);
      const membership = new OrganizationUserModel({
        userId: adminUserId,
        organizationId: organization.id,
        role: 'ADMIN',
      });
      const savedMembership = await membership.save({ session });
      organizationView = organization;
      membershipView = organizationUserDAO.toOrganizationUserDAO(savedMembership);
    });

    return { organization: organizationView!, membership: membershipView! };
  } finally {
    await session.endSession();
  }
};

export const createStaff = async (
  input: UserInput & { organizationId: string },
) => {
  const organization = await OrganizationModel.findById(input.organizationId);
  if (!organization) throw new NotFoundError('Organization not found');

  const session = await mongoose.startSession();
  try {
    let userView;
    let membershipView;

    await session.withTransaction(async () => {
      const user = await createUserDocument(input);
      await user.save({ session });

      const membership = new OrganizationUserModel({
        userId: user._id,
        organizationId: organization._id,
        role: 'STAFF',
      });
      await membership.save({ session });

      userView = userDAO.toUserDAO(user);
      membershipView = organizationUserDAO.toOrganizationUserDAO(membership);
    });

    return { user: userView!, membership: membershipView! };
  } finally {
    await session.endSession();
  }
};

export const deleteStaff = async (organizationId: string, userId: string) => {
  const membership = await OrganizationUserModel.findOne({
    organizationId,
    userId,
    role: 'STAFF',
  });
  if (!membership) throw new NotFoundError('STAFF membership not found');

  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.globalRoles.length > 0) {
    throw new ValidationError('A STAFF deletion cannot remove a global-role user');
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await OrganizationUserModel.deleteOne({ _id: membership._id }, { session });
      await UserModel.deleteOne({ _id: user._id }, { session });
    });
  } finally {
    await session.endSession();
  }
};

export const deleteAdminTenant = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.globalRoles.length > 0) {
    throw new ValidationError('Accounts with global roles cannot own an organization');
  }

  const memberships = await OrganizationUserModel.find({ userId });
  if (memberships.length !== 1 || memberships[0].role !== 'ADMIN') {
    throw new ValidationError('ADMIN must have exactly one organization membership');
  }

  const organizationId = memberships[0].organizationId;
  const organizationMemberships = await OrganizationUserModel.find({ organizationId });
  const adminCount = organizationMemberships.filter((item) => item.role === 'ADMIN').length;
  if (adminCount !== 1) {
    throw new ValidationError('Organization must have exactly one ADMIN');
  }

  const staffIds = organizationMemberships
    .filter((item) => item.role === 'STAFF')
    .map((item) => item.userId);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await OrganizationUserModel.deleteMany({ organizationId }, { session });
      if (staffIds.length > 0) {
        await UserModel.deleteMany(
          { _id: { $in: staffIds }, globalRoles: { $size: 0 } },
          { session },
        );
      }
      await OrganizationModel.deleteOne({ _id: organizationId }, { session });
      await UserModel.deleteOne({ _id: userId }, { session });
    });
  } finally {
    await session.endSession();
  }
};

export const deleteOrganizationPreservingAdmins = async (
  organizationId: string,
) => {
  const organization = await OrganizationModel.findById(organizationId);
  if (!organization) throw new NotFoundError('Organization not found');

  const memberships = await OrganizationUserModel.find({ organizationId });
  const staffIds = memberships
    .filter((membership) => membership.role === 'STAFF')
    .map((membership) => membership.userId);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await OrganizationUserModel.deleteMany({ organizationId }, { session });
      if (staffIds.length > 0) {
        await UserModel.deleteMany(
          { _id: { $in: staffIds }, globalRoles: { $size: 0 } },
          { session },
        );
      }
      await OrganizationModel.deleteOne({ _id: organizationId }, { session });
    });

    return organizationDAO.toOrganizationDAO(organization);
  } finally {
    await session.endSession();
  }
};

export const changeUserRole = async (
  userId: string,
  role: 'ADMIN' | 'STAFF' | 'USER',
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const membership = await OrganizationUserModel.findOne({ userId });
  if ((role === 'ADMIN' || role === 'STAFF') && !membership) {
    throw new ValidationError('The user must already belong to an organization');
  }

  if (role === 'ADMIN' && membership) {
    const anotherAdmin = await OrganizationUserModel.findOne({
      organizationId: membership.organizationId,
      role: 'ADMIN',
      userId: { $ne: userId },
    });
    if (anotherAdmin) throw new ValidationError('Organization already has an ADMIN');
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      if (role === 'USER') {
        await OrganizationUserModel.deleteOne({ userId }, { session });
      } else {
        await OrganizationUserModel.updateOne({ userId }, { role }, { session });
      }
      user.globalRoles = [];
      await user.save({ session });
      result = userDAO.toUserDAO(user);
    });
    return result!;
  } finally {
    await session.endSession();
  }
};

export const promoteToSuperAdmin = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      await OrganizationUserModel.deleteOne({ userId }, { session });
      user.globalRoles = ['SUPERADMIN'];
      await user.save({ session });
      result = userDAO.toUserDAO(user);
    });
    return result!;
  } finally {
    await session.endSession();
  }
};
