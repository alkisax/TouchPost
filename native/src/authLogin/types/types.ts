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
  id: string | number;
  username: string;
  name?: string;
  email?: string;
  globalRoles?: GlobalRole[];
  organization?: OrganizationContext | null;
}

export interface BackendLoginResponse {
  status: boolean;
  message?: string;
  data: {
    token: string;
    user?: AuthUserResponse;
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
