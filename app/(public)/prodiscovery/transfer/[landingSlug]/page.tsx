import type { Metadata } from "next";
import ProDiscoveryTransferDetailPage from "@/components/public/ProDiscoveryTransferDetailPage";
import { parseTransferHotelVariantSlug } from "@/data/transfer-hotel-sales-variants";
import { allLandings } from "@/data/transfer-landings";
import {
  buildProDiscoveryTransferMetadata,
  buildProDiscoveryTransferNotFoundMetadata
} from "@/lib/prodiscoverySeo";
import { getTransferReviewSummaryForLanding } from "@/lib/transferReviews";
import { es } from "@/lib/translations";

export async function generateMetadata({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}): Promise<Metadata> {
  const { landingSlug } = await params;
  const parsedLandingSlug = parseTransferHotelVariantSlug(landingSlug);
  const landing = allLandings().find((item) => item.landingSlug === parsedLandingSlug.baseSlug);
  if (!landing) return buildProDiscoveryTransferNotFoundMetadata(es);
  const reviewSummary = await getTransferReviewSummaryForLanding(landingSlug);
  return buildProDiscoveryTransferMetadata({
    landingSlug,
    locale: es,
    title: landing.heroTitle,
    description: landing.metaDescription,
    reviewCount: reviewSummary.count,
    reviewAverage: reviewSummary.average
  });
}

export default async function ProDiscoveryTransferPage({
  params,
  searchParams
}: {
  params: Promise<{ landingSlug: string }>;
  searchParams?: Promise<{ kw?: string }>;
}) {
  const { landingSlug } = await params;
  const sp = (await searchParams) ?? {};
  return <ProDiscoveryTransferDetailPage locale={es} landingSlug={landingSlug} reviewKeyword={sp.kw} />;
}
