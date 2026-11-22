/*
  Warnings:

  - A unique constraint covering the columns `[bankName,transactionReference]` on the table `PaymentSubmission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountNameSnapshot` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountNumberSnapshot` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankNameSnapshot` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PaymentSubmission_bankName_transactionReference_idx";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "accountNameSnapshot" TEXT NOT NULL,
ADD COLUMN     "accountNumberSnapshot" TEXT NOT NULL,
ADD COLUMN     "bankNameSnapshot" TEXT NOT NULL,
ADD COLUMN     "paymentInstructionsSnapshot" TEXT;

-- CreateIndex
CREATE INDEX "OrderStatusHistory_changedById_createdAt_idx" ON "OrderStatusHistory"("changedById", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_bankAccountId_idx" ON "Payment"("bankAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSubmission_bankName_transactionReference_key" ON "PaymentSubmission"("bankName", "transactionReference");

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
