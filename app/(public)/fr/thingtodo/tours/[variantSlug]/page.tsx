import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PARTY_BOAT_BASE_TOUR, PARTY_BOAT_VARIANTS } from "@/data/party-boat-variants";
import { SANTO_DOMINGO_BASE_TOUR, SANTO_DOMINGO_VARIANTS } from "@/data/santo-domingo-variants";
import PartyBoatVariantLanding from "@/components/public/PartyBoatVariantLanding";
import SantoDomingoVariantLanding from "@/components/public/SantoDomingoVariantLanding";
import { fr } from "@/lib/translations";

export async function generateStaticParams() {
  return [...PARTY_BOAT_VARIANTS, ...SANTO_DOMINGO_VARIANTS].map((variant) => ({
    variantSlug: variant.slug
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ variantSlug: string }> }): Promise<Metadata> {
  const resolved = await params;
  const partyVariant = PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const santoVariant = SANTO_DOMINGO_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const variant = partyVariant ?? santoVariant;
  if (!variant) {
    return { title: "Landing introuvable" };
  }
  const title = variant.titles.fr;
  const description = variant.metaDescriptions.fr;
  const canonical = `https://proactivitis.com/fr/thingtodo/tours/${variant.slug}`;
  const languages = {
    es: `https://proactivitis.com/thingtodo/tours/${variant.slug}`,
    en: `https://proactivitis.com/en/thingtodo/tours/${variant.slug}`,
    fr: canonical
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
  const partyVariant = PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const santoVariant = SANTO_DOMINGO_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  if (!partyVariant && !santoVariant) {
    return notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: { slug: partyVariant ? PARTY_BOAT_BASE_TOUR.slug : SANTO_DOMINGO_BASE_TOUR.slug },
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

  if (partyVariant) {
    return (
      <PartyBoatVariantLanding
        locale={fr}
        variant={partyVariant}
        tour={tour}
        transferHotels={transferHotels}
      />
    );
  }

  return (
    <SantoDomingoVariantLanding
      locale={fr}
      variant={santoVariant!}
      tour={tour}
      transferHotels={transferHotels}
    />
  );
}
