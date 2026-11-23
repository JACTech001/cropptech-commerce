-- Add a separate garment type so gender collection and clothing category are not conflated.
ALTER TABLE "Product"
ADD COLUMN "productType" TEXT NOT NULL DEFAULT 'OTHER';

CREATE INDEX "Product_status_productType_idx"
ON "Product"("status", "productType");
