import { prisma } from "@/lib/prisma";

export type PublicOfferPrice = {
  offerId: string;
  title: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  finalPrice: number;
};

const clampPrice = (value: number) => (value < 0 ? 0 : Number(value.toFixed(2)));

const computeFinalPrice = (
  basePrice: number,
  discountType: "PERCENT" | "AMOUNT",
  discountValue: number
) => {
  if (discountType === "PERCENT") {
    return clampPrice(basePrice * (1 - discountValue / 100));
  }
  return clampPrice(basePrice - discountValue);
};

export async function getActiveOfferPriceMapForTours(
  tours: Array<{ id: string; price: number }>
): Promise<Map<string, PublicOfferPrice>> {
  if (!tours.length) return new Map();
  const tourIds = tours.map((tour) => tour.id);
  const baseById = new Map(tours.map((tour) => [tour.id, tour.price]));

  const offers = await prisma.offer.findMany({
    where: {
      active: true,
      OR: [{ tourId: { in: tourIds } }, { OfferTours: { some: { tourId: { in: tourIds } } } }]
    },
    select: {
      id: true,
      title: true,
      discountType: true,
      discountValue: true,
      tourId: true,
      OfferTours: {
        select: { tourId: true }
      }
    }
  });

  const map = new Map<string, PublicOfferPrice>();

  for (const offer of offers) {
    const linkedTourIds = new Set<string>([offer.tourId, ...offer.OfferTours.map((item) => item.tourId)]);
    for (const tourId of linkedTourIds) {
      const basePrice = baseById.get(tourId);
      if (typeof basePrice !== "number") continue;
      const discountType = offer.discountType === "AMOUNT" ? "AMOUNT" : "PERCENT";
      const finalPrice = computeFinalPrice(basePrice, discountType, offer.discountValue);
      if (finalPrice >= basePrice) continue;

      const current = map.get(tourId);
      if (!current || finalPrice < current.finalPrice) {
        map.set(tourId, {
          offerId: offer.id,
          title: offer.title,
          discountType,
          discountValue: offer.discountValue,
          finalPrice
        });
      }
    }
  }

  return map;
}

