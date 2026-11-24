import { v2 as cloudinary } from "cloudinary";
import { Prisma } from "@prisma/client";
import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

export const runtime = "nodejs";

function error(message, status) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function uploadReceipt(buffer, resourceType) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: "cropptech/payment-receipts",
      resource_type: resourceType,
      type: "authenticated",
      unique_filename: true,
      overwrite: false,
    }, (uploadError, result) => uploadError ? reject(uploadError) : resolve(result));
    stream.end(buffer);
  });
}

export async function POST(request, { params }) {
  const access = await requireAppRole(["CUSTOMER"]);
  if (access.status !== 200) return error("Sign in to submit payment details.", access.status);

  const { orderNumber } = await params;
  const form = await request.formData();
  const accountNameUsed = String(form.get("accountName") || "").trim().slice(0, 120);
  const amountRaw = String(form.get("amountTransferred") || "").trim();
  const bankName = String(form.get("bankName") || "").trim().slice(0, 120);
  const transactionReference = String(form.get("transactionReference") || "").trim().slice(0, 120);
  const customerNote = String(form.get("customerNote") || "").trim().slice(0, 1000);
  const receipt = form.get("receipt");

  if (!accountNameUsed || !bankName || !transactionReference || !/^(?:\d+)(?:\.\d{1,2})?$/.test(amountRaw) || Number(amountRaw) <= 0) {
    return error("Complete the account name, amount, bank and transaction reference.", 400);
  }
  if (!receipt || typeof receipt.arrayBuffer !== "function" || receipt.size < 1 || receipt.size > 5 * 1024 * 1024) {
    return error("Upload a receipt image or PDF no larger than 5 MB.", 400);
  }
  const mime = receipt.type;
  const resourceType = mime === "application/pdf" ? "raw" : "image";
  const allowed = resourceType === "raw"
    ? ["application/pdf"]
    : ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(mime)) return error("Receipt must be a PDF, JPG, PNG or WEBP file.", 400);

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return error("Receipt upload is not configured yet. Please contact the store before submitting payment.", 503);
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerId: access.user.id },
    include: { payment: true },
  });
  if (!order?.payment) return error("We could not find this order in your account.", 404);
  if (["CANCELLED", "EXPIRED", "DELIVERED"].includes(order.status) || order.paymentStatus === "PAID") {
    return error("Payment submissions are not available for this order.", 409);
  }

  const existingPending = await prisma.paymentSubmission.findFirst({
    where: { paymentId: order.payment.id, status: "PENDING" },
    select: { id: true },
  });
  if (existingPending) return error("Your previous payment submission is still awaiting review. Please wait for the store's response.", 409);

  let uploaded;
  try {
    const buffer = Buffer.from(await receipt.arrayBuffer());
    uploaded = await uploadReceipt(buffer, resourceType);
  } catch (uploadError) {
    console.error("Receipt upload failed:", uploadError);
    return error("We could not upload your receipt. Please check the file and try again.", 502);
  }

  try {
    const amountTransferred = new Prisma.Decimal(amountRaw);
    await prisma.$transaction(async (tx) => {
      const pending = await tx.paymentSubmission.findFirst({ where: { paymentId: order.payment.id, status: "PENDING" }, select: { id: true } });
      if (pending) throw new Error("PAYMENT_ALREADY_PENDING");
      await tx.paymentSubmission.create({
        data: {
          paymentId: order.payment.id,
          submittedById: access.user.id,
          accountNameUsed,
          amountTransferred,
          bankName,
          transactionReference,
          receiptStorageProvider: "cloudinary",
          receiptStorageKey: `${resourceType}:${uploaded.format || (resourceType === "raw" ? "pdf" : "jpg")}:${uploaded.public_id}`,
          customerNote: customerNote || null,
          status: "PENDING",
        },
      });
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "SUBMITTED" },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAYMENT_UNDER_REVIEW", paymentStatus: "SUBMITTED" },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "PAYMENT_UNDER_REVIEW",
          note: "Customer submitted bank-transfer details for review.",
        },
      });
      await tx.customerNotification.create({
        data: {
          userId: access.user.id,
          channel: "IN_APP",
          subject: "Payment submitted",
          message: `Your transfer details for order ${order.orderNumber} have been received. The store will verify the payment before processing your order.`,
          status: "QUEUED",
        },
      });
    }, { isolationLevel: "Serializable" });
    return Response.json({ message: "Your payment details and receipt have been submitted. We will update your order after verification." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (submitError) {
    try {
      await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: resourceType, type: "authenticated" });
    } catch {}
    if (submitError?.message === "PAYMENT_ALREADY_PENDING" || submitError?.code === "P2034") return error("A payment submission is already being processed for this order. Refresh the page and check its status.", 409);
    if (submitError?.code === "P2002") return error("This bank transaction reference has already been submitted. Check the reference and try again.", 409);
    console.error("Payment submission failed:", submitError);
    return error("We could not save your payment submission. Please try again.", 500);
  }
}
