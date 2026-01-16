import { prisma } from "@/lib/prisma";

export type TourReviewSummary = {
  average: number;
  count: number;
};

export type ApprovedTourReview = {
  id: string;
  customerName: string;
  rating: number;
  title: string | null;
  body: string;
  locale: string;
  createdAt: Date;
};

export const getApprovedTourReviews = async (tourId: string, limit = 6) => {
  return prisma.tourReview.findMany({
    where: { tourId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      customerName: true,
      rating: true,
      title: true,
      body: true,
      locale: true,
      createdAt: true
    }
  });
};

export const getTourReviewSummary = async (tourId: string): Promise<TourReviewSummary> => {
  const result = await prisma.tourReview.aggregate({
    where: { tourId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true }
  });
  return {
    average: Number(result._avg.rating ?? 0),
    count: result._count.rating ?? 0
  };
};

export const getTourReviewSummaryForTours = async (tourIds: string[]) => {
  if (!tourIds.length) return {} as Record<string, TourReviewSummary>;
  const rows = await prisma.tourReview.groupBy({
    by: ["tourId"],
    where: { tourId: { in: tourIds }, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true }
  });

  return rows.reduce<Record<string, TourReviewSummary>>((acc, row) => {
    acc[row.tourId] = {
      average: Number(row._avg.rating ?? 0),
      count: row._count.rating ?? 0
    };
    return acc;
  }, {});
};

export const buildReviewBreakdown = (reviews: ApprovedTourReview[]) => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
  reviews.forEach((review) => {
    const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
    counts[rating] += 1;
  });
  const total = reviews.length || 1;
  return ([
    { rating: 5, percent: Math.round((counts[5] / total) * 100) },
    { rating: 4, percent: Math.round((counts[4] / total) * 100) },
    { rating: 3, percent: Math.round((counts[3] / total) * 100) },
    { rating: 2, percent: Math.round((counts[2] / total) * 100) },
    { rating: 1, percent: Math.round((counts[1] / total) * 100) }
  ]);
};
