-- Derive payment ownership from the order, then enforce it as a composite foreign key.
ALTER TABLE "Payment" ADD COLUMN "customerId" TEXT;
UPDATE "Payment" p SET "customerId" = o."customerId" FROM "Order" o WHERE o.id = p."orderId";
ALTER TABLE "Payment" ALTER COLUMN "customerId" SET NOT NULL;
CREATE UNIQUE INDEX "Order_id_customerId_key" ON "Order"(id, "customerId");
CREATE UNIQUE INDEX "Payment_id_customerId_key" ON "Payment"(id, "customerId");
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_customerId_fkey" FOREIGN KEY ("orderId", "customerId") REFERENCES "Order"(id, "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A payment submission must be made by the customer who owns its payment.
ALTER TABLE "PaymentSubmission" DROP CONSTRAINT "PaymentSubmission_paymentId_fkey";
ALTER TABLE "PaymentSubmission" ADD CONSTRAINT "PaymentSubmission_paymentId_submittedById_fkey" FOREIGN KEY ("paymentId", "submittedById") REFERENCES "Payment"(id, "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Store the payment order on refunds so return-linked refunds cannot cross orders.
ALTER TABLE "Refund" ADD COLUMN "orderId" TEXT;
UPDATE "Refund" r SET "orderId" = p."orderId" FROM "Payment" p WHERE p.id = r."paymentId";
ALTER TABLE "Refund" ALTER COLUMN "orderId" SET NOT NULL;
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_paymentId_fkey";
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_returnRequestId_fkey";
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_orderId_fkey" FOREIGN KEY ("paymentId", "orderId") REFERENCES "Payment"(id, "orderId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_returnRequestId_orderId_fkey" FOREIGN KEY ("returnRequestId", "orderId") REFERENCES "ReturnRequest"(id, "orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A returned item must belong to the same order as its return request.
CREATE UNIQUE INDEX "OrderItem_id_orderId_key" ON "OrderItem"(id, "orderId");
CREATE UNIQUE INDEX "ReturnRequest_id_orderId_key" ON "ReturnRequest"(id, "orderId");
ALTER TABLE "ReturnItem" ADD COLUMN "orderId" TEXT;
UPDATE "ReturnItem" ri SET "orderId" = rr."orderId" FROM "ReturnRequest" rr WHERE rr.id = ri."returnRequestId";
ALTER TABLE "ReturnItem" ALTER COLUMN "orderId" SET NOT NULL;
ALTER TABLE "ReturnItem" DROP CONSTRAINT "ReturnItem_returnRequestId_fkey";
ALTER TABLE "ReturnItem" DROP CONSTRAINT "ReturnItem_orderItemId_fkey";
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnRequestId_orderId_fkey" FOREIGN KEY ("returnRequestId", "orderId") REFERENCES "ReturnRequest"(id, "orderId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_orderItemId_orderId_fkey" FOREIGN KEY ("orderItemId", "orderId") REFERENCES "OrderItem"(id, "orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Index the composite foreign-key paths.
CREATE INDEX "PaymentSubmission_paymentId_submittedById_idx" ON "PaymentSubmission"("paymentId", "submittedById");
CREATE INDEX "Refund_paymentId_orderId_idx" ON "Refund"("paymentId", "orderId");
CREATE INDEX "Refund_returnRequestId_orderId_idx" ON "Refund"("returnRequestId", "orderId");
CREATE INDEX "ReturnItem_returnRequestId_orderId_idx" ON "ReturnItem"("returnRequestId", "orderId");
CREATE INDEX "ReturnItem_orderItemId_orderId_idx" ON "ReturnItem"("orderItemId", "orderId");