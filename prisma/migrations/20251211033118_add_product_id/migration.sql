/*
  Warnings:

  - The required column `productId` was added to the `Tour` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateTable
CREATE TABLE "PartnerApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactRole" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "serviceTypes" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "documentName" TEXT,
    "documentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "PartnerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "priceChild" REAL,
    "priceYouth" REAL,
    "duration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subtitle" TEXT,
    "shortDescription" TEXT,
    "category" TEXT,
    "physicalLevel" TEXT,
    "minAge" INTEGER,
    "accessibility" TEXT,
    "confirmationType" TEXT,
    "timeOptions" TEXT,
    "operatingDays" TEXT,
    "blackoutDates" TEXT,
    "capacity" INTEGER,
    "meetingPoint" TEXT,
    "meetingInstructions" TEXT,
    "pickup" TEXT,
    "requirements" TEXT,
    "cancellationPolicy" TEXT,
    "terms" TEXT,
    "language" TEXT NOT NULL,
    "includes" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gallery" TEXT,
    "heroImage" TEXT,
    "departureDestinationId" TEXT,
    "platformSharePercent" INTEGER NOT NULL DEFAULT 20,
    CONSTRAINT "Tour_departureDestinationId_fkey" FOREIGN KEY ("departureDestinationId") REFERENCES "Destination" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tour_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tour" ("accessibility", "adminNote", "blackoutDates", "cancellationPolicy", "capacity", "category", "confirmationType", "createdAt", "departureDestinationId", "description", "duration", "featured", "gallery", "heroImage", "id", "includes", "language", "location", "meetingInstructions", "meetingPoint", "minAge", "operatingDays", "physicalLevel", "pickup", "platformSharePercent", "price", "priceChild", "priceYouth", "requirements", "shortDescription", "slug", "status", "subtitle", "supplierId", "terms", "timeOptions", "title") SELECT "accessibility", "adminNote", "blackoutDates", "cancellationPolicy", "capacity", "category", "confirmationType", "createdAt", "departureDestinationId", "description", "duration", "featured", "gallery", "heroImage", "id", "includes", "language", "location", "meetingInstructions", "meetingPoint", "minAge", "operatingDays", "physicalLevel", "pickup", "platformSharePercent", "price", "priceChild", "priceYouth", "requirements", "shortDescription", "slug", "status", "subtitle", "supplierId", "terms", "timeOptions", "title" FROM "Tour";
DROP TABLE "Tour";
ALTER TABLE "new_Tour" RENAME TO "Tour";
CREATE UNIQUE INDEX "Tour_slug_key" ON "Tour"("slug");
CREATE UNIQUE INDEX "Tour_productId_key" ON "Tour"("productId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "supplierApproved" BOOLEAN NOT NULL DEFAULT false,
    "agencyApproved" BOOLEAN NOT NULL DEFAULT false,
    "accountStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "statusMessage" TEXT,
    "rejectionAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "supplierApproved") SELECT "createdAt", "email", "id", "name", "password", "role", "supplierApproved" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
