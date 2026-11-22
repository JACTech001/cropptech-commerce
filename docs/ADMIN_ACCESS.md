# Admin access and initial Super Admin

## Initial account

The first account that successfully completes sign-up/sign-in and is synchronized into the CroppTech application user table is promoted to `SUPER_ADMIN`.

The application performs this bootstrap in `getCurrentAppUser()` using the unique `StoreSetting.key` value `initial_super_admin_claim`. The claim and role update run in one database transaction. The unique setting key ensures that only one account can win, including if two first-time accounts synchronize at nearly the same time.

This is a one-time bootstrap. Subsequent registrations receive the normal `CUSTOMER` role. The browser cannot submit or select a role, and changing Neon Auth user metadata does not grant an application role.

**Important:** the first person to complete application account synchronization becomes Super Admin. Before opening registration to the public, the intended owner should create and sign in to their account first. The first account should be created using an email address the owner controls.

## Adding administrators later

Additional `ADMIN` and `SUPER_ADMIN` accounts must be granted through a protected, server-side administration workflow. Do not add a public role selector, public promotion endpoint, or role assignment based only on an email address. Every admin operation must check the current application user's role on the server and write an audit log.

The admin management interface and role-management endpoints are not implemented yet. Until then, do not manually expose database credentials or provide customers with admin access.

## Admin route protection

The `proxy.js` middleware is only a navigation layer. Every admin page's server-side data access, Route Handler, and Server Action must independently use the role guard in `lib/auth/user.js`:

- Admin-only operation: `requireAppRole(["ADMIN", "SUPER_ADMIN"])`
- Super-Admin-only operation: `requireAppRole(["SUPER_ADMIN"])`

A missing session must be treated as unauthenticated, inactive accounts must be denied, and all other roles must be denied. Never rely on a hidden button or client-side route check for authorization.

## Development and production

The initial claim is stored in the database connected through the current `DATABASE_URL`. Development and production databases have independent claims. The owner must create the intended first account in each environment before public registration is enabled there.
