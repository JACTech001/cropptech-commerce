CREATE INDEX "Order_customerAddressId_customerId_idx" ON "Order"("customerAddressId", "customerId");
CREATE INDEX "Payment_orderId_customerId_idx" ON "Payment"("orderId", "customerId");
CREATE INDEX "PaymentReceipt_paymentId_orderId_idx" ON "PaymentReceipt"("paymentId", "orderId");