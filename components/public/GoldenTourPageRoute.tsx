import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GoldenTourLandingPage from "@/components/public/GoldenTourLandingPage";
import {
  fillGoldenTourText,
  parseGoldenTourPageSlug
} from "@/lib/goldenTourPages";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";
const PUBLIC_TOUR_STATUSES = ["published", "seo_only"];

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const tourSelect = {
  slug: true,
  title: true,
  shortDescription: true,
  description: true,
  duration: true,
  price: true,
  priceChild: true,
  priceYouth: true,
  heroImage: true,
  gallery: true,
  location: true,
  category: true,
  language: true,
  pickup: true,
  meetingPoint: true,
  meetingInstructions: true,
  requirements: true,
  cancellationPolicy: true,
  confirmationType: true,
  timeOptions: true,
  operatingDays: true,
  capacity: true,
  minAge: true,
  highlights: true,
  includes: true,
  includesList: true,
  notIncludedList: true
} as const;

const relatedTourSelect = {
  slug: true,
  title: true,
  price: true,
  heroImage: true,
  gallery: true,
  duration: true
} as const;

const trimDescription = (value: string, max = 156) =>
  value.replace(/\s+/g, " ").trim().slice(0, max).trim();

const resolveOgImage = (heroImage?: string | null, gallery?: string | null) => {
  if (heroImage) return heroImage.startsWith("http") ? heroImage : `${BASE_URL}${heroImage.startsWith("/") ? heroImage : `/${heroImage}`}`;
  if (!gallery) return undefined;
  try {
    const parsed = JSON.parse(gallery);
    const first = Array.isArray(parsed) ? parsed.find(Boolean) : null;
    if (typeof first === "string") return first.startsWith("http") ? first : `${BASE_URL}${first.startsWith("/") ? first : `/${first}`}`;
  } catch {
    return undefined;
  }
  return undefined;
};

export async function buildGoldenTourPageMetadata(goldSlug: string, locale: Locale): Promise<Metadata> {
  const parsed = parseGoldenTourPageSlug(goldSlug);
  if (!parsed) {
    return { title: locale === "es" ? "Tour no encontrado" : locale === "fr" ? "Tour introuvable" : "Tour not found" };
  }
  const tour = await prisma.tour.findFirst({
    where: { slug: parsed.tourSlug, status: { in: PUBLIC_TOUR_STATUSES } },
    select: {
      slug: true,
      title: true,
      shortDescription: true,
      description: true,
      price: true,
      heroImage: true,
      gallery: true
    }
  });
  if (!tour) {
    return { title: locale === "es" ? "Tour no encontrado" : locale === "fr" ? "Tour introuvable" : "Tour not found" };
  }

  const title = fillGoldenTourText(parsed.intent.headline[locale], tour.title);
  const keyword = fillGoldenTourText(parsed.intent.keyword[locale], tour.title);
  const description = trimDescription(
    `${parsed.intent.promise[locale]} Desde USD ${Math.round(tour.price)}. ${tour.shortDescription || tour.description}`
  );
  const canonicalPath = `${localePrefix(locale)}/punta-cana/tours/${goldSlug}`;
  const canonical = `${BASE_URL}${canonicalPath}`;
  const image = resolveOgImage(tour.heroImage, tour.gallery);

  return {
    title: `${title} | Proactivitis`,
    description,
    keywords: [keyword, "punta cana tours", tour.title, "excursiones punta cana"],
    alternates: {
      canonical,
      languages: {
        es: `/punta-cana/tours/${goldSlug}`,
        en: `/en/punta-cana/tours/${goldSlug}`,
        fr: `/fr/punta-cana/tours/${goldSlug}`,
        "x-default": `/punta-cana/tours/${goldSlug}`
      }
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined
    }
  };
}

export async function renderGoldenTourPage(goldSlug: string, locale: Locale) {
  const parsed = parseGoldenTourPageSlug(goldSlug);
  if (!parsed) return notFound();

  const tour = await prisma.tour.findFirst({
    where: { slug: parsed.tourSlug, status: { in: PUBLIC_TOUR_STATUSES } },
    select: tourSelect
  });
  if (!tour) return notFound();

  const relatedTours = await prisma.tour.findMany({
    where: {
      slug: { not: tour.slug },
      status: { in: PUBLIC_TOUR_STATUSES },
      ...(tour.category ? { category: tour.category } : {})
    },
    select: relatedTourSelect,
    orderBy: { createdAt: "desc" },
    take: 3
  });

  return (
    <GoldenTourLandingPage
      locale={locale}
      tour={tour}
      intent={parsed.intent}
      pageSlug={goldSlug}
      relatedTours={relatedTours}
    />
  );
}
