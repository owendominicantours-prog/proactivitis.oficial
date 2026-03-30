import type { Metadata } from "next";
import PublicTourDetailPage, { type TourDetailSearchParams } from "@/components/public/PublicTourDetailPage";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import { prisma } from "@/lib/prisma";
import { buildProDiscoveryTourMetadata, buildProDiscoveryTourNotFoundMetadata } from "@/lib/prodiscoverySeo";
import { en } from "@/lib/translations";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await prisma.tour.findFirst({
    where: { slug, status: { in: ["published", "seo_only"] } },
    select: { title: true, shortDescription: true, description: true }
  });
  if (!tour) return buildProDiscoveryTourNotFoundMetadata(en);
  return buildProDiscoveryTourMetadata({
    slug,
    locale: en,
    title: tour.title,
    shortDescription: tour.shortDescription,
    description: tour.description
  });
}

export default async function ProDiscoveryTourPageEn({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<TourDetailSearchParams>;
}) {
  return (
    <>
      <ProDiscoveryHeader locale={en} />
      <PublicTourDetailPage params={params} searchParams={searchParams} locale={en} presentationMode="discovery" />
    </>
  );
}
