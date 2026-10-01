import type { AuthUser, AuthUserResponse } from "./types/types";

/**
 * Μετατρέπει το response των backends σε κοινό frontend μοντέλο.
 * Το organization είναι singular: ADMIN και STAFF έχουν μία membership,
 * ενώ USER και SUPERADMIN δεν έχουν organization.
 */
export const normalizeAuthUser = (user: AuthUserResponse): AuthUser => ({
  id: user.id,
  username: user.username,
  name: user.name,
  email: user.email,
  globalRoles: user.globalRoles ?? [],
  organization: user.organization ?? null,
});
