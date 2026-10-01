import type { IOrganization, OrganizationView, CreateOrganization, UpdateOrganization } from "../types/organization.types";
import type { ClientSession } from 'mongoose';
export declare const organizationDAO: {
    toOrganizationDAO: (organization: IOrganization) => OrganizationView;
    create: (organizationData: CreateOrganization, session?: ClientSession) => Promise<OrganizationView>;
    readAll: () => Promise<OrganizationView[]>;
    readById: (organizationId: string) => Promise<OrganizationView>;
    readBySlug: (slug: string) => Promise<OrganizationView | null>;
    update: (organizationId: string, organizationData: UpdateOrganization) => Promise<OrganizationView>;
    deleteById: (organizationId: string) => Promise<OrganizationView>;
};
