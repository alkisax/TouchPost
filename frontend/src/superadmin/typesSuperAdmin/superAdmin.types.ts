export type ManagedUserRole = "ADMIN" | "STAFF" | "USER";

export interface ManagedUser {
  user: {
    id: string;
    username: string;
    name?: string | null;
    email?: string | null;
    role: ManagedUserRole;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  membership: {
    id: string;
    role: "ADMIN" | "STAFF";
  } | null;
}

export interface ManagedOrganization {
  id: string;
  name: string;
  slug: string;
}

export interface UserAdStatus {
  hasPaid: boolean;
  adFreeUntil: string | null;
}

export type ManagedUserFilter = "ALL" | ManagedUserRole;

export interface ManagedUserFormValues {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationId: string;
}
