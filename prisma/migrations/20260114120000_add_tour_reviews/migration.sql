CREATE TABLE "TourReview" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "TourReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TourReview_bookingId_key" ON "TourReview"("bookingId");
CREATE INDEX "TourReview_tourId_idx" ON "TourReview"("tourId");
CREATE INDEX "TourReview_status_idx" ON "TourReview"("status");

ALTER TABLE "TourReview" ADD CONSTRAINT "TourReview_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TourReview" ADD CONSTRAINT "TourReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TourReview" ADD CONSTRAINT "TourReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
