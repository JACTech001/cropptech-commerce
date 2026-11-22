import "server-only";
import { auth } from "./server";
import { prisma } from "../db";

export class AuthIdentityConflictError extends Error {
  constructor() {
    super("This email is already linked to a different account. Contact support for help.");
    this.name = "AuthIdentityConflictError";
  }
}

/**
 * Resolve the signed-in Neon Auth identity to CroppTech's application user.
 * New application users always receive the Prisma schema's CUSTOMER default.
 * Roles are never accepted from browser input or copied from auth metadata.
 */
export async function getCurrentAppUser() {
  const { data: session, error } = await auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.user) {
    return null;
  }

  const identity = session.user;
  const authSubject = identity.id;
  const email = typeof identity.email === "string"
    ? identity.email.trim().toLowerCase()
    : "";

  if (!authSubject || !email) {
    return null;
  }

  try {
    return await prisma.user.upsert({
      where: {
        authProvider_authSubject: {
          authProvider: "neon",
          authSubject,
        },
      },
      create: {
        authProvider: "neon",
        authSubject,
        email,
        fullName: typeof identity.name === "string" && identity.name.trim()
          ? identity.name.trim()
          : null,
      },
      update: {
        email,
        fullName: typeof identity.name === "string" && identity.name.trim()
          ? identity.name.trim()
          : null,
      },
    });
  } catch (error) {
    // Do not silently link two different identity-provider accounts by email.
    if (error?.code === "P2002") {
      throw new AuthIdentityConflictError();
    }
    throw error;
  }
}
