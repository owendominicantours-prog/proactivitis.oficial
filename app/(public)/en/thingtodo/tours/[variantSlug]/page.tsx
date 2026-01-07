import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PARTY_BOAT_BASE_TOUR, PARTY_BOAT_VARIANTS } from "@/data/party-boat-variants";
import PartyBoatVariantLanding from "@/components/public/PartyBoatVariantLanding";
import { en } from "@/lib/translations";

export async function generateStaticParams() {
  return PARTY_BOAT_VARIANTS.map((variant) => ({ variantSlug: variant.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ variantSlug: string }> }): Promise<Metadata> {
  const resolved = await params;
  const variant = PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  if (!variant) {
    return { title: "Landing not found" };
  }
  const title = variant.titles.en;
  const description = variant.metaDescriptions.en;
  const canonical = `https://proactivitis.com/en/thingtodo/tours/${variant.slug}`;
  const languages = {
    es: `https://proactivitis.com/thingtodo/tours/${variant.slug}`,
    en: canonical,
    fr: `https://proactivitis.com/fr/thingtodo/tours/${variant.slug}`
  };
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical
    }
  };
}

export default async function PartyBoatVariantPage({ params }: { params: Promise<{ variantSlug: string }> }) {
  const resolved = await params;
  const variant = PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  if (!variant) {
    return notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: { slug: PARTY_BOAT_BASE_TOUR.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      heroImage: true,
      gallery: true,
      timeOptions: true,
      platformSharePercent: true,
      SupplierProfile: { select: { stripeAccountId: true, company: true } }
    }
  });

  if (!tour) {
    return notFound();
  }

  const transferHotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true, name: true, heroImage: true, zone: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 5
  });

  return (
    <PartyBoatVariantLanding
      locale={en}
      variant={variant}
      tour={tour}
      transferHotels={transferHotels}
    />
  );
}
