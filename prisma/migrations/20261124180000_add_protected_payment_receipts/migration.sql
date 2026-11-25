CREATE UNIQUE INDEX "Payment_id_orderId_key" ON "Payment"("id", "orderId");

CREATE INDEX "InventoryTransaction_adjustedById_createdAt_idx" ON "InventoryTransaction"("adjustedById", "createdAt");
CREATE INDEX "Order_customerAddressId_idx" ON "Order"("customerAddressId");
CREATE INDEX "Order_shippingRateId_idx" ON "Order"("shippingRateId");
CREATE INDEX "PaymentSubmission_submittedById_submittedAt_idx" ON "PaymentSubmission"("submittedById", "submittedAt");
CREATE INDEX "Refund_reviewedById_reviewedAt_idx" ON "Refund"("reviewedById", "reviewedAt");
CREATE INDEX "ReturnItem_orderItemId_idx" ON "ReturnItem"("orderItemId");
CREATE INDEX "ReturnRequest_reviewedById_reviewedAt_idx" ON "ReturnRequest"("reviewedById", "reviewedAt");
CREATE INDEX "StockReservation_createdById_createdAt_idx" ON "StockReservation"("createdById", "createdAt");

CREATE TABLE "PaymentReceipt" (
  "id" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "receiptData" JSONB NOT NULL,
  "snapshotHash" VARCHAR(64) NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentReceipt_receiptNumber_key" ON "PaymentReceipt"("receiptNumber");
CREATE UNIQUE INDEX "PaymentReceipt_paymentId_key" ON "PaymentReceipt"("paymentId");
CREATE UNIQUE INDEX "PaymentReceipt_orderId_key" ON "PaymentReceipt"("orderId");
CREATE INDEX "PaymentReceipt_issuedAt_idx" ON "PaymentReceipt"("issuedAt");

ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_paymentId_orderId_fkey" FOREIGN KEY ("paymentId", "orderId") REFERENCES "Payment"("id", "orderId") ON DELETE RESTRICT ON UPDATE CASCADE;