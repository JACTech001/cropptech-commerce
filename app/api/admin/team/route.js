import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const fail = (message, status) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const access = await requireAppRole(["SUPER_ADMIN"]);
  if (access.status !== 200) return fail("Only a Super Admin can manage administrator accounts.", access.status);
  const [admins, activity] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: { id: true, email: true, firstName: true, lastName: true, fullName: true, role: true, isActive: true, createdAt: true },
    }),
    prisma.adminAuditLog.findMany({
      where: { action: { in: ["ADMIN_ACCESS_GRANTED", "ADMIN_ACCESS_DEACTIVATED", "ADMIN_ACCESS_REACTIVATED"] } },
      orderBy: { createdAt: "desc" }, take: 30,
      include: { actor: { select: { email: true, fullName: true } } },
    }),
  ]);
  return Response.json({ admins, activity }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const access = await requireAppRole(["SUPER_ADMIN"]);
  if (access.status !== 200) return fail("Only a Super Admin can grant administrator access.", access.status);
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.", 400);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { email } });
      if (!target) throw new Error("ACCOUNT_NOT_FOUND");
      if (target.role === "SUPER_ADMIN") throw new Error("SUPER_ADMIN_PROTECTED");
      if (target.role === "ADMIN") throw new Error("ALREADY_ADMIN");
      const updated = await tx.user.update({ where: { id: target.id }, data: { role: "ADMIN", isActive: true } });
      await tx.adminAuditLog.create({ data: { actorId: access.user.id, action: "ADMIN_ACCESS_GRANTED", entityType: "User", entityId: target.id, metadata: { email } } });
      return updated;
    }, { isolationLevel: "Serializable" });
    return Response.json({ message: "Administrator access granted to " + result.email + "." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.message === "ACCOUNT_NOT_FOUND") return fail("No account exists with that email. Ask the person to create a CroppTech account first.", 404);
    if (error.message === "SUPER_ADMIN_PROTECTED") return fail("A Super Admin account cannot be changed through this action.", 409);
    if (error.message === "ALREADY_ADMIN") return fail("This account already has administrator access.", 409);
    console.error("Grant admin access failed:", error);
    return fail("Could not grant administrator access. Please try again.", 500);
  }
}
