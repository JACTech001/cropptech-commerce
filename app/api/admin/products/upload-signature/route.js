import { v2 as cloudinary } from "cloudinary";
import { requireAppRole } from "../../../../../lib/auth/user";

function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return jsonError("You are not authorised to upload catalogue images.", access.status);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return jsonError("Cloudinary upload is not configured on this environment. Add the Cloudinary credentials to the server environment first.", 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "cropptech store linen";
  const allowed_formats = "jpg,jpeg,png,webp,avif";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder, allowed_formats }, apiSecret);

  return Response.json({ cloudName, apiKey, timestamp, folder, allowed_formats, signature }, {
    headers: { "Cache-Control": "no-store" },
  });
}
