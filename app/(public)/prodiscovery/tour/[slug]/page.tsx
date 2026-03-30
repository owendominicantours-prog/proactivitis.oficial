import type { Metadata } from "next";
import PublicTourDetailPage, { type TourDetailSearchParams } from "@/components/public/PublicTourDetailPage";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import { prisma } from "@/lib/prisma";
import { buildProDiscoveryTourMetadata, buildProDiscoveryTourNotFoundMetadata } from "@/lib/prodiscoverySeo";
import { es } from "@/lib/translations";

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
  if (!tour) return buildProDiscoveryTourNotFoundMetadata(es);
  return buildProDiscoveryTourMetadata({
    slug,
    locale: es,
    title: tour.title,
    shortDescription: tour.shortDescription,
    description: tour.description
  });
}

export default async function ProDiscoveryTourPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<TourDetailSearchParams>;
}) {
  return (
    <>
      <ProDiscoveryHeader locale={es} />
      <PublicTourDetailPage params={params} searchParams={searchParams} locale={es} />
    </>
  );
}
