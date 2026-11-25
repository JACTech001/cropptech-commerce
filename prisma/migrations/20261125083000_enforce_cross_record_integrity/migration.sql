-- Indexes supporting foreign-key lookups and parent-row maintenance.
CREATE UNIQUE INDEX "Payment_id_orderId_key" ON "Payment"("id", "orderId");
CREATE UNIQUE INDEX "CustomerAddress_id_userId_key" ON "CustomerAddress"("id", "userId");

CREATE INDEX "InventoryTransaction_adjustedById_createdAt_idx" ON "InventoryTransaction"("adjustedById", "createdAt");
CREATE INDEX "Order_customerAddressId_idx" ON "Order"("customerAddressId");
CREATE INDEX "Order_shippingRateId_idx" ON "Order"("shippingRateId");
CREATE INDEX "PaymentSubmission_submittedById_submittedAt_idx" ON "PaymentSubmission"("submittedById", "submittedAt");
CREATE INDEX "Refund_reviewedById_reviewedAt_idx" ON "Refund"("reviewedById", "reviewedAt");
CREATE INDEX "ReturnItem_orderItemId_idx" ON "ReturnItem"("orderItemId");
CREATE INDEX "ReturnRequest_reviewedById_reviewedAt_idx" ON "ReturnRequest"("reviewedById", "reviewedAt");
CREATE INDEX "StockReservation_createdById_createdAt_idx" ON "StockReservation"("createdById", "createdAt");

-- A receipt must reference the payment and that payment’s own order.
ALTER TABLE "PaymentReceipt" DROP CONSTRAINT "PaymentReceipt_paymentId_fkey";
ALTER TABLE "PaymentReceipt" DROP CONSTRAINT "PaymentReceipt_orderId_fkey";
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_paymentId_orderId_fkey" FOREIGN KEY ("paymentId", "orderId") REFERENCES "Payment"("id", "orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- An order may only use an address belonging to its customer.
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerAddressId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerAddressId_customerId_fkey" FOREIGN KEY ("customerAddressId", "customerId") REFERENCES "CustomerAddress"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;