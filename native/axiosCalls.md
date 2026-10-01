# Native Axios Calls

<!-- Regenerated from the current active Native Axios call sites. -->

## Conventions

- Backend base URL: `EXPO_PUBLIC_BACKEND_URL`, fallback `http://localhost:3020` in `src/constants/constants.ts`.
- `src/authLogin/services/api.ts` exports a shared Axios instance created with `axios.create()`; it has no base URL or interceptor configured.
- Protected calls read the token from `AsyncStorage` and usually send `Authorization: Bearer <token>` explicitly.
- The auth context persists `token` and normalized `authUser` in AsyncStorage.
- `Backends` identifies whether the exact call exists in current Node and .NET references.

## Auth

### POST /auth/login

- Used by: `src/app/login.tsx`
- Sends: `{ username, password }`
- Expects: `{ status: true, data: { token, user } }`
- Backends: Node + .NET
- Purpose: Συνδέει τον χρήστη, κανονικοποιεί το user context και οδηγεί στον ρόλο του.

### POST /auth/register-user

- Used by: `src/app/register.tsx`
- Sends: `{ username, password, name?, email? }`
- Expects: `status === true`, then navigates to `/login`
- Backends: Node + .NET
- Purpose: Δημιουργεί δημόσιο USER χωρίς tenant membership.

### POST /auth/register-admin

- Used by: `src/app/register-admin.tsx`
- Sends: `{ username, password, organizationName, name?, email? }`
- Expects: `status === true`, then navigates to `/login`
- Backends: Node + .NET
- Purpose: Δημιουργεί ADMIN μαζί με το organization του.

### POST /auth/refresh

- Used by: `src/authLogin/context/UserAuthContext.tsx`
- Sends: `{}` and `Authorization: Bearer <stored token>`
- Expects: `{ status: true, data: { token, user? } }`; Node may return `user`, .NET returns only `token`
- Backends: Node + .NET (contract difference handled by retaining persisted `authUser` when `user` is absent)
- Purpose: Ανανεώνει το session token κατά την αποκατάσταση authentication.

## Account

### DELETE /users/self

- Used by: `src/app/account/index.tsx`
- Sends: `{ password }` and `Authorization: Bearer <token>` in the Axios config
- Expects: `{ status: true, message: "Account deleted successfully" }`; then clears session and navigates to `/login`
- Backends: Node + .NET
- Purpose: Διαγράφει τον authenticated λογαριασμό μετά από επιβεβαίωση password.

## Admin / STAFF

### GET /users/organization/staff

- Used by: `src/components/admin/AdminStaff.tsx`
- Sends: none; Bearer token from AsyncStorage
- Expects: `{ status: true, data: staff[] }`
- Backends: Node + .NET
- Purpose: Φορτώνει τους STAFF του organization του ADMIN.

### POST /users/staff

- Used by: `src/components/admin/AdminStaff.tsx`
- Sends: `{ username, name?, email?, password? }`; password is required by validation when creating
- Expects: successful creation, then refreshes the list
- Backends: Node + .NET
- Purpose: Δημιουργεί STAFF στο tenant του ADMIN.

### PUT /users/{staffId}

- Used by: `src/components/admin/AdminStaff.tsx`
- Sends: `{ username, name?, email?, password? }`
- Expects: successful update, then refreshes the list
- Backends: Node + .NET
- Purpose: Ενημερώνει identity fields STAFF χωρίς αλλαγή ρόλου ή tenant.

### DELETE /users/{staffId}

- Used by: `src/components/admin/AdminStaff.tsx`
- Sends: none; Bearer token from AsyncStorage
- Expects: successful deletion, then refreshes the list
- Backends: Node + .NET
- Purpose: Διαγράφει STAFF του ίδιου organization από το ADMIN UI.

## Monetization

### GET /company-users/mine/ad-status

- Used by: `src/app/index.tsx`
- Sends: none; Bearer token from AsyncStorage
- Expects: `{ status: true, data: { hasPaid, adFreeUntil } }`; the native screen uses the returned status to hide/show mock ads
- Backends: Node + .NET
- Purpose: Διαβάζει το organization/company-level monetization status ADMIN/STAFF.

### POST /company-users/mine/ad-free

- Used by: `src/app/index.tsx` after mock ad completion
- Sends: `{}` and Bearer token from AsyncStorage
- Expects: `{ status: true, data: { hasPaid, adFreeUntil } }`; backend owns the 10-hour grant
- Backends: Node + .NET
- Purpose: Καταγράφει ad watch και ανανεώνει το tenant ad-free state.

## Logging

### POST /front-logs/

- Used by: `src/utils/logToServer.ts`, called by `src/context/RoomContext.tsx`
- Sends: `{ frontLog: string }`
- Expects: no stable response is consumed; failures are logged locally
- Backends: Node + .NET
- Purpose: Προσπαθεί να στείλει διαγνωστικά logs από το room context.

## Notes

- The current native app makes 13 unique HTTP calls documented above.
- No native call uses a Node `/api/...` auth, STAFF, organization, or SuperAdmin route.
- Native has no current SuperAdmin HTTP UI or calls.
- Compared with the Vite map, native additionally uses tenant monetization calls and does not use the Vite SuperAdmin calls.
- Settings now routes account deletion through the canonical Account screen and self-delete flow.
- Mock ad UI itself does not make an HTTP request; only completion triggers the monetization POST.
