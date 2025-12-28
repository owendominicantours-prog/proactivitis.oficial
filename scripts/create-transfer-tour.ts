import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const TRANSFER_SLUG = "transfer-privado-proactivitis";

async function main() {
  const supplierEmail = process.env.TRANSFER_SUPPLIER_EMAIL ?? "info@proactivitis.com";

  const user = await prisma.user.upsert({
    where: { email: supplierEmail },
    update: { name: "Proactivitis Transfers" },
    create: {
      id: randomUUID(),
      email: supplierEmail,
      name: "Proactivitis Transfers",
      password: randomUUID()
    }
  });

  const supplier = await prisma.supplierProfile.upsert({
    where: { userId: user.id },
    update: {
      company: "Proactivitis Transfers",
      stripeAccountId: process.env.TRANSFER_SUPPLIER_STRIPE_ACCOUNT ?? undefined
    },
    create: {
      id: randomUUID(),
      userId: user.id,
      company: "Proactivitis Transfers",
      approved: true,
      stripeAccountId: process.env.TRANSFER_SUPPLIER_STRIPE_ACCOUNT ?? undefined
    }
  });

  const transferTour = await prisma.tour.upsert({
    where: { slug: TRANSFER_SLUG },
    update: {
      title: "Transfer privado Proactivitis",
      price: Number(process.env.TRANSFER_TOUR_PRICE ?? 120),
      description:
        "Tour ficticio usado para procesar pagos de transfers privados desde proactivitis.com.",
      language: "Español / Inglés",
      includes: "Chofer, vehículo, atención 24/7",
      location: "Punta Cana",
      status: "published",
      featured: false,
      supplierId: supplier.id
    },
    create: {
      id: randomUUID(),
      title: "Transfer privado Proactivitis",
      slug: TRANSFER_SLUG,
      productId: randomUUID(),
      price: Number(process.env.TRANSFER_TOUR_PRICE ?? 120),
      duration: "Variable (depende de la ruta)",
      description:
        "Tour ficticio usado para procesar pagos de transfers privados desde proactivitis.com.",
      language: "Español / Inglés",
      includes: "Chofer, vehículo, atención 24/7",
      location: "Punta Cana",
      supplierId: supplier.id,
      status: "published",
      featured: false
    }
  });

  console.log("Transfer tour ready:", transferTour.id);
  console.log("Use this ID for TRANSFER_TOUR_ID / NEXT_PUBLIC_TRANSFER_TOUR_ID");
}

main()
  .catch((error) => {
    console.error("Failed to create transfer tour", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
