-- CreateType
CREATE TYPE "TransferLocationType" AS ENUM ('HOTEL', 'AIRPORT', 'PLACE');

-- CreateTable
CREATE TABLE "TransferZoneV2" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "countryCode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferZoneV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "TransferLocationType" NOT NULL,
    "zoneId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "heroImage" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferVehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "minPax" INTEGER NOT NULL,
    "maxPax" INTEGER NOT NULL,
    "category" "VehicleCategory" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRoute" (
    "id" TEXT NOT NULL,
    "zoneAId" TEXT NOT NULL,
    "zoneBId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRoutePrice" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferRoutePrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRoutePriceOverride" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "originLocationId" TEXT,
    "destinationLocationId" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferRoutePriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransferZoneV2_slug_key" ON "TransferZoneV2"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TransferLocation_slug_key" ON "TransferLocation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TransferVehicle_slug_key" ON "TransferVehicle"("slug");

-- CreateIndex
CREATE INDEX "TransferRoute_countryCode_idx" ON "TransferRoute"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRoute_zoneAId_zoneBId_key" ON "TransferRoute"("zoneAId", "zoneBId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRoutePrice_routeId_vehicleId_key" ON "TransferRoutePrice"("routeId", "vehicleId");

-- CreateIndex
CREATE INDEX "TransferRoutePriceOverride_originLocationId_idx" ON "TransferRoutePriceOverride"("originLocationId");

-- CreateIndex
CREATE INDEX "TransferRoutePriceOverride_destinationLocationId_idx" ON "TransferRoutePriceOverride"("destinationLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRoutePriceOverride_routeId_vehicleId_originLocation_key" ON "TransferRoutePriceOverride"("routeId", "vehicleId", "originLocationId", "destinationLocationId");

-- AddForeignKey
ALTER TABLE "TransferZoneV2"
    ADD CONSTRAINT "TransferZoneV2_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLocation"
    ADD CONSTRAINT "TransferLocation_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "TransferZoneV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLocation"
    ADD CONSTRAINT "TransferLocation_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoute"
    ADD CONSTRAINT "TransferRoute_zoneAId_fkey" FOREIGN KEY ("zoneAId") REFERENCES "TransferZoneV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoute"
    ADD CONSTRAINT "TransferRoute_zoneBId_fkey" FOREIGN KEY ("zoneBId") REFERENCES "TransferZoneV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoute"
    ADD CONSTRAINT "TransferRoute_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoutePrice"
    ADD CONSTRAINT "TransferRoutePrice_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransferRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoutePrice"
    ADD CONSTRAINT "TransferRoutePrice_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "TransferVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoutePriceOverride"
    ADD CONSTRAINT "TransferRoutePriceOverride_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransferRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoutePriceOverride"
    ADD CONSTRAINT "TransferRoutePriceOverride_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "TransferVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoutePriceOverride"
    ADD CONSTRAINT "TransferRoutePriceOverride_originLocationId_fkey" FOREIGN KEY ("originLocationId") REFERENCES "TransferLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRoutePriceOverride"
    ADD CONSTRAINT "TransferRoutePriceOverride_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "TransferLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
