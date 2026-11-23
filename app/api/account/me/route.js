import { AuthIdentityConflictError, getCurrentAppUser } from "../../../../lib/auth/user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentAppUser();

    if (!user) {
      return Response.json({ error: "You must sign in to access your account." }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({ error: "This account has been disabled. Contact store support." }, { status: 403 });
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
      },
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuthIdentityConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }

    return Response.json({ error: "We could not load your store account. Please try again." }, { status: 500 });
  }
}
