import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PARTY_BOAT_BASE_TOUR, PARTY_BOAT_VARIANTS } from "@/data/party-boat-variants";
import PartyBoatVariantLanding from "@/components/public/PartyBoatVariantLanding";
import { es } from "@/lib/translations";

export async function generateStaticParams() {
  return PARTY_BOAT_VARIANTS.map((variant) => ({ variantSlug: variant.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ variantSlug: string }> }): Promise<Metadata> {
  const resolved = await params;
  const variant = PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  if (!variant) {
    return { title: "Landing no encontrada" };
  }
  const title = variant.titles.es;
  const description = variant.metaDescriptions.es;
  const canonical = `https://proactivitis.com/thingtodo/tours/${variant.slug}`;
  const languages = {
    es: canonical,
    en: `https://proactivitis.com/en/thingtodo/tours/${variant.slug}`,
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
      locale={es}
      variant={variant}
      tour={tour}
      transferHotels={transferHotels}
    />
  );
}
