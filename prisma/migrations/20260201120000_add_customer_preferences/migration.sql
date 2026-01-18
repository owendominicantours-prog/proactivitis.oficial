-- Add discount fields to bookings
ALTER TABLE "Booking" ADD COLUMN "discountPercent" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "discountAmount" DOUBLE PRECISION;

-- Create customer preferences table
CREATE TABLE "CustomerPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredCountries" JSONB,
    "preferredDestinations" JSONB,
    "preferredProductTypes" JSONB,
    "discountEligible" BOOLEAN NOT NULL DEFAULT false,
    "discountGrantedAt" TIMESTAMP(3),
    "discountRedeemedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerPreference_userId_key" ON "CustomerPreference"("userId");

ALTER TABLE "CustomerPreference"
ADD CONSTRAINT "CustomerPreference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
