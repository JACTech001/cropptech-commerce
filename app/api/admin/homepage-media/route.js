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
    if (key === "hero_main" && item.desktopUrl &&
        (typeof item.desktopUrl !== "string" || !item.desktopUrl.startsWith("https://res.cloudinary.com/") ||
         typeof item.desktopPublicId !== "string" || !item.desktopPublicId.trim())) {
      return error("The desktop hero image must be a valid Cloudinary image.");
    }
    media[key] = {
      url: item.url,
      publicId: item.publicId.trim().slice(0, 250),
      altText: typeof item.altText === "string" ? item.altText.trim().slice(0, 250) : "",
      width: Number.isFinite(Number(item.width)) ? Math.max(0, Math.min(20000, Math.round(Number(item.width)))) : 0,
      height: Number.isFinite(Number(item.height)) ? Math.max(0, Math.min(20000, Math.round(Number(item.height)))) : 0,
      ...(key === "hero_main" ? {
        positionDesktop: ["left top", "center top", "right top", "left center", "center center", "right center", "left bottom", "center bottom", "right bottom"].includes(item.positionDesktop) ? item.positionDesktop : "center center",
        positionMobile: ["left top", "center top", "right top", "left center", "center center", "right center", "left bottom", "center bottom", "right bottom", "58% center"].includes(item.positionMobile) ? item.positionMobile : "58% center",
        ...(item.desktopUrl ? {
          desktopUrl: item.desktopUrl,
          desktopPublicId: item.desktopPublicId.trim().slice(0, 250),
          desktopWidth: Number.isFinite(Number(item.desktopWidth)) ? Math.max(0, Math.min(20000, Math.round(Number(item.desktopWidth)))) : 1600,
          desktopHeight: Number.isFinite(Number(item.desktopHeight)) ? Math.max(0, Math.min(20000, Math.round(Number(item.desktopHeight)))) : 900,
        } : {}),
      } : {}),
    };
  }

  const rawSlides = Array.isArray(body.media.hero_slides) ? body.media.hero_slides.slice(0, 8) : [];
  if (Array.isArray(body.media.hero_slides) && body.media.hero_slides.length > 8) return error("You can add up to 8 additional hero slides.");
  const validPositions = ["left top", "center top", "right top", "left center", "center center", "right center", "left bottom", "center bottom", "right bottom", "58% center"];
  const slides = [];
  for (const item of rawSlides) {
    if (!item || !item.url) continue;
    if (typeof item.url !== "string" || !item.url.startsWith("https://res.cloudinary.com/") ||
        typeof item.publicId !== "string" || !item.publicId.trim()) {
      return error("Every additional hero slide must use a valid Cloudinary image.");
    }
    if (item.desktopUrl && (typeof item.desktopUrl !== "string" || !item.desktopUrl.startsWith("https://res.cloudinary.com/") ||
        typeof item.desktopPublicId !== "string" || !item.desktopPublicId.trim())) {
      return error("A desktop hero image must be a valid Cloudinary image.");
    }
    slides.push({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim().slice(0, 80) : `hero-slide-${slides.length + 1}`,
      url: item.url,
      publicId: item.publicId.trim().slice(0, 250),
      desktopUrl: item.desktopUrl || "",
      desktopPublicId: item.desktopUrl ? item.desktopPublicId.trim().slice(0, 250) : "",
      altText: typeof item.altText === "string" ? item.altText.trim().slice(0, 250) : "",
      width: Number.isFinite(Number(item.width)) ? Math.max(0, Math.min(20000, Math.round(Number(item.width)))) : 0,
      height: Number.isFinite(Number(item.height)) ? Math.max(0, Math.min(20000, Math.round(Number(item.height)))) : 0,
      desktopWidth: Number.isFinite(Number(item.desktopWidth)) ? Math.max(0, Math.min(20000, Math.round(Number(item.desktopWidth)))) : 0,
      desktopHeight: Number.isFinite(Number(item.desktopHeight)) ? Math.max(0, Math.min(20000, Math.round(Number(item.desktopHeight)))) : 0,
      active: item.active !== false,
    });
  }
  if (slides.length) media.hero_slides = slides;

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
