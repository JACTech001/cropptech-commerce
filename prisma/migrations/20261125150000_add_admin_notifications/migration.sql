CREATE TABLE "AdminNotification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminNotification_userId_eventKey_key"
  ON "AdminNotification"("userId", "eventKey");
CREATE INDEX "AdminNotification_userId_readAt_createdAt_idx"
  ON "AdminNotification"("userId", "readAt", "createdAt");
CREATE INDEX "AdminNotification_createdAt_idx"
  ON "AdminNotification"("createdAt");

ALTER TABLE "AdminNotification"
  ADD CONSTRAINT "AdminNotification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
