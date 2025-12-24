import { prisma } from "@/lib/prisma";

export const TOUR_DETAIL_VARIANTS = ["party", "family", "cruise"] as const;
export type TourDetailVariant = (typeof TOUR_DETAIL_VARIANTS)[number];

export async function ensureTourVariants(tourId: string) {
  await Promise.all(
    TOUR_DETAIL_VARIANTS.map((variant) =>
      prisma.tourVariant.upsert({
        where: {
          tourId_variant: {
            tourId,
            variant
          }
        },
        update: {},
        create: {
          tourId,
          variant
        }
      })
    )
  );
}
