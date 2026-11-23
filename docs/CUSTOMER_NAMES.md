# Customer first and last names

Customer registration collects first name and last name separately. Neon Auth continues to receive a single display name, composed from those fields, while the CroppTech application stores `firstName`, `lastName`, and the existing `fullName`.

## Existing accounts

The migration adds nullable columns and backfills them from the existing `fullName` value. It does not delete or rewrite authentication identities, email addresses, passwords, roles, orders, addresses, or payment records. The split for historical names is best-effort: the first word becomes `firstName`, and the remaining words become `lastName`. Customers can correct their names when profile editing is introduced.

The old `fullName` field remains in place for compatibility with order and customer views. Existing users can continue signing in with the same email and password.

## Apply safely

Run this migration against the development Neon branch first. Validate the Prisma schema, generate the client, apply the migration, then test both a new registration and an existing account sign-in before promoting the same migration to production.

Never reset the database or delete the existing `User` table to apply this change.
