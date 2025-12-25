ALTER TYPE "VehicleCategory" ADD VALUE IF NOT EXISTS 'VIP';
ALTER TYPE "VehicleCategory" ADD VALUE IF NOT EXISTS 'BUS';

CREATE TABLE "TransferOrigin" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransferOrigin_code_unique" ON "TransferOrigin" ("code");
CREATE UNIQUE INDEX "TransferOrigin_slug_unique" ON "TransferOrigin" ("slug");

ALTER TABLE "TransferZone"
  ADD COLUMN "originId" TEXT;

CREATE TABLE "TransferDestination" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "heroImage" TEXT,
  "zoneId" TEXT NOT NULL,
  "originId" TEXT,
  "pricingOverrides" JSONB,
  "locationSlug" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransferDestination_slug_unique" ON "TransferDestination" ("slug");
CREATE INDEX "TransferDestination_zoneId_index" ON "TransferDestination" ("zoneId");

ALTER TABLE "TransferZone"
  ADD CONSTRAINT "TransferZone_originId_fkey" FOREIGN KEY ("originId") REFERENCES "TransferOrigin" ("id") ON DELETE SET NULL;

ALTER TABLE "TransferDestination"
  ADD CONSTRAINT "TransferDestination_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "TransferZone" ("id") ON DELETE CASCADE;

ALTER TABLE "TransferDestination"
  ADD CONSTRAINT "TransferDestination_originId_fkey" FOREIGN KEY ("originId") REFERENCES "TransferOrigin" ("id") ON DELETE SET NULL;
