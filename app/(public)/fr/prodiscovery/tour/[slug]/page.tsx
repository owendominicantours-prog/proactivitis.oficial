import type { Metadata } from "next";
import PublicTourDetailPage, { type TourDetailSearchParams } from "@/components/public/PublicTourDetailPage";
import { prisma } from "@/lib/prisma";
import { fr } from "@/lib/translations";
import { PROACTIVITIS_URL } from "@/lib/seo";

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
  if (!tour) return { title: "ProDiscovery | Tour introuvable" };
  const title = `${tour.title} | ProDiscovery`;
  const description = tour.shortDescription || tour.description.slice(0, 155);
  const canonical = `${PROACTIVITIS_URL}/fr/prodiscovery/tour/${slug}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/tour/${slug}`,
        en: `/en/prodiscovery/tour/${slug}`,
        fr: `/fr/prodiscovery/tour/${slug}`,
        "x-default": `/prodiscovery/tour/${slug}`
      }
    }
  };
}

export default async function ProDiscoveryTourPageFr({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<TourDetailSearchParams>;
}) {
  return <PublicTourDetailPage params={params} searchParams={searchParams} locale={fr} />;
}
