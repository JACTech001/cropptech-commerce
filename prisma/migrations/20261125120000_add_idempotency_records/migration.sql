CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" VARCHAR(64) NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IdempotencyRecord_customerId_scope_key_key"
ON "IdempotencyRecord"("customerId", "scope", "key");
CREATE INDEX "IdempotencyRecord_customerId_createdAt_idx"
ON "IdempotencyRecord"("customerId", "createdAt");
CREATE INDEX "IdempotencyRecord_scope_createdAt_idx"
ON "IdempotencyRecord"("scope", "createdAt");
ALTER TABLE "IdempotencyRecord"
ADD CONSTRAINT "IdempotencyRecord_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
