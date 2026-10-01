import type { OrganizationRole, UserView } from '../types/user.types';
import type { OrganizationView } from '../types/organization.types';
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
export declare const superadminDAO: {
    readAdminMemberships: () => Promise<SuperadminMemberView[]>;
    readMembershipByUserId: (userId: string) => Promise<SuperadminMembershipView | null>;
    readMembersByOrganizationId: (organizationId: string) => Promise<SuperadminMemberView[]>;
    readOrganizationsWithCounts: () => Promise<(OrganizationView & {
        adminCount: number;
        staffCount: number;
        hasNoAdmin: boolean;
        hasMultipleAdmins: boolean;
    })[]>;
    readSummary: () => Promise<{
        companies: number;
        adminUsers: number;
        companiesWithoutAdmin: number;
        companiesWithMultipleAdmins: number;
    }>;
};
