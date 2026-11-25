import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

const fail = (message, status) => Response.json({ error: message }, {
  status,
  headers: { "Cache-Control": "no-store" },
});

export async function PATCH(request, { params }) {
  const access = await requireAppRole(["SUPER_ADMIN"]);
  if (access.status !== 200) {
    return fail("Only a Super Admin can change administrator access.", access.status);
  }

  const { id } = await params;
  if (!id || typeof id !== "string") return fail("Invalid administrator account.", 400);

  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (!["deactivate", "reactivate"].includes(action)) {
    return fail("Choose a valid administrator access action.", 400);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!target || target.role !== "ADMIN") {
        throw new Error("ADMIN_ACCOUNT_NOT_FOUND");
      }

      const nextActive = action === "reactivate";
      if (target.isActive === nextActive) {
        throw new Error(nextActive ? "ALREADY_ACTIVE" : "ALREADY_INACTIVE");
      }

      const updated = await tx.user.update({
        where: { id: target.id },
        data: { isActive: nextActive },
        select: { id: true, email: true, isActive: true },
      });

      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: nextActive ? "ADMIN_ACCESS_REACTIVATED" : "ADMIN_ACCESS_DEACTIVATED",
          entityType: "User",
          entityId: target.id,
          metadata: { email: target.email },
        },
      });

      return updated;
    }, { isolationLevel: "Serializable" });

    return Response.json({
      message: result.isActive
        ? "Administrator access restored for " + result.email + "."
        : "Administrator access deactivated for " + result.email + ".",
      admin: result,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.message === "ADMIN_ACCOUNT_NOT_FOUND") {
      return fail("This administrator account no longer exists or is protected.", 404);
    }
    if (error.message === "ALREADY_ACTIVE") return fail("This administrator is already active.", 409);
    if (error.message === "ALREADY_INACTIVE") return fail("This administrator is already deactivated.", 409);
    console.error("Administrator access update failed:", error);
    return fail("Could not update administrator access. Please try again.", 500);
  }
}
