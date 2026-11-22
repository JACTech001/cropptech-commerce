/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumberSnapshot` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `receiptPublicId` on the `PaymentSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUrl` on the `PaymentSubmission` table. All the data in the column will be lost.
  - Added the required column `accountNumberEncrypted` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountNumberSnapshotEncrypted` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "accountNumber",
ADD COLUMN     "accountNumberEncrypted" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "accountNumberSnapshot",
ADD COLUMN     "accountNumberSnapshotEncrypted" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaymentSubmission" DROP COLUMN "receiptPublicId",
DROP COLUMN "receiptUrl",
ADD COLUMN     "receiptStorageKey" TEXT,
ADD COLUMN     "receiptStorageProvider" TEXT;

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "returnRequestId" TEXT;

-- CreateIndex
CREATE INDEX "Refund_returnRequestId_idx" ON "Refund"("returnRequestId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
