#!/usr/bin/env ts-node

import { prisma } from "@/lib/prisma";
import { translateTourById } from "@/lib/translationWorker";

async function translateTour(tourId: string) {
  console.log(`translating ${tourId}`);
  await translateTourById(tourId);
}

async function main() {
  const [tourId] = process.argv.slice(2);
  if (tourId) {
    await translateTour(tourId);
    return;
  }

  const tours = await prisma.tour.findMany({
    where: { status: "published" }
  });

  for (const tour of tours) {
    try {
      await translateTour(tour.id);
    } catch (error) {
      console.error("translation failed for", tour.id, error);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
