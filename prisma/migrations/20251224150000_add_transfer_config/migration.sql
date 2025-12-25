CREATE TYPE "VehicleCategory" AS ENUM ('SEDAN','VAN','SUV');

CREATE TABLE "TransferZone" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "description" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransferZone_slug_unique" ON "TransferZone" ("slug");
CREATE INDEX "TransferZone_countryCode_index" ON "TransferZone" ("countryCode");

CREATE UNIQUE INDEX "Country_code_key" ON "Country" ("code");

ALTER TABLE "TransferZone"
  ADD CONSTRAINT "TransferZone_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country" ("code") ON DELETE CASCADE;

CREATE TABLE "TransferRate" (
  "id" TEXT NOT NULL,
  "originZoneId" TEXT NOT NULL,
  "destinationZoneId" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "vehicleCategory" "VehicleCategory" NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransferRate_unique_origin_destination_vehicle" ON "TransferRate" ("originZoneId","destinationZoneId","vehicleCategory");
CREATE INDEX "TransferRate_countryCode_index" ON "TransferRate" ("countryCode");

ALTER TABLE "TransferRate"
  ADD CONSTRAINT "TransferRate_originZoneId_fkey" FOREIGN KEY ("originZoneId") REFERENCES "TransferZone" ("id") ON DELETE CASCADE;
ALTER TABLE "TransferRate"
  ADD CONSTRAINT "TransferRate_destinationZoneId_fkey" FOREIGN KEY ("destinationZoneId") REFERENCES "TransferZone" ("id") ON DELETE CASCADE;
ALTER TABLE "TransferRate"
  ADD CONSTRAINT "TransferRate_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country" ("code") ON DELETE CASCADE;
