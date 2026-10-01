# Frontend Axios Calls

<!-- Regenerated from the current active Vite Axios call sites. -->

## Conventions

- Backend base URL: `VITE_BACKEND_URL`, fallback `http://localhost:3020`.
- Calls use direct Axios; no shared configured Axios instance or interceptor is used.
- Protected calls read `localStorage.token` and send `Authorization: Bearer <token>`.
- Login stores the token and normalized `authUser` through `UserAuthContext`.
- `Backends` identifies whether the exact call exists in current Node and .NET references.

## Auth

### POST /auth/login

- Used by: `src/authLogin/loginBackend/LoginBackend.tsx`
- Sends: `{ username, password }`
- Expects: `{ status: true, data: { token, user } }`
- Backends: Node + .NET
- Purpose: Συνδέει τον χρήστη, αποθηκεύει το token και οδηγεί στον ρόλο του.

### POST /auth/register-user

- Used by: `src/authLogin/loginBackend/RegisterPageBackend.tsx`
- Sends: `{ username, name, email, password }`
- Expects: successful `status === true`, then navigates to `/login`
- Backends: Node + .NET
- Purpose: Δημιουργεί δημόσιο USER χωρίς tenant membership.

### POST /auth/register-admin

- Used by: `src/authLogin/loginBackend/RegisterAdminPageBackend.tsx`
- Sends: `{ username, name, email, password, organizationName }`
- Expects: successful `status === true`, then navigates to `/login`
- Backends: Node + .NET
- Purpose: Δημιουργεί ADMIN μαζί με το organization του.

### POST /auth/refresh

- Used by: `src/authLogin/context/UserAuthContext.tsx`
- Sends: `{}` and `Authorization: Bearer <stored token>`
- Expects: `{ status: true, data: { token, user? } }`; Node may return `user`, .NET returns only `token`
- Backends: Node + .NET (contract difference handled by retaining persisted `authUser` when `user` is absent)
- Purpose: Ανανεώνει το session token κατά την αρχική αποκατάσταση authentication.

## Account

### DELETE /users/self

- Used by: `src/components/DeleteAccountButton.tsx`
- Sends: `{ password: currentPassword }` with Bearer token
- Expects: success followed by local logout
- Backends: Node + .NET
- Purpose: Διαγράφει τον authenticated ADMIN ή USER λογαριασμό μετά από επιβεβαίωση password.

## Admin / STAFF

### GET /users/organization/staff

- Used by: `src/admin/hooksAdmin/useAdminStaff.ts`
- Sends: none; Bearer token
- Expects: `{ status: true, data: staff[] }`
- Backends: Node + .NET
- Purpose: Φορτώνει τους STAFF του organization του ADMIN.

### POST /users/staff

- Used by: `src/admin/hooksAdmin/useAdminStaff.ts`
- Sends: `{ username, name, email, password }`
- Expects: successful creation, then refreshes the list
- Backends: Node + .NET
- Purpose: Δημιουργεί STAFF στο tenant του ADMIN.

### PUT /users/{staffId}

- Used by: `src/admin/hooksAdmin/useAdminStaff.ts`
- Sends: `{ username, name, email, password? }`
- Expects: successful update, then refreshes the list
- Backends: Node + .NET
- Purpose: Ενημερώνει identity fields STAFF χωρίς αλλαγή ρόλου ή tenant.

### DELETE /users/{staffId}

- Used by: `src/admin/hooksAdmin/useAdminStaff.ts`
- Sends: none; Bearer token
- Expects: successful deletion, then refreshes the list
- Backends: Node + .NET
- Purpose: Διαγράφει STAFF του ίδιου organization από το ADMIN panel.

## SuperAdmin

All calls below are made by `src/superadmin/hooksSuperAdmin/useSuperAdminUsers.ts` through
the canonical `${backendUrl}/superadmin` helper. The helper validates the `{ status, data }`
response envelope before returning it.

### GET /superadmin/users

- Used by: `useSuperAdminUsers.loadUsers`
- Sends: none; Bearer token
- Expects: `{ status: true, data: managedUser[] }`
- Backends: Node + .NET
- Purpose: Φορτώνει global τη λίστα ADMIN, STAFF και USER.

### GET /superadmin/organizations

- Used by: `useSuperAdminUsers.loadOrganizations`
- Sends: none; Bearer token
- Expects: `{ status: true, data: organization[] }`
- Backends: Node + .NET
- Purpose: Φορτώνει organizations για το Create Staff selector.

### POST /superadmin/users

- Used by: `useSuperAdminUsers.save`
- Sends: `{ username, name, email, password }`
- Expects: `201`, `{ status: true, data: managedUser }`
- Backends: Node + .NET
- Purpose: Δημιουργεί plain USER από το SUPERADMIN panel.

### POST /superadmin/admins

- Used by: `useSuperAdminUsers.save`
- Sends: `{ username, name, email, password, organizationName }`
- Expects: `201`, `{ status: true, data: managedUser }`
- Backends: Node + .NET
- Purpose: Δημιουργεί ADMIN και νέο tenant.

### POST /superadmin/organizations/{organizationId}/staff

- Used by: `useSuperAdminUsers.save`
- Sends: `{ username, name, email, password }`; organization ID is a path parameter from the selector
- Expects: `201`, `{ status: true, data: managedUser }`
- Backends: Node + .NET
- Purpose: Δημιουργεί STAFF στο επιλεγμένο organization.

### PUT /superadmin/users/{userId}

- Used by: `useSuperAdminUsers.save`
- Sends: `{ username, name, email, password? }`
- Expects: `{ status: true, data: managedUser }`
- Backends: Node + .NET
- Purpose: Ενημερώνει identity fields managed user χωρίς role ή tenant αλλαγή.

### DELETE /superadmin/users/{userId}

- Used by: `useSuperAdminUsers.remove` for USER rows
- Sends: none; Bearer token
- Expects: `{ status: true, message }`
- Backends: Node + .NET
- Purpose: Διαγράφει plain USER από το global panel.

### DELETE /superadmin/staff/{userId}

- Used by: `useSuperAdminUsers.remove` for STAFF rows
- Sends: none; Bearer token
- Expects: `{ status: true, message }`
- Backends: Node + .NET
- Purpose: Διαγράφει STAFF membership και account.

### DELETE /superadmin/admins/{userId}

- Used by: `useSuperAdminUsers.remove` for ADMIN rows
- Sends: none; Bearer token
- Expects: `{ status: true, message }`
- Backends: Node + .NET
- Purpose: Διαγράφει ADMIN και το associated tenant lifecycle.

### GET /superadmin/users/{userId}/ad-status

- Used by: `useSuperAdminUsers.getUserAdStatus` and the monetization dialog
- Sends: none; Bearer token
- Expects: `{ status: true, data: { hasPaid, adFreeUntil } }`
- Backends: Node + .NET
- Purpose: Διαβάζει το organization-level monetization status ADMIN/STAFF target.

### PUT /superadmin/users/{userId}/ad-status

- Used by: `useSuperAdminUsers.updateUserAdStatus` and the monetization dialog
- Sends: `{ hasPaid, adFreeUntil: string | null }`
- Expects: `{ status: true, data: { hasPaid, adFreeUntil } }`
- Backends: Node + .NET
- Purpose: Ενημερώνει το organization-level monetization status του target.

## Notes

- The current SUPERADMIN panel uses only canonical `/superadmin/...` routes and works against Node and .NET.
- The frontend uses the canonical shared account-delete and SuperAdmin contracts.
- No current Vite Axios call targets Stripe endpoints.
