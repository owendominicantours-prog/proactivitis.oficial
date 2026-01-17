ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "tourOptionId" TEXT,
ADD COLUMN IF NOT EXISTS "tourOptionName" TEXT,
ADD COLUMN IF NOT EXISTS "tourOptionType" TEXT,
ADD COLUMN IF NOT EXISTS "tourOptionPrice" DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS "TourOption" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "pricePerPerson" DOUBLE PRECISION,
    "basePrice" DOUBLE PRECISION,
    "baseCapacity" INTEGER,
    "extraPricePerPerson" DOUBLE PRECISION,
    "pickupTimes" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourOption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TourOption_tourId_idx" ON "TourOption"("tourId");

ALTER TABLE "TourOption"
ADD CONSTRAINT "TourOption_tourId_fkey"
FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_tourOptionId_fkey"
FOREIGN KEY ("tourOptionId") REFERENCES "TourOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
