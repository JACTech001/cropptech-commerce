import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const records = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    include: {
      variants: { where: { isActive: true }, orderBy: [{ colour: "asc" }, { size: "asc" }] },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  const products = records
    .filter((product) => product.variants.length > 0 && product.images.length > 0)
    .map((product) => {
      const prices = product.variants.map((variant) => Number(variant.price));
      const colours = [...new Set(product.variants.map((variant) => variant.colour))];
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
        tag: product.isFeatured ? "FEATURED LINEN" : "LINEN COLLECTION",
        featured: product.isFeatured,
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

  return Response.json({ products }, {
    headers: { "Cache-Control": "no-store" },
  });
}
