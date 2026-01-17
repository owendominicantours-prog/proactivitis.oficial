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
import { es } from "@/lib/translations";
import { findStaticVariant } from "@/lib/tourVariantCatalog";
import { getPublishedVariantBySlug } from "@/lib/tourVariantStore";

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

const normalizePickupTimes = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const times = value.filter((item): item is string => typeof item === "string");
  return times.length ? times : null;
};

const buildKeywords = (title: string, description: string) => {
  const base = ["Punta Cana", "Republica Dominicana", "tours en Punta Cana", "excursiones Punta Cana", "actividades Punta Cana", "tours con recogida en hotel", "Proactivitis"];
  return Array.from(new Set([title, description, ...base]));
};

const OG_LOCALE = {
  es: "es_DO",
  en: "en_US",
  fr: "fr_FR"
} as const;

export async function generateStaticParams() {
  const staticSlugs = [
    ...PARTY_BOAT_VARIANTS,
    ...SANTO_DOMINGO_VARIANTS,
    ...BUGGY_ATV_VARIANTS,
    ...PARASAILING_VARIANTS,
    ...SAMANA_WHALE_VARIANTS
  ].map((variant) => variant.slug);
  const dbSlugs = await prisma.tourVariant
    .findMany({ where: { status: "PUBLISHED" }, select: { slug: true } })
    .then((rows) => rows.map((row) => row.slug))
    .catch(() => []);
  return Array.from(new Set([...staticSlugs, ...dbSlugs])).map((slug) => ({ variantSlug: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ variantSlug: string }> }): Promise<Metadata> {
  const resolved = await params;
  const dbVariant = await getPublishedVariantBySlug(resolved.variantSlug);
  const staticVariant = findStaticVariant(resolved.variantSlug);
  const variant = dbVariant ?? staticVariant;
  if (!variant) {
    return { title: "Landing no encontrada" };
  }
  const title = variant.titles.es;
  const description = variant.metaDescriptions.es.trim();
  const seoTitle = `${title} | Proactivitis`;
  const seoDescription = description.endsWith(".") ? description : `${description}.`;
  const canonical = `https://proactivitis.com/thingtodo/tours/${variant.slug}`;
  const tourSlug = dbVariant?.tourSlug ?? variant.tourSlug ?? PARTY_BOAT_BASE_TOUR.slug;
  const tour = await prisma.tour.findUnique({
    where: { slug: tourSlug },
    select: { heroImage: true, gallery: true }
  });
  const imageUrl = toAbsoluteUrl(resolveTourImage(tour?.heroImage ?? null, tour?.gallery ?? null));
  const languages = {
    es: canonical,
    en: `https://proactivitis.com/en/thingtodo/tours/${variant.slug}`,
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
      locale: OG_LOCALE.es,
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
  const dbVariant = await getPublishedVariantBySlug(resolved.variantSlug);
  const staticVariant = findStaticVariant(resolved.variantSlug);
  const variant = dbVariant ?? staticVariant;
  if (!variant) {
    return notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: {
      slug: dbVariant?.tourSlug ?? variant.tourSlug ?? PARTY_BOAT_BASE_TOUR.slug
    },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      heroImage: true,
      gallery: true,
      timeOptions: true,
      options: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          pricePerPerson: true,
          basePrice: true,
          baseCapacity: true,
          extraPricePerPerson: true,
          pickupTimes: true,
          isDefault: true,
          active: true
        }
      },
      platformSharePercent: true,
      SupplierProfile: { select: { stripeAccountId: true, company: true } }
    }
  });

  if (!tour) {
    return notFound();
  }

  const normalizedTour = {
    ...tour,
    options: tour.options?.map((option) => ({
      ...option,
      pickupTimes: normalizePickupTimes(option.pickupTimes)
    }))
  };

  const transferHotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true, name: true, heroImage: true, zone: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 5
  });

  if (variant.type === "party-boat") {
    return (
      <PartyBoatVariantLanding
        locale={es}
        variant={variant}
        tour={normalizedTour}
        transferHotels={transferHotels}
      />
    );
  }

  if (variant.type === "santo-domingo") {
    return (
      <SantoDomingoVariantLanding
        locale={es}
        variant={variant}
        tour={normalizedTour}
        transferHotels={transferHotels}
      />
    );
  }

  if (variant.type === "buggy-atv") {
    return (
      <BuggyAtvVariantLanding
        locale={es}
        variant={variant}
        tour={normalizedTour}
        transferHotels={transferHotels}
      />
    );
  }

  if (variant.type === "parasailing") {
    return (
      <ParasailingVariantLanding
        locale={es}
        variant={variant}
        tour={normalizedTour}
        transferHotels={transferHotels}
      />
    );
  }

  return (
    <SamanaWhaleVariantLanding
      locale={es}
      variant={variant}
      tour={normalizedTour}
      transferHotels={transferHotels}
    />
  );
}
