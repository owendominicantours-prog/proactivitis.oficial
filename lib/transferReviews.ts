import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseTransferHotelVariantSlug } from "@/data/transfer-hotel-sales-variants";

export type TransferReviewSummary = {
  average: number;
  count: number;
};

export const buildTransferReviewWhereForLanding = (landingSlug: string): Prisma.TransferReviewWhereInput => {
  const baseSlug = parseTransferHotelVariantSlug(landingSlug).baseSlug;
  return {
    status: "APPROVED",
    OR: [
      { transferLandingSlug: baseSlug },
      { transferLandingSlug: { startsWith: `${baseSlug}--` } }
    ]
  };
};

export const getApprovedTransferReviewsForLanding = async (landingSlug: string, limit = 28) =>
  prisma.transferReview.findMany({
    where: buildTransferReviewWhereForLanding(landingSlug),
    orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
    take: limit
  });

export const getTransferReviewSummaryForLanding = async (landingSlug: string): Promise<TransferReviewSummary> => {
  const result = await prisma.transferReview.aggregate({
    where: buildTransferReviewWhereForLanding(landingSlug),
    _avg: { rating: true },
    _count: { rating: true }
  });

  return {
    average: Number(result._avg.rating ?? 0),
    count: result._count.rating ?? 0
  };
};
