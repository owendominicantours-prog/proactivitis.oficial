ALTER TABLE "Booking"
ADD COLUMN "tripType" TEXT DEFAULT 'one-way',
ADD COLUMN "returnTravelDate" TIMESTAMP(3),
ADD COLUMN "returnStartTime" TEXT;
