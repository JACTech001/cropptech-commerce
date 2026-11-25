import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const roles = ["ADMIN", "SUPER_ADMIN"];
const fail = (message, status = 400) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const access = await requireAppRole(roles);
  if (access.status !== 200) return fail("You are not authorised to manage inventory.", access.status);
  try {
    const variants = await prisma.productVariant.findMany({
      orderBy: [{ product: { name: "asc" } }, { colour: "asc" }, { size: "asc" }],
      include: { product: { select: { id: true, name: true, status: true } } },
    });
    const totals = {
      variants: variants.length,
      active: variants.filter((item) => item.isActive).length,
      lowStock: variants.filter((item) => item.isActive && item.stockQuantity > 0 && item.stockQuantity <= 5).length,
      outOfStock: variants.filter((item) => item.isActive && item.stockQuantity === 0).length,
      units: variants.reduce((sum, item) => sum + item.stockQuantity, 0),
    };
    return Response.json({ variants, totals, lowStockThreshold: 5 }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Inventory load failed:", error);
    return fail("Inventory is temporarily unavailable.", 500);
  }
}

export async function POST(request) {
  const access = await requireAppRole(roles);
  if (access.status !== 200) return fail("You are not authorised to adjust inventory.", access.status);
  const body = await request.json().catch(() => null);
  const variantId = typeof body?.variantId === "string" ? body.variantId.trim() : "";
  const action = typeof body?.action === "string" ? body.action.toUpperCase() : "";
  const quantity = Number(body?.quantity);
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 300) : "";
  if (!variantId || !["ADD", "REMOVE", "SET"].includes(action) || !Number.isInteger(quantity) || quantity < 0 || quantity > 100000) {
    return fail("Choose a variant and enter a valid whole-number stock quantity.");
  }
  if (action !== "SET" && quantity < 1) return fail("Enter a quantity greater than zero.");
  if (!reason) return fail("Provide a reason for this stock adjustment.");
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.productVariant.findUnique({ where: { id: variantId }, include: { product: { select: { name: true } } } });
      if (!current) throw new Error("VARIANT_NOT_FOUND");
      const nextQuantity = action === "ADD" ? current.stockQuantity + quantity : action === "REMOVE" ? current.stockQuantity - quantity : quantity;
      if (nextQuantity < 0) throw new Error("INSUFFICIENT_STOCK");
      if (nextQuantity > 100000) throw new Error("STOCK_LIMIT");
      const delta = nextQuantity - current.stockQuantity;
      if (delta === 0) return current;
      const changed = await tx.productVariant.updateMany({
        where: { id: variantId, stockQuantity: current.stockQuantity },
        data: { stockQuantity: nextQuantity },
      });
      if (changed.count !== 1) throw new Error("STOCK_CHANGED");
      await tx.inventoryTransaction.create({
        data: {
          variantId,
          adjustedById: access.user.id,
          type: action === "ADD" ? "STOCK_ADDED" : action === "REMOVE" ? "STOCK_REMOVED" : "ADJUSTMENT",
          quantity: delta,
          reason,
        },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "INVENTORY_ADJUSTED",
          entityType: "ProductVariant",
          entityId: variantId,
          metadata: { productName: current.product.name, sku: current.sku, previousQuantity: current.stockQuantity, nextQuantity, reason },
        },
      });
      return tx.productVariant.findUnique({ where: { id: variantId }, include: { product: { select: { id: true, name: true, status: true } } } });
    }, { isolationLevel: "Serializable" });
    return Response.json({ variant: updated, message: "Stock quantity updated and recorded in inventory history." }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const known = {
      VARIANT_NOT_FOUND: [404, "This product variant could not be found."],
      INSUFFICIENT_STOCK: [409, "There is not enough stock to remove that quantity."],
      STOCK_LIMIT: [400, "Stock quantity cannot exceed 100,000 units."],
      STOCK_CHANGED: [409, "This stock quantity changed in another session. Refresh inventory and try again."],
    };
    if (known[error.message]) return fail(known[error.message][1], known[error.message][0]);
    if (error?.code === "P2034") return fail("Inventory changed at the same time. Refresh and try again.", 409);
    console.error("Inventory adjustment failed:", error);
    return fail("The stock adjustment could not be saved.", 500);
  }
}
