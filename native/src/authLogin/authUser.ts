import type { AuthUser, AuthUserResponse } from "./types/types";

/**
 * Τα δύο backends επιστρέφουν το ίδιο auth shape, αλλά τα ids μπορεί να είναι
 * αριθμοί ή strings. Το Native κρατά ένα σταθερό string id και singular context.
 */
export const normalizeAuthUser = (user: AuthUserResponse): AuthUser => ({
  id: String(user.id),
  username: user.username,
  name: user.name,
  email: user.email,
  globalRoles: user.globalRoles ?? [],
  organization: user.organization ?? null,
});
