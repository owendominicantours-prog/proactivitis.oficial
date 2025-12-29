-- Add productsEnabled flag to supplier profile
ALTER TABLE "SupplierProfile"
ADD COLUMN IF NOT EXISTS "productsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Create table for minisites
CREATE TABLE "SupplierMinisite" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "themeId" INTEGER NOT NULL DEFAULT 1,
    "brandName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "whatsapp" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierMinisite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupplierMinisite_slug_key" ON "SupplierMinisite"("slug");
CREATE UNIQUE INDEX "SupplierMinisite_supplierId_key" ON "SupplierMinisite"("supplierId");

ALTER TABLE "SupplierMinisite"
ADD CONSTRAINT "SupplierMinisite_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
