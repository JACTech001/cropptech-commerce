import { Prisma } from "@prisma/client";
import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const roles = ["ADMIN", "SUPER_ADMIN"];
const categories = ["MEN", "WOMEN", "UNISEX"];
const statuses = ["DRAFT", "ACTIVE", "ARCHIVED"];
const clean = (value, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";
const slugify = (value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function error(message, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function normalizeVariants(value) {
  if (!Array.isArray(value) || value.length > 100) throw new Error("Provide a valid list of product variants.");
  return value.map((variant) => {
    const size = clean(variant?.size, 30);
    const colour = clean(variant?.colour, 60);
    const sku = clean(variant?.sku, 80).toUpperCase();
    const priceText = String(variant?.price ?? "").trim();
    const price = Number(priceText);
    const stockQuantity = Number(variant?.stockQuantity);
    if (!size || !colour || !sku || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 100000) {
      throw new Error("Each variant needs a SKU, size, colour, positive price and whole-number stock quantity.");
    }
    return { id: clean(variant?.id, 80) || undefined, size, colour, sku, price: new Prisma.Decimal(price.toFixed(2)), stockQuantity, isActive: variant?.isActive !== false };
  });
}

function normalizeImages(value) {
  if (!Array.isArray(value) || value.length > 30) throw new Error("Provide a valid product image list.");
  return value.map((image, index) => {
    const cloudinaryPublicId = clean(image?.cloudinaryPublicId, 250);
    const secureUrl = clean(image?.secureUrl, 1000);
    if (!cloudinaryPublicId || !secureUrl.startsWith("https://res.cloudinary.com/")) {
      throw new Error("Product images must be secure Cloudinary assets.");
    }
    return {
      cloudinaryPublicId,
      secureUrl,
      altText: clean(image?.altText, 250) || null,
      role: index === 0 ? "primary" : "gallery",
      sortOrder: index,
      width: Number.isInteger(image?.width) ? image.width : null,
      height: Number.isInteger(image?.height) ? image.height : null,
      format: clean(image?.format, 20) || null,
    };
  });
}

export async function GET() {
  const access = await requireAppRole(roles);
  if (access.status !== 200) return error("You are not authorised to manage the catalogue.", access.status);

  const products = await prisma.product.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      variants: { orderBy: [{ colour: "asc" }, { size: "asc" }] },
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { orderItems: true } },
    },
  });
  return Response.json({ products }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const access = await requireAppRole(roles);
  if (access.status !== 200) return error("You are not authorised to manage the catalogue.", access.status);

  let body;
  try { body = await request.json(); } catch { return error("Invalid product details."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return error("Invalid product details.");

  const name = clean(body.name, 160);
  const slug = slugify(clean(body.slug, 180) || name);
  const description = clean(body.description, 5000);
  const category = clean(body.category, 20).toUpperCase();
  const status = clean(body.status, 20).toUpperCase();
  if (!name || !slug || !description || !categories.includes(category) || !statuses.includes(status)) {
    return error("Complete the product name, description, category and status.");
  }

  let variants, images;
  try {
    variants = normalizeVariants(body.variants);
    images = normalizeImages(body.images || []);
  } catch (cause) { return error(cause.message); }
  if (new Set(variants.map((v) => v.sku)).size !== variants.length ||
      new Set(variants.map((v) => v.size.toLowerCase() + "|" + v.colour.toLowerCase())).size !== variants.length) {
    return error("Each size and colour combination and each SKU must be unique.");
  }
  if (status === "ACTIVE" && (!variants.length || !images.length)) {
    return error("Add at least one priced, stocked variant and one product image before publishing.");
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name, slug, description, category, status,
          isFeatured: body.isFeatured === true,
          archivedAt: status === "ARCHIVED" ? new Date() : null,
          variants: { create: variants.map(({ id, ...variant }) => variant) },
          images: { create: images },
        },
        include: { variants: true, images: true },
      });
      await tx.adminAuditLog.create({
        data: { actorId: access.user.id, action: "PRODUCT_CREATED", entityType: "Product", entityId: created.id, metadata: { name, status } },
      });
      return created;
    });
    return Response.json({ product }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    if (cause?.code === "P2002") return error("That product slug or SKU is already in use.", 409);
    console.error("Product creation failed:", cause);
    return error("The product could not be created. Check the details and try again.", 500);
  }
}

export async function PATCH(request) {
  const access = await requireAppRole(roles);
  if (access.status !== 200) return error("You are not authorised to manage the catalogue.", access.status);

  let body;
  try { body = await request.json(); } catch { return error("Invalid product details."); }
  const id = clean(body?.id, 80);
  if (!id) return error("Product ID is required.");

  const current = await prisma.product.findUnique({ where: { id }, include: { variants: true, images: true } });
  if (!current) return error("Product not found.", 404);

  const name = clean(body.name, 160);
  const slug = slugify(clean(body.slug, 180) || name);
  const description = clean(body.description, 5000);
  const category = clean(body.category, 20).toUpperCase();
  const status = clean(body.status, 20).toUpperCase();
  if (!name || !slug || !description || !categories.includes(category) || !statuses.includes(status)) {
    return error("Complete the product name, description, category and status.");
  }

  let variants, images;
  try {
    variants = normalizeVariants(body.variants || []);
    images = normalizeImages(body.images || []);
  } catch (cause) { return error(cause.message); }

  if (new Set(variants.map((v) => v.sku)).size !== variants.length ||
      new Set(variants.map((v) => v.size.toLowerCase() + "|" + v.colour.toLowerCase())).size !== variants.length) {
    return error("Each size and colour combination and each SKU must be unique.");
  }
  const resultingImages = images.length ? images : current.images;
  if (status === "ACTIVE" && (!variants.length || !resultingImages.length)) {
    return error("A published product needs at least one priced variant and one product image.");
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          name, slug, description, category, status,
          isFeatured: body.isFeatured === true,
          archivedAt: status === "ARCHIVED" ? current.archivedAt || new Date() : null,
        },
      });

      for (const variant of variants) {
        const { id: variantId, ...values } = variant;
        if (variantId) {
          const existing = current.variants.find((entry) => entry.id === variantId);
          if (!existing) throw new Error("VARIANT_NOT_FOUND");
          const stockDelta = values.stockQuantity - existing.stockQuantity;
          await tx.productVariant.update({ where: { id: variantId }, data: values });
          if (stockDelta !== 0) {
            await tx.inventoryTransaction.create({
              data: { variantId, adjustedById: access.user.id, type: "ADJUSTMENT", quantity: stockDelta, reason: "Stock updated from catalogue manager." },
            });
          }
        } else {
          const createdVariant = await tx.productVariant.create({ data: { ...values, productId: id } });
          if (values.stockQuantity > 0) {
            await tx.inventoryTransaction.create({
              data: { variantId: createdVariant.id, adjustedById: access.user.id, type: "STOCK_ADDED", quantity: values.stockQuantity, reason: "Initial stock entered in catalogue manager." },
            });
          }
        }
      }

      for (const image of images) {
        await tx.productImage.upsert({
          where: { productId_cloudinaryPublicId: { productId: id, cloudinaryPublicId: image.cloudinaryPublicId } },
          create: { ...image, productId: id },
          update: { ...image },
        });
      }

      await tx.adminAuditLog.create({
        data: { actorId: access.user.id, action: "PRODUCT_UPDATED", entityType: "Product", entityId: id, metadata: { name, status, variantsChanged: variants.length, imagesAddedOrUpdated: images.length } },
      });
      return tx.product.findUnique({
        where: { id },
        include: { variants: { orderBy: [{ colour: "asc" }, { size: "asc" }] }, images: { orderBy: { sortOrder: "asc" } } },
      });
    });
    return Response.json({ product }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    if (cause?.code === "P2002") return error("That product slug, SKU or size/colour combination is already in use.", 409);
    if (cause?.message === "VARIANT_NOT_FOUND") return error("A selected variant does not belong to this product.", 400);
    console.error("Product update failed:", cause);
    return error("The product could not be updated. Check the details and try again.", 500);
  }
}
