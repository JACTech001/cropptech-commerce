import { prisma } from "../../../lib/db";

const KEY = "homepage_media";

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: KEY } });
    return Response.json({ media: setting?.value && typeof setting.value === "object" ? setting.value : {} }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Homepage media could not be loaded:", error);
    return Response.json({ media: {} }, { headers: { "Cache-Control": "no-store" } });
  }
}
