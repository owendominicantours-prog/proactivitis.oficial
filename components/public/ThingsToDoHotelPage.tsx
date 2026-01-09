import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import StructuredData from "@/components/schema/StructuredData";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import { Locale, translate } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";
const FALLBACK_IMAGE = "/transfer/mini van.png";

const buildTransferSlug = (hotelSlug: string) =>
  `punta-cana-international-airport-puj-to-${hotelSlug}`;

const getHotel = (hotelSlug: string) =>
  prisma.transferLocation.findFirst({
    where: { slug: hotelSlug, type: "HOTEL" },
    select: { name: true, slug: true }
  });

const buildCanonical = (hotelSlug: string, locale: Locale) =>
  locale === "es" ? `${BASE_URL}/things-to-do/${hotelSlug}` : `${BASE_URL}/${locale}/things-to-do/${hotelSlug}`;

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

const pickByHash = <T,>(items: T[], seed: string) => {
  if (items.length === 0) return null;
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return items[Math.abs(hash) % items.length] ?? null;
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${BASE_URL}${FALLBACK_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${BASE_URL}${normalized}`;
};

const buildKeywords = (hotelName: string, locale: Locale) => {
  const base =
    locale === "es"
      ? ["tours en Punta Cana", "excursiones Punta Cana", "traslados Punta Cana"]
      : locale === "fr"
        ? ["excursions Punta Cana", "tours Punta Cana", "transferts Punta Cana"]
        : ["Punta Cana tours", "Punta Cana excursions", "Punta Cana transfers"];
  return Array.from(
    new Set([
      hotelName,
      `${hotelName} things to do`,
      ...base,
      "Proactivitis"
    ])
  );
};

export async function buildThingsToDoMetadata(hotelSlug: string, locale: Locale): Promise<Metadata> {
  const hotel = await getHotel(hotelSlug);
  if (!hotel) return {};
  const title = translate(locale, "thingsToDo.meta.title", { hotel: hotel.name });
  const description = translate(locale, "thingsToDo.meta.description", { hotel: hotel.name }).trim();
  const seoTitle = `${title} | Proactivitis`;
  const seoDescription = description.endsWith(".") ? description : `${description}.`;
  const canonical = buildCanonical(hotel.slug, locale);
  const ogLocale = locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US";
  const tourImages = await prisma.tour.findMany({
    where: { status: "published" },
    select: { heroImage: true, gallery: true, slug: true },
    orderBy: { createdAt: "desc" },
    take: 12
  });
  const pickedTour = pickByHash(tourImages, hotel.slug);
  const tourImage = pickedTour
    ? resolveTourImage(pickedTour.heroImage, pickedTour.gallery)
    : null;
  const imageUrl = toAbsoluteUrl(tourImage);
  return {
    title: seoTitle,
    description: seoDescription,
    keywords: buildKeywords(hotel.name, locale),
    alternates: {
      canonical,
      languages: {
        es: `/things-to-do/${hotel.slug}`,
        en: `/en/things-to-do/${hotel.slug}`,
        fr: `/fr/things-to-do/${hotel.slug}`
      }
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: ogLocale,
      images: [{ url: imageUrl }]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl]
    }
  };
}

export async function ThingsToDoHotelPage({
  hotelSlug,
  locale
}: {
  hotelSlug: string;
  locale: Locale;
}) {
  const hotel = await getHotel(hotelSlug);
  if (!hotel) return notFound();

  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);

  const transferSlug = buildTransferSlug(hotel.slug);
  const allTransferLandings = allLandings();
  const primaryTransfer =
    allTransferLandings.find((landing) => landing.hotelSlug === hotel.slug) ?? {
      landingSlug: transferSlug,
      hotelName: hotel.name,
      heroSubtitle: t("thingsToDo.transfers.fallback"),
      heroImage: "/transfer/mini van.png",
      heroImageAlt: `Transfer a ${hotel.name}`
    };
  const secondaryTransfers = allTransferLandings
    .filter((landing) => landing.hotelSlug !== hotel.slug)
    .slice(0, 2);
  const transferCards = [primaryTransfer, ...secondaryTransfers];

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: hotel.name,
    description: t("thingsToDo.schema.description", { hotel: hotel.name }),
    url: buildCanonical(hotel.slug, locale),
    provider: {
      "@type": "Organization",
      name: "Proactivitis",
      url: BASE_URL
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
      <LandingViewTracker landingSlug={`things-to-do/${hotel.slug}`} />
      <StructuredData data={schema} />
      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
          {t("thingsToDo.title", { hotel: hotel.name })}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          {t("thingsToDo.subtitle", { hotel: hotel.name })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={locale === "es" ? "/tours" : `/${locale}/tours`}
            className="rounded-2xl bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            {t("thingsToDo.cta.tours")}
          </Link>
          <Link
            href={`/transfer/${transferSlug}`}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
          >
            {t("thingsToDo.cta.transfers")}
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.tours.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{t("thingsToDo.tours.title")}</h2>
        </div>
        <FeaturedToursSection locale={locale} />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("thingsToDo.transfers.eyebrow")}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">{t("thingsToDo.transfers.title")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {transferCards.map((landing) => (
            <Link
              key={landing.landingSlug}
              href={`/transfer/${landing.landingSlug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={landing.heroImage || "/transfer/mini van.png"}
                  alt={landing.heroImageAlt || landing.hotelName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.transfers.cardTag")}</p>
                <h3 className="text-base font-semibold text-slate-900">{landing.hotelName}</h3>
                <p className="text-sm text-slate-600">
                  {locale === "es"
                    ? landing.heroSubtitle
                    : t("thingsToDo.transfers.cardSubtitle", { hotel: landing.hotelName })}
                </p>
                <span className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                  {t("thingsToDo.transfers.cardCta")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
