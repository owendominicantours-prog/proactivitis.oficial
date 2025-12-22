import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
const tourEmptyResult = await prisma.tour.updateMany({
  where: { countryId: "" },
  data: { countryId: "RD" }
});
const tourNullResult = await prisma.$executeRawUnsafe(
  `UPDATE "Tour" SET "countryId" = 'RD' WHERE "countryId" IS NULL`
);
const locationEmptyResult = await prisma.location.updateMany({
  where: { countryId: "" },
  data: { countryId: "RD" }
});
const locationNullResult = await prisma.$executeRawUnsafe(
  `UPDATE "Location" SET "countryId" = 'RD' WHERE "countryId" IS NULL`
);
console.log(`Tours actualizados (cadena vacía): ${tourEmptyResult.count}`);
console.log(`Tours actualizados (null): ${tourNullResult}`);
console.log(`Locations actualizados (cadena vacía): ${locationEmptyResult.count}`);
console.log(`Locations actualizados (null): ${locationNullResult}`);
}

main()
  .catch((error) => {
    console.error("backfill tour country failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
