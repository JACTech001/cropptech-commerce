import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [records, featuredSetting] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      include: {
        variants: { where: { isActive: true }, orderBy: [{ colour: "asc" }, { size: "asc" }] },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.storeSetting.findUnique({ where: { key: "homepage_featured_products" } }),
  ]);

  const configured = Boolean(featuredSetting);
  const selectedIds = Array.isArray(featuredSetting?.value?.productIds)
    ? featuredSetting.value.productIds.filter((id) => typeof id === "string")
    : [];
  const selectedOrder = new Map(selectedIds.map((id, index) => [id, index]));
  const sellableRecords = records.filter((product) => product.variants.length > 0 && product.images.length > 0);

  const products = sellableRecords.map((product) => {
    const prices = product.variants.map((variant) => Number(variant.price));
    const colours = [...new Set(product.variants.map((variant) => variant.colour))];
    const hasStock = product.variants.some((variant) => variant.stockQuantity > 0);
    const featured = configured ? selectedOrder.has(product.id) && hasStock : product.isFeatured;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.productType === "SETS" ? "Sets" : product.productType.charAt(0) + product.productType.slice(1).toLowerCase(),
      audience: product.category === "MEN" ? "Men" : product.category === "WOMEN" ? "Women" : "Unisex",
      tone: colours[0] || "Natural",
      image: product.images[0].secureUrl,
      images: product.images.map((image) => ({ id: image.id, url: image.secureUrl, altText: image.altText })),
      tag: featured ? "FEATURED LINEN" : "LINEN COLLECTION",
      featured,
      featuredOrder: featured && configured ? selectedOrder.get(product.id) : null,
      price: Math.min(...prices),
      availableSizes: [...new Set(product.variants.map((variant) => variant.size))],
      colours,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        colour: variant.colour,
        price: Number(variant.price),
        stockQuantity: variant.stockQuantity,
        isActive: variant.isActive,
      })),
    };
  });

  return Response.json({ products, featuredSelectionConfigured: configured }, {
    headers: { "Cache-Control": "no-store" },
  });
}
