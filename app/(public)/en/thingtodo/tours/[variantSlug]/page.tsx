import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PARTY_BOAT_BASE_TOUR, PARTY_BOAT_VARIANTS } from "@/data/party-boat-variants";
import { SANTO_DOMINGO_BASE_TOUR, SANTO_DOMINGO_VARIANTS } from "@/data/santo-domingo-variants";
import { BUGGY_ATV_BASE_TOUR, BUGGY_ATV_VARIANTS } from "@/data/buggy-atv-variants";
import { PARASAILING_BASE_TOUR, PARASAILING_VARIANTS } from "@/data/parasailing-variants";
import { SAMANA_WHALE_BASE_TOUR, SAMANA_WHALE_VARIANTS } from "@/data/samana-whale-variants";
import PartyBoatVariantLanding from "@/components/public/PartyBoatVariantLanding";
import SantoDomingoVariantLanding from "@/components/public/SantoDomingoVariantLanding";
import BuggyAtvVariantLanding from "@/components/public/BuggyAtvVariantLanding";
import ParasailingVariantLanding from "@/components/public/ParasailingVariantLanding";
import SamanaWhaleVariantLanding from "@/components/public/SamanaWhaleVariantLanding";
import { en } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveTourImage = (heroImage?: string | null, gallery?: string | null) => {
  if (heroImage) return heroImage;
  const parsed = parseGallery(gallery);
  return parsed[0] ?? null;
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${BASE_URL}${normalized}`;
};

const buildKeywords = (title: string, description: string) => {
  const base = [
    "Punta Cana",
    "Dominican Republic",
    "Punta Cana tours",
    "Punta Cana excursions",
    "Proactivitis"
  ];
  return Array.from(new Set([title, description, ...base]));
};

const OG_LOCALE = {
  es: "es_DO",
  en: "en_US",
  fr: "fr_FR"
} as const;

export async function generateStaticParams() {
  return [
    ...PARTY_BOAT_VARIANTS,
    ...SANTO_DOMINGO_VARIANTS,
    ...BUGGY_ATV_VARIANTS,
    ...PARASAILING_VARIANTS,
    ...SAMANA_WHALE_VARIANTS
  ].map((variant) => ({
    variantSlug: variant.slug
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ variantSlug: string }> }): Promise<Metadata> {
  const resolved = await params;
  const partyVariant = PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const santoVariant = SANTO_DOMINGO_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const buggyVariant = BUGGY_ATV_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const parasailingVariant = PARASAILING_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const samanaVariant = SAMANA_WHALE_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const variant = partyVariant ?? santoVariant ?? buggyVariant ?? parasailingVariant ?? samanaVariant;
  if (!variant) {
    return { title: "Landing not found" };
  }
  const title = variant.titles.en;
  const description = variant.metaDescriptions.en.trim();
  const seoTitle = `${title} | Proactivitis`;
  const seoDescription = description.endsWith(".") ? description : `${description}.`;
  const canonical = `https://proactivitis.com/en/thingtodo/tours/${variant.slug}`;
  const tourSlug = partyVariant
    ? PARTY_BOAT_BASE_TOUR.slug
    : santoVariant
      ? SANTO_DOMINGO_BASE_TOUR.slug
      : buggyVariant
        ? BUGGY_ATV_BASE_TOUR.slug
        : parasailingVariant
          ? PARASAILING_BASE_TOUR.slug
          : SAMANA_WHALE_BASE_TOUR.slug;
  const tour = await prisma.tour.findUnique({
    where: { slug: tourSlug },
    select: { heroImage: true, gallery: true }
  });
  const imageUrl = toAbsoluteUrl(resolveTourImage(tour?.heroImage ?? null, tour?.gallery ?? null));
  const languages = {
    es: `https://proactivitis.com/thingtodo/tours/${variant.slug}`,
    en: canonical,
    fr: `https://proactivitis.com/fr/thingtodo/tours/${variant.slug}`
  };
  return {
    title: seoTitle,
    description: seoDescription,
    keywords: buildKeywords(title, seoDescription),
    alternates: { canonical, languages },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: OG_LOCALE.en,
      images: imageUrl ? [{ url: imageUrl }] : undefined
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: seoTitle,
      description: seoDescription,
      images: imageUrl ? [imageUrl] : undefined
    }
  };
}

export default async function PartyBoatVariantPage({ params }: { params: Promise<{ variantSlug: string }> }) {
  const resolved = await params;
  const partyVariant = PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const santoVariant = SANTO_DOMINGO_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const buggyVariant = BUGGY_ATV_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const parasailingVariant = PARASAILING_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  const samanaVariant = SAMANA_WHALE_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  if (!partyVariant && !santoVariant && !buggyVariant && !parasailingVariant && !samanaVariant) {
    return notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: {
      slug: partyVariant
        ? PARTY_BOAT_BASE_TOUR.slug
        : santoVariant
          ? SANTO_DOMINGO_BASE_TOUR.slug
          : buggyVariant
            ? BUGGY_ATV_BASE_TOUR.slug
            : parasailingVariant
              ? PARASAILING_BASE_TOUR.slug
              : SAMANA_WHALE_BASE_TOUR.slug
    },
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
        locale={en}
        variant={partyVariant}
        tour={tour}
        transferHotels={transferHotels}
      />
    );
  }

  if (santoVariant) {
    return (
      <SantoDomingoVariantLanding
        locale={en}
        variant={santoVariant}
        tour={tour}
        transferHotels={transferHotels}
      />
    );
  }

  if (buggyVariant) {
    return (
      <BuggyAtvVariantLanding
        locale={en}
        variant={buggyVariant}
        tour={tour}
        transferHotels={transferHotels}
      />
    );
  }

  if (parasailingVariant) {
    return (
      <ParasailingVariantLanding
        locale={en}
        variant={parasailingVariant}
        tour={tour}
        transferHotels={transferHotels}
      />
    );
  }

  return (
    <SamanaWhaleVariantLanding
      locale={en}
      variant={samanaVariant!}
      tour={tour}
      transferHotels={transferHotels}
    />
  );
}
