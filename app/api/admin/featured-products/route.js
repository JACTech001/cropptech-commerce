import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const KEY = "homepage_featured_products";
const ROLES = ["ADMIN", "SUPER_ADMIN"];
const MAX_FEATURED = 6;

function error(message, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const access = await requireAppRole(ROLES);
  if (access.status !== 200) return error("You are not authorised to manage featured products.", access.status);

  try {
    const [setting, products] = await Promise.all([
      prisma.storeSetting.findUnique({ where: { key: KEY } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ updatedAt: "desc" }],
        include: {
          variants: { where: { isActive: true }, orderBy: [{ colour: "asc" }, { size: "asc" }] },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      }),
    ]);
    const productIds = Array.isArray(setting?.value?.productIds)
      ? setting.value.productIds.filter((id) => typeof id === "string")
      : [];
    const eligibleProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      productType: product.productType,
      image: product.images[0]?.secureUrl || "",
      price: product.variants.length ? Math.min(...product.variants.map((variant) => Number(variant.price))) : null,
      inStock: product.variants.some((variant) => variant.stockQuantity > 0),
      eligible: product.images.length > 0 && product.variants.some((variant) => variant.stockQuantity > 0),
      selected: productIds.includes(product.id),
    }));
    const validIds = productIds.filter((id) => eligibleProducts.some((product) => product.id === id && product.eligible));
    return Response.json({
      products: eligibleProducts,
      featuredProductIds: validIds,
      configured: Boolean(setting),
      maxFeatured: MAX_FEATURED,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    console.error("Featured products could not be loaded:", cause);
    return error("Featured products could not be loaded.", 500);
  }
}

export async function PUT(request) {
  const access = await requireAppRole(ROLES);
  if (access.status !== 200) return error("You are not authorised to manage featured products.", access.status);

  let body;
  try { body = await request.json(); } catch { return error("Invalid featured product selection."); }
  if (!Array.isArray(body?.productIds)) return error("Choose a valid list of featured products.");
  const productIds = body.productIds;
  if (productIds.length > MAX_FEATURED) return error("You can feature up to six products on the homepage.");
  if (productIds.some((id) => typeof id !== "string" || !id.trim()) || new Set(productIds).size !== productIds.length) {
    return error("Each product can only be selected once.");
  }

  try {
    const products = productIds.length ? await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: {
        variants: { where: { isActive: true }, select: { stockQuantity: true } },
        images: { take: 1, select: { id: true } },
      },
    }) : [];
    const eligibleIds = new Set(products.filter((product) =>
      product.images.length > 0 && product.variants.some((variant) => variant.stockQuantity > 0)
    ).map((product) => product.id));
    if (eligibleIds.size !== productIds.length) {
      return error("Every featured product must be published, have a product image and have at least one in-stock variant.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.storeSetting.upsert({
        where: { key: KEY },
        create: {
          key: KEY,
          value: { productIds },
          description: "Ordered product IDs selected for the customer homepage featured products section.",
        },
        update: {
          value: { productIds },
          description: "Ordered product IDs selected for the customer homepage featured products section.",
        },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "HOMEPAGE_FEATURED_PRODUCTS_UPDATED",
          entityType: "StoreSetting",
          entityId: KEY,
          metadata: { productIds, count: productIds.length },
        },
      });
    });

    return Response.json({ success: true, featuredProductIds: productIds }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (cause) {
    console.error("Featured products save failed:", cause);
    return error("Featured products could not be saved. Please try again.", 500);
  }
}
