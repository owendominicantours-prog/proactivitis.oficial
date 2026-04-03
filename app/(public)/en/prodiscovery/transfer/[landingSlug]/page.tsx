import type { Metadata } from "next";
import ProDiscoveryTransferDetailPage from "@/components/public/ProDiscoveryTransferDetailPage";
import { allLandings } from "@/data/transfer-landings";
import {
  buildProDiscoveryTransferMetadata,
  buildProDiscoveryTransferNotFoundMetadata
} from "@/lib/prodiscoverySeo";
import { getTransferReviewSummaryForLanding } from "@/lib/transferReviews";
import { en } from "@/lib/translations";

export async function generateMetadata({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}): Promise<Metadata> {
  const { landingSlug } = await params;
  const landing = allLandings().find((item) => item.landingSlug === landingSlug);
  if (!landing) return buildProDiscoveryTransferNotFoundMetadata(en);
  const reviewSummary = await getTransferReviewSummaryForLanding(landingSlug);
  return buildProDiscoveryTransferMetadata({
    landingSlug,
    locale: en,
    title: landing.heroTitle,
    description: landing.metaDescription,
    reviewCount: reviewSummary.count,
    reviewAverage: reviewSummary.average
  });
}

export default async function ProDiscoveryTransferPageEn({
  params,
  searchParams
}: {
  params: Promise<{ landingSlug: string }>;
  searchParams?: Promise<{ kw?: string }>;
}) {
  const { landingSlug } = await params;
  const sp = (await searchParams) ?? {};
  return <ProDiscoveryTransferDetailPage locale={en} landingSlug={landingSlug} reviewKeyword={sp.kw} />;
}
