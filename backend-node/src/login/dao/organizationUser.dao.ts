import type {
  IOrganizationUser,
  OrganizationUserView,
  PopulatedOrganizationUser,
  OrganizationUserDetailsView,
} from '../types/organizationUser.types';
import { OrganizationUserModel } from '../models/organizationUser.models';

const toOrganizationUserDAO = (
  organizationUser: IOrganizationUser,
): OrganizationUserView => ({
  id: organizationUser._id.toString(),
  userId: organizationUser.userId.toString(),
  organizationId: organizationUser.organizationId.toString(),
  role: organizationUser.role,
  createdAt: organizationUser.createdAt,
  updatedAt: organizationUser.updatedAt,
});

const toOrganizationUserDetailsDAO = (
  organizationUser: PopulatedOrganizationUser,
): OrganizationUserDetailsView => ({
  id: organizationUser._id.toString(),
  user: {
    id: organizationUser.userId._id.toString(),
    username: organizationUser.userId.username,
    name: organizationUser.userId.name,
    email: organizationUser.userId.email,
    createdAt: organizationUser.userId.createdAt,
    updatedAt: organizationUser.userId.updatedAt,
  },
  organizationId: organizationUser.organizationId.toString(),
  role: organizationUser.role,
  createdAt: organizationUser.createdAt,
  updatedAt: organizationUser.updatedAt,
});

const readByOrganizationId = async (
  organizationId: string,
): Promise<OrganizationUserView[]> => {
  const organizationUsers = await OrganizationUserModel.find({
    organizationId,
  }).sort({ createdAt: -1 });

  return organizationUsers.map(toOrganizationUserDAO);
};

const readByUserId = async (
  userId: string,
): Promise<OrganizationUserView | null> => {
  const organizationUser = await OrganizationUserModel.findOne({ userId });

  return organizationUser ? toOrganizationUserDAO(organizationUser) : null;
};

const readByUserAndOrganization = async (
  userId: string,
  organizationId: string,
): Promise<OrganizationUserView | null> => {
  const organizationUser = await OrganizationUserModel.findOne({
    userId,
    organizationId,
  });

  return organizationUser ? toOrganizationUserDAO(organizationUser) : null;
};

const readOrganizationUsers = async (
  organizationId: string,
): Promise<OrganizationUserDetailsView[]> => {
  const organizationUsers = await OrganizationUserModel.find({
    organizationId,
  })
    .populate<{ userId: PopulatedOrganizationUser['userId'] }>(
      'userId',
      'username name email createdAt updatedAt',
    )
    .sort({ createdAt: -1 });

  return organizationUsers.map(toOrganizationUserDetailsDAO);
};

const readOrganizationStaff = async (
  organizationId: string,
): Promise<OrganizationUserDetailsView[]> => {
  const organizationStaff = await OrganizationUserModel.find({
    organizationId,
    role: 'STAFF',
  })
    .populate<{ userId: PopulatedOrganizationUser['userId'] }>(
      'userId',
      'username name email createdAt updatedAt',
    )
    .sort({ createdAt: -1 });

  return organizationStaff.map(toOrganizationUserDetailsDAO);
};

const readAdminOrganization = async (
  userId: string,
): Promise<OrganizationUserView | null> => {
  const organizationUser = await OrganizationUserModel.findOne({
    userId,
    role: 'ADMIN',
  });

  return organizationUser ? toOrganizationUserDAO(organizationUser) : null;
};

const deleteByUserId = async (userId: string): Promise<void> => {
  await OrganizationUserModel.deleteMany({ userId });
};

const deleteByOrganizationId = async (
  organizationId: string,
): Promise<void> => {
  await OrganizationUserModel.deleteMany({ organizationId });
};

export const organizationUserDAO = {
  toOrganizationUserDAO,
  readByOrganizationId,
  readByUserId,
  readByUserAndOrganization,
  readOrganizationUsers,
  readOrganizationStaff,
  readAdminOrganization,
  deleteByUserId,
  deleteByOrganizationId,
};
