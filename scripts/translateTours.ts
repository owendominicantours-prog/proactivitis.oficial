#!/usr/bin/env ts-node

import { prisma } from "../lib/prisma";
import { translateTourById } from "../lib/translationWorker";

type TourStatus = "published" | "seo_only" | "all";

async function translateTour(tourId: string) {
  console.log(`translating ${tourId}`);
  await translateTourById(tourId);
}

async function main() {
  const args = process.argv.slice(2);
  const tourIdArg = args.find((arg) => !arg.startsWith("--"));
  const statusArg = args.find((arg) => arg.startsWith("--status="));
  const status = (statusArg?.split("=")[1] as TourStatus | undefined) ?? "all";

  if (tourIdArg) {
    const tourId = tourIdArg;
    await translateTour(tourId);
    return;
  }

  const whereStatus =
    status === "published"
      ? { status: "published" as const }
      : status === "seo_only"
        ? { status: "seo_only" as const }
        : { status: { in: ["published", "seo_only"] } };

  const tours = await prisma.tour.findMany({
    where: whereStatus
  });

  console.log(`translation batch status=${status} tours=${tours.length}`);

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
