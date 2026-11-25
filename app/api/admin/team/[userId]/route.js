import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

const fail = (message, status) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request, context) {
  const access = await requireAppRole(["SUPER_ADMIN"]);
  if (access.status !== 200) return fail("Only a Super Admin can change administrator access.", access.status);
  const { userId } = await context.params;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (!["deactivate", "reactivate"].includes(action)) return fail("Choose a valid administrator access action.", 400);
  if (userId === access.user.id) return fail("You cannot change your own administrator access here.", 409);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: userId } });
      if (!target || target.role !== "ADMIN") throw new Error("ADMIN_NOT_FOUND");
      const isActive = action === "reactivate";
      if (target.isActive === isActive) return target;
      const updated = await tx.user.update({ where: { id: userId }, data: { isActive } });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: isActive ? "ADMIN_ACCESS_REACTIVATED" : "ADMIN_ACCESS_DEACTIVATED",
          entityType: "User",
          entityId: target.id,
          metadata: { email: target.email, previousIsActive: target.isActive, isActive },
        },
      });
      return updated;
    }, { isolationLevel: "Serializable" });
    return Response.json({ message: result.isActive ? "Administrator access has been restored." : "Administrator access has been deactivated." }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.message === "ADMIN_NOT_FOUND") return fail("Only ordinary Admin accounts can be changed here. Super Admin accounts are protected.", 404);
    console.error("Update administrator access failed:", error);
    return fail("Could not update this administrator. Please try again.", 500);
  }
}
