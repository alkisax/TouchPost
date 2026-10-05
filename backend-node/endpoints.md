# Backend Node API

<!-- Regenerated from the current backend-node route mounts and handlers. -->

## Conventions

- Base URL example: `http://localhost:3020`
- Successful JSON responses normally use `{ status: true, data?: ..., message?: ... }`.
- Protected routes use `Authorization: Bearer <JWT>`.
- `SUPERADMIN` is global; `ADMIN` and `STAFF` use one organization membership; `USER` has no organization.
- Unless noted otherwise, validation failures return `400`, unauthenticated requests return `401`, and forbidden requests return `403`.

## General / health

### GET /
- Auth: Public
- Input: none
- Returns: `Hello World!`
- Περιγραφή: Ελέγχει ότι ο HTTP server είναι διαθέσιμος.

### GET /ping

- Auth: Public
- Input: none
- Returns: `Pong`
- Περιγραφή: Επιστρέφει απλό health-check του server.

### GET /api/ping

- Auth: Public
- Input: none
- Returns: `pong`
- Περιγραφή: Παρέχει το legacy API health-check endpoint.

### GET /health

- Auth: Public
- Input: none
- Returns: `ok`
- Περιγραφή: Επιστρέφει σύντομη ένδειξη υγείας της εφαρμογής.

### POST /front-logs/

- Auth: Public
- Input: `{ frontLog: string }`
- Returns: success envelope after forwarding the log, or validation error
- Περιγραφή: Προωθεί ένα frontend log στον server για διαγνωστικούς σκοπούς.

## Auth

### POST /auth/login

- Auth: Public
- Input: `{ username, password }`
- Returns: `{ status: true, data: { token, user } }`; `user` contains the normalized identity, `globalRoles`, and singular `organization` context
- Περιγραφή: Συνδέει οποιονδήποτε ρόλο και επιστρέφει JWT μαζί με το normalized user context.

### POST /auth/register-user

- Auth: Public
- Input: `{ username, password, name?, email? }`
- Returns: `201`, `{ status: true, data: { user, organization: null, membership: null } }`
- Περιγραφή: Δημιουργεί απλό USER χωρίς organization ή membership.

### POST /auth/register-admin

- Auth: Public
- Input: `{ username, password, name?, email?, organizationName }`
- Returns: `201`, `{ status: true, data: { user, organization, membership } }`
- Περιγραφή: Δημιουργεί ADMIN, organization και ADMIN membership συναλλακτικά.

### POST /auth/refresh

- Auth: Bearer token
- Input: none
- Returns: `{ status: true, data: { token, user? } }`; the user context may be omitted by some compatible clients
- Περιγραφή: Επαναφέρει/ανανεώνει το JWT της ενεργής authenticated session.

## Users and STAFF

The canonical STAFF-management routes resolve the ADMIN organization from the authenticated
membership; clients do not send an organization ID.

### DELETE /users/self

- Auth: Authenticated user
- Input: `{ password }`
- Returns: `{ status: true, message: "Account deleted successfully" }`
- Περιγραφή: Διαγράφει τον authenticated λογαριασμό μετά από επιβεβαίωση password.

### POST /users/staff

- Auth: ADMIN only
- Input: `{ username, password, name?, email? }`
- Returns: `201`, `{ status: true, data: { user, membership } }`
- Περιγραφή: Δημιουργεί STAFF και membership στο organization του ADMIN συναλλακτικά.

### GET /users/organization/staff

- Auth: ADMIN only
- Input: none
- Returns: `{ status: true, data: staff[] }`
- Περιγραφή: Επιστρέφει μόνο τους STAFF του organization του authenticated ADMIN.

### PUT /users/{staffId}

- Auth: ADMIN only, same organization as target STAFF
- Input: partial `{ username?, name?, email?, password? }`
- Returns: `200`, `{ status: true, data: staffSummary }`
- Περιγραφή: Ενημερώνει identity fields STAFF χωρίς αλλαγή ρόλου ή organization.

### DELETE /users/{staffId}

- Auth: ADMIN only, same organization as target STAFF
- Input: none
- Returns: `{ status: true, message }`
- Περιγραφή: Διαγράφει συναλλακτικά το STAFF membership και τον STAFF User.

## Organizations and memberships

### GET /organizations

- Auth: SUPERADMIN only
- Input: none
- Returns: `{ status: true, data: organization[] }`
- Περιγραφή: Επιστρέφει όλα τα organizations για global διαχείριση.

### GET /organizations/mine

- Auth: ADMIN or SUPERADMIN
- Input: none
- Returns: `{ status: true, data: organization[] }`
- Περιγραφή: Επιστρέφει το organization του ADMIN ή κενή λίστα χωρίς membership.

### GET /organizations/{id}

- Auth: ADMIN of that organization or SUPERADMIN
- Input: path `{id}`
- Returns: `{ status: true, data: organization }`
- Περιγραφή: Διαβάζει organization μετά από έλεγχο tenant πρόσβασης.

### POST /organizations/

- Auth: ADMIN or SUPERADMIN (το ADMIN δημιουργεί για τον εαυτό του)
- Input: `{ name }`
- Returns: `201`, `{ status: true, data: organization }`
- Περιγραφή: Δημιουργεί organization σύμφωνα με τον authenticated χρήστη.

### PUT /organizations/{id}

- Auth: ADMIN of that organization or SUPERADMIN
- Input: `{ name? }`
- Returns: `{ status: true, data: organization }`
- Περιγραφή: Ενημερώνει το όνομα organization με tenant authorization.

### DELETE /organizations/{id}

- Auth: ADMIN of that organization or SUPERADMIN
- Input: path `{id}`
- Returns: `{ status: true, message }`
- Περιγραφή: Διαγράφει organization σύμφωνα με το υπάρχον lifecycle διαγραφής.

### GET /company-users/mine

- Auth: Authenticated user
- Input: none
- Returns: `{ status: true, data: organization[] }`
- Περιγραφή: Επιστρέφει το organization context του authenticated membership.

### GET /company-users/mine/ad-status

- Auth: ADMIN or STAFF with organization membership
- Input: none
- Returns: `{ status: true, data: { organizationId, hasPaid, adFreeUntil } }`
- Περιγραφή: Διαβάζει το effective monetization status του tenant του χρήστη.

### POST /company-users/mine/ad-free

- Auth: ADMIN or STAFF with organization membership
- Input: none
- Returns: `{ status: true, data: { organizationId, hasPaid, adFreeUntil } }`
- Περιγραφή: Καταγράφει ad watch και χορηγεί το υπάρχον tenant ad-free διάστημα.

### GET /company-users/user/{userId}

- Auth: SUPERADMIN only
- Input: path `{userId}`
- Returns: `{ status: true, data: membership[] }`
- Περιγραφή: Επιστρέφει τα memberships συγκεκριμένου χρήστη.

### GET /company-users/company/{organizationId}

- Auth: ADMIN του organization ή SUPERADMIN
- Input: path `{organizationId}`
- Returns: `{ status: true, data: membership[] }`
- Περιγραφή: Επιστρέφει τα memberships ενός organization μετά από tenant έλεγχο.

### GET /company-users/company/{organizationId}/staff

- Auth: ADMIN του organization ή SUPERADMIN
- Input: path `{organizationId}`
- Returns: `{ status: true, data: staff[] }`
- Περιγραφή: Επιστρέφει τους STAFF ενός organization μετά από tenant έλεγχο.

### GET /organizations/{organizationId}/monetization

- Auth: ADMIN or STAFF membership in that organization
- Input: path `{organizationId}`
- Returns: `{ status: true, data: { organizationId, hasPaid, adFreeUntil } }`
- Περιγραφή: Διαβάζει το organization-level paid και effective ad-free state.

### POST /organizations/{organizationId}/ad-watched

- Auth: ADMIN or STAFF membership in that organization
- Input: path `{organizationId}`
- Returns: `{ status: true, data: { organizationId, hasPaid, adFreeUntil } }`
- Περιγραφή: Καταγράφει επιτυχημένο ad watch χωρίς client-side υπολογισμό διάρκειας.

## SuperAdmin

All routes in this section require `SUPERADMIN` authentication. Managed users exclude
SUPERADMIN accounts and use the normalized shape:
`{ user: { id, username, name?, email?, role }, organization?, membership? }`.
IDs in these responses are strings.

### GET /superadmin/stats

- Auth: SUPERADMIN only
- Input: none
- Returns: `{ status: true, data: summary }`
- Περιγραφή: Επιστρέφει συνοπτικά global στατιστικά του backend.

### GET /superadmin/users

- Auth: SUPERADMIN only
- Input: none
- Returns: `{ status: true, data: managedUser[] }`
- Περιγραφή: Επιστρέφει τους ADMIN, STAFF και USER όλων των organizations.

### GET /superadmin/users/{userId}

- Auth: SUPERADMIN only
- Input: path `{userId}`
- Returns: `{ status: true, data: managedUser }`
- Περιγραφή: Διαβάζει έναν διαχειρίσιμο χρήστη χωρίς να εκθέτει SUPERADMIN λογαριασμό.

### POST /superadmin/users

- Auth: SUPERADMIN only
- Input: `{ username, password, name?, email? }`
- Returns: `201`, `{ status: true, data: managedUser }`
- Περιγραφή: Δημιουργεί plain USER χωρίς global role ή organization membership.

### PUT /superadmin/users/{userId}

- Auth: SUPERADMIN only
- Input: partial `{ username?, name?, email?, password? }`
- Returns: `{ status: true, data: managedUser }`
- Περιγραφή: Ενημερώνει μόνο identity/account fields διαχειρίσιμου χρήστη.

### DELETE /superadmin/users/{userId}

- Auth: SUPERADMIN only; target must be plain USER
- Input: path `{userId}`
- Returns: `{ status: true, message: "User deleted successfully" }`
- Περιγραφή: Διαγράφει μόνο USER χωρίς organization membership.

### POST /superadmin/admins

- Auth: SUPERADMIN only
- Input: `{ username, password, name?, email?, organizationName }`
- Returns: `201`, `{ status: true, data: managedUser }`
- Περιγραφή: Δημιουργεί ADMIN, νέο organization και ADMIN membership.

### GET /superadmin/admins

- Auth: SUPERADMIN only
- Input: none
- Returns: `{ status: true, data: adminMembership[] }`
- Περιγραφή: Επιστρέφει ADMIN memberships με τα αντίστοιχα στοιχεία.

### GET /superadmin/admins/{userId}

- Auth: SUPERADMIN only
- Input: path `{userId}`
- Returns: `{ status: true, data: { user, membership } }`
- Περιγραφή: Διαβάζει ADMIN και το ADMIN membership του.

### PATCH /superadmin/admins/{userId}

- Auth: SUPERADMIN only
- Input: partial `{ username?, name?, email?, password? }`
- Returns: `{ status: true, data: user }`
- Περιγραφή: Ενημερώνει identity fields ενός ADMIN μέσω legacy admin endpoint.

### DELETE /superadmin/admins/{userId}

- Auth: SUPERADMIN only
- Input: path `{userId}`
- Returns: `{ status: true, message }`
- Περιγραφή: Διαγράφει ADMIN, tenant memberships, STAFF και organization με το υπάρχον lifecycle.

### GET /superadmin/organizations

- Auth: SUPERADMIN only
- Input: none
- Returns: `{ status: true, data: organization[] }`
- Περιγραφή: Επιστρέφει organizations για επιλογή tenant κατά τη δημιουργία STAFF.

### GET /superadmin/companies

- Auth: SUPERADMIN only
- Input: none
- Returns: `{ status: true, data: organization[] }`
- Περιγραφή: Παρέχει το legacy alias για τη global λίστα organizations.

### POST /superadmin/organizations/{organizationId}/staff

- Auth: SUPERADMIN only
- Input: `{ username, password, name?, email? }`; path `{organizationId}`
- Returns: `201`, `{ status: true, data: managedUser }`
- Περιγραφή: Δημιουργεί STAFF στο ρητά επιλεγμένο υπάρχον organization.

### PATCH /superadmin/organizations/{organizationId}/staff/{userId}

- Auth: SUPERADMIN only
- Input: partial `{ username?, name?, email?, password? }`; path `{organizationId}`, `{userId}`
- Returns: `{ status: true, data: user }`
- Περιγραφή: Ενημερώνει STAFF μόνο μέσα στο συγκεκριμένο organization.

### DELETE /superadmin/organizations/{organizationId}/staff/{userId}

- Auth: SUPERADMIN only
- Input: path `{organizationId}`, `{userId}`
- Returns: `{ status: true, message }`
- Περιγραφή: Διαγράφει STAFF membership και User με έλεγχο organization.

### DELETE /superadmin/staff/{userId}

- Auth: SUPERADMIN only
- Input: path `{userId}`
- Returns: `{ status: true, message: "Staff deleted successfully" }`
- Περιγραφή: Διαγράφει STAFF membership και User με organization που εντοπίζεται server-side.

### GET /superadmin/users/{userId}/ad-status

- Auth: SUPERADMIN only
- Input: path `{userId}`
- Returns: `{ status: true, data: { hasPaid, adFreeUntil } }`; expired dates are `null`
- Περιγραφή: Διαβάζει το monetization state του organization ADMIN ή STAFF.

### PUT /superadmin/users/{userId}/ad-status

- Auth: SUPERADMIN only
- Input: `{ hasPaid, adFreeUntil: string | null }`; path `{userId}`
- Returns: `{ status: true, data: { hasPaid, adFreeUntil } }`
- Περιγραφή: Ενημερώνει το organization-level monetization state του target user.

## Legacy user routes mounted under `/api/users`

These routes are active in Node for compatibility. Prefer the canonical routes above for
new clients.

### POST /api/users/

- Auth: SUPERADMIN only
- Input: `{ username, password, name?, email? }`
- Returns: `201`, `{ status: true, data: user }`
- Περιγραφή: Δημιουργεί USER μέσω του παλαιότερου global user API.

### GET /api/users/organization

- Auth: ADMIN only
- Input: none
- Returns: `{ status: true, data: user[] }`
- Περιγραφή: Επιστρέφει τους χρήστες του organization του ADMIN.

### GET /api/users/

- Auth: SUPERADMIN only
- Input: none
- Returns: `{ status: true, data: user[] }`
- Περιγραφή: Επιστρέφει όλους τους χρήστες μέσω του legacy user API.

### GET /api/users/{id}

- Auth: Authenticated; access is self, same-organization STAFF management, or SUPERADMIN
- Input: path `{id}`
- Returns: `{ status: true, data: user }`
- Περιγραφή: Διαβάζει χρήστη με τους παλαιότερους κανόνες πρόσβασης.

### PUT /api/users/{id}

- Auth: Authenticated; self, same-organization ADMIN/STAFF rules, or SUPERADMIN
- Input: partial `{ username?, password?, name?, email? }`
- Returns: `{ status: true, data: user }`
- Περιγραφή: Ενημερώνει χρήστη μέσω του legacy user API.

### PUT /api/users/{id}/role

- Auth: SUPERADMIN only
- Input: `{ role: "ADMIN" | "STAFF" | "USER" }`
- Returns: `{ status: true, data: user }`
- Περιγραφή: Αλλάζει ρόλο μέσω legacy lifecycle endpoint.

### PUT /api/users/{id}/superadmin

- Auth: SUPERADMIN only
- Input: path `{id}`
- Returns: `{ status: true, data: user }`
- Περιγραφή: Προάγει χρήστη σε global SUPERADMIN μέσω legacy endpoint.

### DELETE /api/users/self

- Auth: Authenticated user
- Input: `{ password }`
- Returns: `{ status: true, message: "Account deleted successfully" }`
- Περιγραφή: Παρέχει το legacy-mounted alias για self-delete.

### DELETE /api/users/{id}

- Auth: Authenticated; rules depend on self, ADMIN tenant scope, or SUPERADMIN
- Input: path `{id}`; self-delete requires `{ password }`
- Returns: `{ status: true, message }`
- Περιγραφή: Διαγράφει χρήστη μέσω του legacy lifecycle και των αντίστοιχων ελέγχων.

## Stripe

### POST /api/stripe/payment/webhook

- Auth: Stripe signature, not Bearer auth
- Input: raw Stripe JSON body plus `stripe-signature` header
- Returns: Stripe webhook acknowledgement or error text
- Περιγραφή: Παραλαμβάνει και επαληθεύει Stripe webhook events με raw request body.

### POST /api/stripe/payment/checkout

- Auth: ADMIN only
- Input: `{ amountCents }`
- Returns: `{ status: true, data: { id, url? } }`
- Περιγραφή: Δημιουργεί Stripe checkout session για το organization του ADMIN.

### POST /api/stripe/connect/account

- Auth: ADMIN only
- Input: none
- Returns: `201` with `{ status: true, data: { accountId, onboardingComplete } }` or existing account data
- Περιγραφή: Δημιουργεί ή επιστρέφει Stripe connected account του organization.

### POST /api/stripe/connect/onboarding-link

- Auth: ADMIN only
- Input: none
- Returns: `{ status: true, data: { url } }`
- Περιγραφή: Δημιουργεί onboarding link για το Stripe connected account.

### GET /api/stripe/connect/status

- Auth: ADMIN only
- Input: none
- Returns: `{ status: true, data: { accountId, chargesEnabled, payoutsEnabled, detailsSubmitted } }`
- Περιγραφή: Επιστρέφει την κατάσταση του Stripe connected account του organization.

## Static/support responses

### GET /privacy

- Auth: Public
- Input: none
- Returns: static privacy HTML
- Περιγραφή: Εξυπηρετεί τη στατική σελίδα privacy policy.

### GET /delete-account

- Auth: Public
- Input: none
- Returns: static account-deletion HTML
- Περιγραφή: Εξυπηρετεί τη στατική ενημερωτική σελίδα διαγραφής λογαριασμού.

### GET /app-ads.txt

- Auth: Public
- Input: none
- Returns: static `app-ads.txt`
- Περιγραφή: Εξυπηρετεί το αρχείο διαφημιστικής επαλήθευσης της εφαρμογής.

## Socket.IO

Socket.IO is initialized separately from Express HTTP routes. The current server exposes
no application event handlers beyond authenticated connection/organization-room setup.

- `connection`: Authenticated ADMIN/STAFF sockets join `organization:{organizationId}:admins`.
- `disconnect`: Socket.IO lifecycle event; no custom application handler is registered here.
