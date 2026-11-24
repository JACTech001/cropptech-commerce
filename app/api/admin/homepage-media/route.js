import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const KEY = "homepage_media";
const ROLES = ["ADMIN", "SUPER_ADMIN"];
const SLOT_KEYS = [
  "hero_main",
  "collection_men",
  "collection_women",
  "linen_feature",
  "moodboard_men",
  "moodboard_women",
  "moodboard_details",
  "moodboard_everyday",
  "category_linen_wear",
  "category_linen_sets",
  "category_linen_dresses",
];

function error(message, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const access = await requireAppRole(ROLES);
  if (access.status !== 200) return error("You are not authorised to manage homepage images.", access.status);
  const setting = await prisma.storeSetting.findUnique({ where: { key: KEY } });
  return Response.json({ media: setting?.value && typeof setting.value === "object" ? setting.value : {} }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request) {
  const access = await requireAppRole(ROLES);
  if (access.status !== 200) return error("You are not authorised to manage homepage images.", access.status);

  let body;
  try { body = await request.json(); } catch { return error("Invalid homepage image settings."); }
  if (!body || typeof body.media !== "object" || Array.isArray(body.media)) return error("Provide valid homepage image settings.");

  const media = {};
  for (const key of SLOT_KEYS) {
    const item = body.media[key];
    if (!item || !item.url) continue;
    if (typeof item.url !== "string" || !item.url.startsWith("https://res.cloudinary.com/") ||
        typeof item.publicId !== "string" || !item.publicId.trim()) {
      return error("Homepage images must be valid Cloudinary images.");
    }
    media[key] = {
      url: item.url,
      publicId: item.publicId.trim().slice(0, 250),
      altText: typeof item.altText === "string" ? item.altText.trim().slice(0, 250) : "",
    };
  }

  try {
    await prisma.storeSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: media, description: "Images and placement assignments for the customer homepage." },
      update: { value: media, description: "Images and placement assignments for the customer homepage." },
    });
    await prisma.adminAuditLog.create({
      data: {
        actorId: access.user.id,
        action: "HOMEPAGE_MEDIA_UPDATED",
        entityType: "StoreSetting",
        entityId: KEY,
        metadata: { assignedSlots: Object.keys(media) },
      },
    });
    return Response.json({ success: true, media }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    console.error("Homepage media save failed:", cause);
    return error("Homepage image settings could not be saved.", 500);
  }
}
