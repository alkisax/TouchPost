import type { IOrganizationUser, OrganizationUserView, OrganizationUserDetailsView } from '../types/organizationUser.types';
export declare const organizationUserDAO: {
    toOrganizationUserDAO: (organizationUser: IOrganizationUser) => OrganizationUserView;
    readByOrganizationId: (organizationId: string) => Promise<OrganizationUserView[]>;
    readByUserId: (userId: string) => Promise<OrganizationUserView | null>;
    readByUserAndOrganization: (userId: string, organizationId: string) => Promise<OrganizationUserView | null>;
    readOrganizationUsers: (organizationId: string) => Promise<OrganizationUserDetailsView[]>;
    readOrganizationStaff: (organizationId: string) => Promise<OrganizationUserDetailsView[]>;
    readAdminOrganization: (userId: string) => Promise<OrganizationUserView | null>;
    deleteByUserId: (userId: string) => Promise<void>;
    deleteByOrganizationId: (organizationId: string) => Promise<void>;
};
