import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { decryptBankAccountNumber } from "../../../lib/security/bank-account-encryption";
import { requireAppRole } from "../../../lib/auth/user";
import { prisma } from "../../../lib/db";

const text = (value, max = 250) => typeof value === "string" ? value.trim().slice(0, max) : "";

function jsonError(message, status) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const access = await requireAppRole(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return jsonError(access.status === 401 ? "Sign in to place your order." : "Your account cannot place orders.", access.status);

  let body;
  try { body = await request.json(); } catch { return jsonError("Please check the checkout form and try again.", 400); }

  if (!body || typeof body !== "object" || Array.isArray(body)) return jsonError("Invalid checkout details.", 400);

  const recipientName = text(body.recipientName, 120);
  const recipientPhone = text(body.recipientPhone, 40);
  const state = text(body.state, 100);
  const city = text(body.city, 100);
  const locality = text(body.locality, 120);
  const deliveryAddress = text(body.deliveryAddress, 500);
  const deliveryLandmark = text(body.deliveryLandmark, 250);
  const customerNote = text(body.customerNote, 1000);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!recipientName || !recipientPhone || !/^[+0-9()\\s-]{8,24}$/.test(recipientPhone) || !state || !city || !deliveryAddress) {
    return jsonError("Complete your name, phone number and Nigerian delivery address.", 400);
  }
  if (text(body.country, 40).toLowerCase() !== "nigeria") return jsonError("We currently deliver within Nigeria only.", 400);
  if (!items.length || items.length > 20) return jsonError("Your order must contain between 1 and 20 different items.", 400);

  const normalizedItems = [];
  for (const item of items) {
    const slug = text(item?.slug, 160);
    const size = text(item?.size, 30);
    const colour = text(item?.colour, 60);
    const quantity = Number(item?.quantity);
    if (!slug || !size || !colour || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return jsonError("One or more cart items have invalid size, colour or quantity. Return to your cart and review them.", 400);
    }
    normalizedItems.push({ slug, size, colour, quantity });
  }

  if (!process.env.BANK_ACCOUNT_ENCRYPTION_KEY) {
    return jsonError("Online order placement is temporarily unavailable while payment settings are being configured. Please try again later.", 503);
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const matchingLocations = await tx.shippingZoneLocation.findMany({
        where: {
          state: { equals: state, mode: "insensitive" },
          OR: [{ city: { equals: city, mode: "insensitive" } }, { city: null }],
        },
        include: { zone: { include: { rates: { where: { isActive: true } } } } },
      });
      const rates = matchingLocations.filter((location) => location.zone.isActive)
        .flatMap((location) => location.zone.rates);
      const uniqueRates = [...new Map(rates.map((rate) => [rate.id, rate])).values()];
      if (uniqueRates.length !== 1) {
        throw new Error(uniqueRates.length === 0 ? "DELIVERY_NOT_CONFIGURED" : "DELIVERY_RATE_AMBIGUOUS");
      }
      const shippingRate = uniqueRates[0];

      const bankAccounts = await tx.bankAccount.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
      if (bankAccounts.length !== 1) throw new Error(bankAccounts.length === 0 ? "PAYMENT_ACCOUNT_NOT_CONFIGURED" : "PAYMENT_ACCOUNT_AMBIGUOUS");
      const bankAccount = bankAccounts[0];
      let accountNumber;
      try { accountNumber = decryptBankAccountNumber(bankAccount.accountNumberEncrypted); }
      catch { throw new Error("BANK_ACCOUNT_ENCRYPTION_INVALID"); }

      const products = await tx.product.findMany({
        where: { slug: { in: [...new Set(normalizedItems.map((item) => item.slug))] }, status: "ACTIVE" },
        include: { variants: { where: { isActive: true } } },
      });

      const resolved = normalizedItems.map((item) => {
        const product = products.find((entry) => entry.slug === item.slug);
        if (!product) throw new Error("PRODUCT_UNAVAILABLE");
        const variant = product.variants.find((entry) =>
          entry.size.toLowerCase() === item.size.toLowerCase() &&
          entry.colour.toLowerCase() === item.colour.toLowerCase()
        );
        if (!variant) throw new Error("VARIANT_UNAVAILABLE");
        return { product, variant, quantity: item.quantity };
      });

      const orderNumber = `CTS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(4).toString("hex").toUpperCase()}`;
      let subtotal = new Prisma.Decimal(0);
      const orderItems = [];
      for (const line of resolved) {
        const updated = await tx.productVariant.updateMany({
          where: { id: line.variant.id, isActive: true, stockQuantity: { gte: line.quantity } },
          data: { stockQuantity: { decrement: line.quantity } },
        });
        if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
        const unitPrice = line.variant.price;
        const lineTotal = unitPrice.mul(line.quantity);
        subtotal = subtotal.add(lineTotal);
        orderItems.push({
          productId: line.product.id,
          variantId: line.variant.id,
          productName: line.product.name,
          productSlug: line.product.slug,
          sku: line.variant.sku,
          size: line.variant.size,
          colour: line.variant.colour,
          quantity: line.quantity,
          unitPrice,
          lineTotal,
        });
      }

      const total = subtotal.add(shippingRate.fee);
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: access.user.id,
          status: "AWAITING_PAYMENT",
          paymentStatus: "UNPAID",
          currency: "NGN",
          subtotal,
          shippingFee: shippingRate.fee,
          discountTotal: 0,
          total,
          recipientName,
          recipientPhone,
          deliveryState: state,
          deliveryCity: city,
          deliveryLocality: locality || null,
          deliveryAddress,
          deliveryLandmark: deliveryLandmark || null,
          customerNote: customerNote || null,
          items: { create: orderItems },
          statusHistory: { create: { fromStatus: null, toStatus: "AWAITING_PAYMENT", note: "Order placed by customer." } },
          payment: {
            create: {
              status: "UNPAID",
              amountDue: total,
              amountPaid: 0,
              currency: "NGN",
              bankNameSnapshot: bankAccount.bankName,
              accountNameSnapshot: bankAccount.accountName,
              accountNumberSnapshotEncrypted: bankAccount.accountNumberEncrypted,
              paymentInstructionsSnapshot: bankAccount.instructions,
              bankAccountId: bankAccount.id,
            },
          },
          reservations: {
            create: resolved.map((line) => ({ variantId: line.variant.id, quantity: line.quantity, status: "ACTIVE" })),
          },
        },
        include: { items: true, payment: true },
      });

      await tx.inventoryTransaction.createMany({
        data: resolved.map((line) => ({
          variantId: line.variant.id,
          type: "RESERVED",
          quantity: line.quantity,
          reason: "Stock reserved for order " + orderNumber,
          reference: order.id,
        })),
      });

      return { order, accountNumber };
    });

    return Response.json({
      order: {
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        paymentStatus: result.order.paymentStatus,
        subtotal: result.order.subtotal.toString(),
        shippingFee: result.order.shippingFee.toString(),
        total: result.order.total.toString(),
        currency: result.order.currency,
        items: result.order.items.map((item) => ({
          name: item.productName, size: item.size, colour: item.colour,
          quantity: item.quantity, lineTotal: item.lineTotal.toString(),
        })),
      },

    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const known = {
      DELIVERY_NOT_CONFIGURED: [409, "Delivery is not yet configured for this location. Please contact the store before placing your order."],
      DELIVERY_RATE_AMBIGUOUS: [409, "The delivery rate for this location needs store review. Please contact the store."],
      PAYMENT_ACCOUNT_NOT_CONFIGURED: [503, "The store has not configured a payment account yet. Please try again later."],
      PAYMENT_ACCOUNT_AMBIGUOUS: [503, "The store payment settings need review. Please try again later."],
      BANK_ACCOUNT_ENCRYPTION_INVALID: [503, "The store payment account is not configured correctly. Please contact the store."],
      PRODUCT_UNAVAILABLE: [409, "One of the selected products is not currently available. Please return to the shop and refresh your cart."],
      VARIANT_UNAVAILABLE: [409, "One of the selected sizes or colours is not currently available. Please update your cart."],
      INSUFFICIENT_STOCK: [409, "There is not enough stock for one of the selected items. Please reduce the quantity or contact the store."],
    };
    const mapped = known[error?.message];
    if (mapped) return jsonError(mapped[1], mapped[0]);
    console.error("Order creation failed:", error);
    return jsonError("We could not place your order. Your cart has not been cleared. Please try again.", 500);
  }
}
