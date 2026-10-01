import { Types } from 'mongoose';
import { OrganizationUserModel } from '../models/organizationUser.models';
import { OrganizationModel } from '../models/organization.models';
import type { OrganizationRole, UserView } from '../types/user.types';
import type { OrganizationView } from '../types/organization.types';

type PopulatedMembership = {
  _id: Types.ObjectId;
  userId: {
    _id: Types.ObjectId;
    username: string;
    name?: string;
    email?: string;
    globalRoles: UserView['globalRoles'];
    createdAt: Date;
    updatedAt: Date;
  };
  organizationId: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  };
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
};

export type SuperadminMembershipView = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
};

export type SuperadminMemberView = {
  membershipId: string;
  role: OrganizationRole;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  user: UserView;
  createdAt: Date;
  updatedAt: Date;
};

const mapUser = (user: PopulatedMembership['userId']): UserView => ({
  id: user._id.toString(),
  username: user.username,
  name: user.name,
  email: user.email,
  globalRoles: user.globalRoles,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const populateMemberships = async (filter: Record<string, unknown>) =>
  OrganizationUserModel.find(filter)
    .populate<{ userId: PopulatedMembership['userId'] }>(
      'userId',
      'username name email globalRoles createdAt updatedAt',
    )
    .populate<{ organizationId: PopulatedMembership['organizationId'] }>(
      'organizationId',
      'name slug',
    )
    .sort({ createdAt: -1 }) as unknown as Promise<PopulatedMembership[]>;

const readAdminMemberships = async (): Promise<SuperadminMemberView[]> => {
  const memberships = await populateMemberships({ role: 'ADMIN' });

  return memberships.map((membership) => ({
    membershipId: membership._id.toString(),
    role: membership.role,
    organizationId: membership.organizationId._id.toString(),
    organizationName: membership.organizationId.name,
    organizationSlug: membership.organizationId.slug,
    user: mapUser(membership.userId),
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  }));
};

const readMembershipByUserId = async (
  userId: string,
): Promise<SuperadminMembershipView | null> => {
  const membership = (await populateMemberships({ userId }))[0];
  if (!membership) return null;

  return {
    id: membership._id.toString(),
    organizationId: membership.organizationId._id.toString(),
    organizationName: membership.organizationId.name,
    organizationSlug: membership.organizationId.slug,
    role: membership.role,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
};

const readMembersByOrganizationId = async (
  organizationId: string,
): Promise<SuperadminMemberView[]> => {
  const memberships = await populateMemberships({ organizationId });

  return memberships.map((membership) => ({
    membershipId: membership._id.toString(),
    role: membership.role,
    organizationId: membership.organizationId._id.toString(),
    organizationName: membership.organizationId.name,
    organizationSlug: membership.organizationId.slug,
    user: mapUser(membership.userId),
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  }));
};

const readOrganizationCounts = async () => {
  const counts = await OrganizationUserModel.aggregate<{
    _id: Types.ObjectId;
    admins: number;
    staff: number;
  }>([
    {
      $group: {
        _id: '$organizationId',
        admins: { $sum: { $cond: [{ $eq: ['$role', 'ADMIN'] }, 1, 0] } },
        staff: { $sum: { $cond: [{ $eq: ['$role', 'STAFF'] }, 1, 0] } },
      },
    },
  ]);

  return new Map(
    counts.map((count) => [count._id.toString(), count]),
  );
};

const readOrganizationsWithCounts = async () => {
  const [organizations, counts] = await Promise.all([
    OrganizationModel.find().sort({ createdAt: -1 }),
    readOrganizationCounts(),
  ]);

  return organizations.map((organization): OrganizationView & {
    adminCount: number;
    staffCount: number;
    hasNoAdmin: boolean;
    hasMultipleAdmins: boolean;
  } => {
    const organizationView: OrganizationView = {
      id: organization._id.toString(),
      name: organization.name,
      slug: organization.slug,
      hasPaid: organization.hasPaid,
      adFreeUntil: organization.adFreeUntil ?? null,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
    const count = counts.get(organizationView.id);

    return {
      ...organizationView,
      adminCount: count?.admins ?? 0,
      staffCount: count?.staff ?? 0,
      hasNoAdmin: (count?.admins ?? 0) === 0,
      hasMultipleAdmins: (count?.admins ?? 0) > 1,
    };
  });
};

const readSummary = async () => {
  const organizations = await readOrganizationsWithCounts();
  const adminUsers = await OrganizationUserModel.distinct('userId', {
    role: 'ADMIN',
  });

  return {
    companies: organizations.length,
    adminUsers: adminUsers.length,
    companiesWithoutAdmin: organizations.filter((organization) => organization.hasNoAdmin).length,
    companiesWithMultipleAdmins: organizations.filter((organization) => organization.hasMultipleAdmins).length,
  };
};

export const superadminDAO = {
  readAdminMemberships,
  readMembershipByUserId,
  readMembersByOrganizationId,
  readOrganizationsWithCounts,
  readSummary,
};
