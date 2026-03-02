-- Add supplier ownership + discount fields to offers
ALTER TABLE "Offer"
ADD COLUMN "supplierId" TEXT,
ADD COLUMN "discountType" TEXT NOT NULL DEFAULT 'PERCENT',
ADD COLUMN "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill supplierId from the linked tour
UPDATE "Offer" o
SET "supplierId" = t."supplierId"
FROM "Tour" t
WHERE o."tourId" = t."id";

-- Enforce NOT NULL after backfill
ALTER TABLE "Offer"
ALTER COLUMN "supplierId" SET NOT NULL;

-- Create relation table for multiple selected tours per offer
CREATE TABLE "OfferTour" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfferTour_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OfferTour_offerId_tourId_key" ON "OfferTour"("offerId", "tourId");
CREATE INDEX "OfferTour_tourId_idx" ON "OfferTour"("tourId");

-- Migrate existing one-tour offers into OfferTour
INSERT INTO "OfferTour" ("id", "offerId", "tourId")
SELECT md5(random()::text || clock_timestamp()::text || "id"), "id", "tourId"
FROM "Offer";

ALTER TABLE "Offer"
ADD CONSTRAINT "Offer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OfferTour"
ADD CONSTRAINT "OfferTour_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OfferTour"
ADD CONSTRAINT "OfferTour_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
