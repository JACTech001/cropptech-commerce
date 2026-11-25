-- Prisma requires composite unique keys for the one-to-one relations declared in the schema.
CREATE UNIQUE INDEX "Payment_orderId_customerId_key" ON "Payment"("orderId", "customerId");
CREATE UNIQUE INDEX "Refund_paymentId_orderId_key" ON "Refund"("paymentId", "orderId");
