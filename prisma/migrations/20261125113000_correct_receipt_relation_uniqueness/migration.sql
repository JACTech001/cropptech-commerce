-- A payment can have multiple refunds, so do not make this pair unique.
DROP INDEX "Refund_paymentId_orderId_key";
-- A payment can have at most one official receipt, and the receipt must match its payment/order pair.
CREATE UNIQUE INDEX "PaymentReceipt_paymentId_orderId_key" ON "PaymentReceipt"("paymentId", "orderId");
