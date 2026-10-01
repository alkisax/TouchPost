import type { ReactNode } from "react";

export type GlobalRole = "SUPERADMIN";
export type OrganizationRole = "ADMIN" | "STAFF";
export type EffectiveRole = GlobalRole | OrganizationRole | "USER";

export interface OrganizationContext {
  id: string;
  userId: string;
  organizationId: string;
  organizationName?: string;
  role: OrganizationRole;
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  globalRoles: GlobalRole[];
  organization: OrganizationContext | null;
}

export interface AuthUserResponse {
  id: string;
  username: string;
  name?: string;
  email?: string;
  globalRoles?: GlobalRole[];
  organization?: OrganizationContext | null;
}

export interface BackendLoginResponse {
  status: boolean;
  data: {
    token: string;
    user: AuthUserResponse;
  };
}

export interface UserAuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
}

export interface UserProviderProps {
  children: ReactNode;
}

// Προσωρινά types για το υπάρχον dashboard· δεν χρησιμοποιούνται από το
// authentication context και δεν περιγράφουν το νέο normalized auth user.
export type Roles = EffectiveRole | "MEMBER";
export interface IUser {
  id?: string;
  _id?: string;
  username: string;
  name?: string;
  email?: string;
  roles: Roles[];
  hasPassword?: boolean;
  provider?: "backend";
}

export interface BackendUserView {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: Roles;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Ο SUPERADMIN είναι global role. ADMIN και STAFF προκύπτουν από τη
 * μοναδική organization membership, ενώ ο USER δεν έχει membership.
 */
export const getEffectiveRole = (user: AuthUser): EffectiveRole => {
  if (user.globalRoles.includes("SUPERADMIN")) {
    return "SUPERADMIN";
  }

  return user.organization?.role ?? "USER";
};
