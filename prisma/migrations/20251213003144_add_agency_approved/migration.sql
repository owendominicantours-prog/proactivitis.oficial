/*
  Warnings:

  - You are about to drop the `EmailConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "EmailConfiguration_type_key";

-- DropIndex
DROP INDEX "EmailContact_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmailConfiguration";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmailContact";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmailLog";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AgencyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AgencyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AgencyProfile" ("companyName", "id", "userId") SELECT "companyName", "id", "userId" FROM "AgencyProfile";
DROP TABLE "AgencyProfile";
ALTER TABLE "new_AgencyProfile" RENAME TO "AgencyProfile";
CREATE UNIQUE INDEX "AgencyProfile_userId_key" ON "AgencyProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
