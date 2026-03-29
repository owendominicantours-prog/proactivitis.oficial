-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "agencyTransferLinkId" TEXT;

-- CreateTable
CREATE TABLE "AgencyTransferLink" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "agencyUserId" TEXT NOT NULL,
    "originLocationId" TEXT NOT NULL,
    "destinationLocationId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "passengers" INTEGER NOT NULL,
    "tripType" TEXT NOT NULL DEFAULT 'one-way',
    "price" DOUBLE PRECISION NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyTransferLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgencyTransferLink_slug_key" ON "AgencyTransferLink"("slug");

-- CreateIndex
CREATE INDEX "AgencyTransferLink_agencyUserId_active_idx" ON "AgencyTransferLink"("agencyUserId", "active");

-- CreateIndex
CREATE INDEX "AgencyTransferLink_originLocationId_destinationLocationId_idx" ON "AgencyTransferLink"("originLocationId", "destinationLocationId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_agencyTransferLinkId_fkey"
FOREIGN KEY ("agencyTransferLinkId") REFERENCES "AgencyTransferLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyTransferLink" ADD CONSTRAINT "AgencyTransferLink_agencyUserId_fkey"
FOREIGN KEY ("agencyUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyTransferLink" ADD CONSTRAINT "AgencyTransferLink_originLocationId_fkey"
FOREIGN KEY ("originLocationId") REFERENCES "TransferLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyTransferLink" ADD CONSTRAINT "AgencyTransferLink_destinationLocationId_fkey"
FOREIGN KEY ("destinationLocationId") REFERENCES "TransferLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyTransferLink" ADD CONSTRAINT "AgencyTransferLink_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "TransferVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
