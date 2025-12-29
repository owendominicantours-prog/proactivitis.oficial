-- Create click log for supplier minisites
CREATE TABLE "SupplierMinisiteClick" (
    "id" TEXT NOT NULL,
    "minisiteId" TEXT NOT NULL,
    "tourSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierMinisiteClick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupplierMinisiteClick_minisiteId_idx" ON "SupplierMinisiteClick"("minisiteId");

ALTER TABLE "SupplierMinisiteClick"
ADD CONSTRAINT "SupplierMinisiteClick_minisiteId_fkey"
FOREIGN KEY ("minisiteId") REFERENCES "SupplierMinisite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
