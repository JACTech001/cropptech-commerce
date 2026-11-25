CREATE TYPE "SupportTicketCategory" AS ENUM (
  'GENERAL',
  'ORDER_ISSUE',
  'PAYMENT',
  'DELIVERY',
  'RETURN_REFUND',
  'PRODUCT_QUESTION',
  'ACCOUNT',
  'OTHER'
);

CREATE TYPE "SupportTicketStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'CLOSED'
);

CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "SupportMessageSender" AS ENUM ('CUSTOMER', 'STAFF');

CREATE TABLE "CustomerSupportTicket" (
  "id" TEXT NOT NULL,
  "ticketNumber" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "orderId" TEXT,
  "assignedToId" TEXT,
  "category" "SupportTicketCategory" NOT NULL DEFAULT 'GENERAL',
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "SupportTicketPriority" NOT NULL DEFAULT 'NORMAL',
  "subject" TEXT NOT NULL,
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerSupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicketMessage" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderRole" "SupportMessageSender" NOT NULL,
  "body" TEXT NOT NULL,
  "isInternal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportTicketMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerSupportTicket_ticketNumber_key" ON "CustomerSupportTicket"("ticketNumber");
CREATE INDEX "CustomerSupportTicket_customerId_updatedAt_idx" ON "CustomerSupportTicket"("customerId", "updatedAt");
CREATE INDEX "CustomerSupportTicket_status_priority_lastMessageAt_idx" ON "CustomerSupportTicket"("status", "priority", "lastMessageAt");
CREATE INDEX "CustomerSupportTicket_assignedToId_status_lastMessageAt_idx" ON "CustomerSupportTicket"("assignedToId", "status", "lastMessageAt");
CREATE INDEX "CustomerSupportTicket_orderId_customerId_idx" ON "CustomerSupportTicket"("orderId", "customerId");
CREATE INDEX "SupportTicketMessage_ticketId_createdAt_idx" ON "SupportTicketMessage"("ticketId", "createdAt");
CREATE INDEX "SupportTicketMessage_senderId_createdAt_idx" ON "SupportTicketMessage"("senderId", "createdAt");

ALTER TABLE "CustomerSupportTicket"
  ADD CONSTRAINT "CustomerSupportTicket_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CustomerSupportTicket_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "CustomerSupportTicket_orderId_customerId_fkey"
  FOREIGN KEY ("orderId", "customerId") REFERENCES "Order"("id", "customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SupportTicketMessage"
  ADD CONSTRAINT "SupportTicketMessage_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "CustomerSupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "SupportTicketMessage_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
