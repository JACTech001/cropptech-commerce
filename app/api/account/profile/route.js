import { getCurrentAppUser } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

function normalizeName(value) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

export async function POST(request) {
  try {
    const user = await getCurrentAppUser();

    if (!user) {
      return Response.json({ error: "You must sign in to update your account." }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({ error: "This account has been disabled." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Please provide valid name details." }, { status: 400 });
    }

    const firstName = normalizeName(body.firstName);
    const lastName = normalizeName(body.lastName);

    if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80) {
      return Response.json({ error: "First name and last name are required and must each be 80 characters or fewer." }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}`;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName, fullName },
      select: { id: true, firstName: true, lastName: true, fullName: true },
    });

    return Response.json({ user: updatedUser }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "We could not save your name details. Please try again." }, { status: 500 });
  }
}
