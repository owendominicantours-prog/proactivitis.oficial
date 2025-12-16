const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@proactivitis.com" },
    update: {
      name: "Admin Proactivitis",
      password: passwordHash,
      role: "ADMIN",
      accountStatus: "APPROVED",
      supplierApproved: true,
      agencyApproved: true
    },
    create: {
      email: "admin@proactivitis.com",
      name: "Admin Proactivitis",
      password: passwordHash,
      role: "ADMIN",
      accountStatus: "APPROVED",
      supplierApproved: true,
      agencyApproved: true
    }
  });
  console.log("Admin account is ready: admin@proactivitis.com / Admin123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
