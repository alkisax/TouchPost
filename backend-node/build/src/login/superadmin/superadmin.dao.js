"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superadminDAO = void 0;
const organizationUser_models_1 = require("../models/organizationUser.models");
const organization_models_1 = require("../models/organization.models");
const mapUser = (user) => ({
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    globalRoles: user.globalRoles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const populateMemberships = async (filter) => organizationUser_models_1.OrganizationUserModel.find(filter)
    .populate('userId', 'username name email globalRoles createdAt updatedAt')
    .populate('organizationId', 'name slug')
    .sort({ createdAt: -1 });
const readAdminMemberships = async () => {
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
const readMembershipByUserId = async (userId) => {
    const membership = (await populateMemberships({ userId }))[0];
    if (!membership)
        return null;
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
const readMembersByOrganizationId = async (organizationId) => {
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
    const counts = await organizationUser_models_1.OrganizationUserModel.aggregate([
        {
            $group: {
                _id: '$organizationId',
                admins: { $sum: { $cond: [{ $eq: ['$role', 'ADMIN'] }, 1, 0] } },
                staff: { $sum: { $cond: [{ $eq: ['$role', 'STAFF'] }, 1, 0] } },
            },
        },
    ]);
    return new Map(counts.map((count) => [count._id.toString(), count]));
};
const readOrganizationsWithCounts = async () => {
    const [organizations, counts] = await Promise.all([
        organization_models_1.OrganizationModel.find().sort({ createdAt: -1 }),
        readOrganizationCounts(),
    ]);
    return organizations.map((organization) => {
        const organizationView = {
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
    const adminUsers = await organizationUser_models_1.OrganizationUserModel.distinct('userId', {
        role: 'ADMIN',
    });
    return {
        companies: organizations.length,
        adminUsers: adminUsers.length,
        companiesWithoutAdmin: organizations.filter((organization) => organization.hasNoAdmin).length,
        companiesWithMultipleAdmins: organizations.filter((organization) => organization.hasMultipleAdmins).length,
    };
};
exports.superadminDAO = {
    readAdminMemberships,
    readMembershipByUserId,
    readMembersByOrganizationId,
    readOrganizationsWithCounts,
    readSummary,
};
//# sourceMappingURL=superadmin.dao.js.map