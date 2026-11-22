import { v2 as cloudinary } from "cloudinary";
import { requireAppRole } from "../../../../../../lib/auth/user";
import { prisma } from "../../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return Response.json({ error: "You are not authorized to view payment receipts." }, { status: access.status });

  const { submissionId } = await params;
  const submission = await prisma.paymentSubmission.findUnique({
    where: { id: submissionId },
    select: { receiptStorageProvider: true, receiptStorageKey: true },
  });
  if (!submission?.receiptStorageKey || submission.receiptStorageProvider !== "cloudinary") {
    return Response.json({ error: "Receipt not found." }, { status: 404 });
  }

  const [resourceType, format, ...publicIdParts] = submission.receiptStorageKey.split(":");
  const publicId = publicIdParts.join(":");
  if (!["image", "raw"].includes(resourceType) || !format || !publicId) {
    return Response.json({ error: "Receipt reference is invalid." }, { status: 404 });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const url = cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 300,
    attachment: true,
  });
  return Response.redirect(url, 302);
}
