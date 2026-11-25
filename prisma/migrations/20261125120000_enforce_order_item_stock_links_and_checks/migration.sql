-- Make sure an order line variant belongs to the same product recorded on that line.
CREATE UNIQUE INDEX "ProductVariant_id_productId_key" ON "ProductVariant"(id, "productId");
CREATE INDEX "OrderItem_variantId_productId_idx" ON "OrderItem"("variantId", "productId");
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_productId_fkey" FOREIGN KEY ("variantId", "productId") REFERENCES "ProductVariant"(id, "productId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variant_requires_product_check" CHECK ("variantId" IS NULL OR "productId" IS NOT NULL);

-- A stock reservation must be for an actual line on the same order and its exact variant.
CREATE UNIQUE INDEX "OrderItem_id_orderId_variantId_key" ON "OrderItem"(id, "orderId", "variantId");
ALTER TABLE "StockReservation" ADD COLUMN "orderItemId" TEXT;
UPDATE "StockReservation" sr SET "orderItemId" = (
  SELECT oi.id FROM "OrderItem" oi
  WHERE oi."orderId" = sr."orderId" AND oi."variantId" = sr."variantId"
  ORDER BY oi."createdAt", oi.id LIMIT 1
);
ALTER TABLE "StockReservation" ALTER COLUMN "orderItemId" SET NOT NULL;
CREATE INDEX "StockReservation_orderItemId_orderId_variantId_idx" ON "StockReservation"("orderItemId", "orderId", "variantId");
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_orderItemId_orderId_variantId_fkey" FOREIGN KEY ("orderItemId", "orderId", "variantId") REFERENCES "OrderItem"(id, "orderId", "variantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove non-unique indexes duplicated by the new composite unique indexes.
DROP INDEX "Order_customerAddressId_idx";
DROP INDEX "Payment_orderId_customerId_idx";
DROP INDEX "PaymentReceipt_paymentId_orderId_idx";

-- Prevent invalid quantities and monetary values from entering the database.
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_price_positive_check" CHECK (price > 0);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stock_nonnegative_check" CHECK ("stockQuantity" >= 0);
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_quantity_positive_check" CHECK (quantity > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_quantity_positive_check" CHECK (quantity > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_unitPrice_positive_check" CHECK ("unitPrice" > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_lineTotal_consistent_check" CHECK ("lineTotal" = "unitPrice" * quantity);
ALTER TABLE "Order" ADD CONSTRAINT "Order_amounts_nonnegative_check" CHECK (subtotal >= 0 AND "shippingFee" >= 0 AND "discountTotal" >= 0 AND "discountTotal" <= subtotal AND total >= 0);
ALTER TABLE "Order" ADD CONSTRAINT "Order_total_consistent_check" CHECK (total = subtotal + "shippingFee" - "discountTotal");
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amounts_valid_check" CHECK ("amountDue" > 0 AND "amountPaid" >= 0 AND "amountPaid" <= "amountDue");
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_amount_positive_check" CHECK ("amountTransferred" > 0);
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_quantity_positive_check" CHECK (quantity > 0);
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_quantity_positive_check" CHECK (quantity > 0);
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_amount_positive_check" CHECK (amount > 0);
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_fee_nonnegative_check" CHECK (fee >= 0);
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_estimated_days_valid_check" CHECK (("estimatedMinDays" IS NULL OR "estimatedMinDays" >= 0) AND ("estimatedMaxDays" IS NULL OR "estimatedMaxDays" >= 0) AND ("estimatedMinDays" IS NULL OR "estimatedMaxDays" IS NULL OR "estimatedMinDays" <= "estimatedMaxDays"));
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_snapshotHash_format_check" CHECK ("snapshotHash" ~ '^[0-9a-f]{64}$');
