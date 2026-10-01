type UserInput = {
    username: string;
    name?: string;
    email?: string;
    password: string;
};
export declare const createAdminWithOrganization: (input: UserInput & {
    organizationName: string;
}) => Promise<{
    user: any;
    organization: any;
    membership: any;
}>;
export declare const createUser: (input: UserInput) => Promise<import("../types/user.types").UserView>;
export declare const createOrganizationForAdmin: (adminUserId: string, name: string) => Promise<{
    organization: any;
    membership: any;
}>;
export declare const createStaff: (input: UserInput & {
    organizationId: string;
}) => Promise<{
    user: any;
    membership: any;
}>;
export declare const deleteStaff: (organizationId: string, userId: string) => Promise<void>;
export declare const deleteAdminTenant: (userId: string) => Promise<void>;
export declare const deleteOrganizationPreservingAdmins: (organizationId: string) => Promise<import("../types/organization.types").OrganizationView>;
export declare const changeUserRole: (userId: string, role: "ADMIN" | "STAFF" | "USER") => Promise<any>;
export declare const promoteToSuperAdmin: (userId: string) => Promise<any>;
export {};
