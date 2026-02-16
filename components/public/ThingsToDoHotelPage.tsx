import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Dumbbell, Martini, ShieldCheck, Sparkles, Users, Utensils, Waves, Wifi } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import StructuredData from "@/components/schema/StructuredData";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import HotelGallerySlider from "@/components/public/HotelGallerySlider";
import HotelQuoteWidget from "@/components/public/HotelQuoteWidget";
import { Locale, translate } from "@/lib/translations";
import { getHotelLandingOverrides } from "@/lib/siteContent";

const BASE_URL = "https://proactivitis.com";
const FALLBACK_IMAGE = "/transfer/mini van.png";

type RouteBase = "things-to-do" | "hoteles";

const DEFAULT_AMENITIES = ["Wi-Fi Gratis", "Todo Incluido", "Piscina", "Club de Ninos", "Gimnasio"];

const buildTransferSlug = (hotelSlug: string) => `punta-cana-international-airport-puj-to-${hotelSlug}`;

const getHotel = (hotelSlug: string) =>
  prisma.transferLocation.findFirst({
    where: { slug: hotelSlug, type: "HOTEL" },
    select: { name: true, slug: true, address: true, description: true, heroImage: true }
  });

const buildLocalizedPath = (hotelSlug: string, locale: Locale, routeBase: RouteBase) => {
  const localizedRoute =
    routeBase === "hoteles"
      ? locale === "es"
        ? "hoteles"
        : "hotels"
      : "things-to-do";
  return locale === "es" ? `/${localizedRoute}/${hotelSlug}` : `/${locale}/${localizedRoute}/${hotelSlug}`;
};

const buildCanonical = (hotelSlug: string, locale: Locale, routeBase: RouteBase) =>
  `${BASE_URL}${buildLocalizedPath(hotelSlug, locale, routeBase)}`;

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
      ? ["hotel en Punta Cana", "todo incluido", "reserva hotel"]
      : locale === "fr"
        ? ["hotel a Punta Cana", "tout compris", "meilleur prix"]
        : ["hotel in Punta Cana", "all inclusive", "best rate"];

  return Array.from(
    new Set([hotelName, `${hotelName} Punta Cana`, "Punta Cana", ...base, "Proactivitis"])
  );
};

const buildStars = (value?: string) => {
  const parsed = Number(value || 5);
  const clamped = Number.isFinite(parsed) ? Math.max(1, Math.min(5, Math.round(parsed))) : 5;
  return "?".repeat(clamped);
};

const parseNumber = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getAmenityIcon = (label: string) => {
  const text = label.toLowerCase();
  if (text.includes("wifi") || text.includes("wi-fi") || text.includes("internet")) return Wifi;
  if (text.includes("all inclusive") || text.includes("todo incluido") || text.includes("bar")) return Martini;
  if (text.includes("pool") || text.includes("piscina") || text.includes("beach") || text.includes("playa")) return Waves;
  if (text.includes("kids") || text.includes("ninos") || text.includes("children") || text.includes("familia")) return Users;
  if (text.includes("gym") || text.includes("gimnasio") || text.includes("fitness")) return Dumbbell;
  if (text.includes("restaurant") || text.includes("restaurante") || text.includes("food") || text.includes("comida")) return Utensils;
  return ShieldCheck;
};

const ensureSpanishMeta = (value: string, hotelName: string) => {
  const base = value.trim() || `${hotelName} Todo Incluido en Punta Cana al Mejor Precio.`;
  const required = ["Todo Incluido", "Punta Cana", "Mejor Precio"];
  const missing = required.filter((token) => !base.toLowerCase().includes(token.toLowerCase()));
  return `${base}${missing.length ? ` ${missing.join(" ")}` : ""}`.slice(0, 155);
};

export async function buildThingsToDoMetadata(
  hotelSlug: string,
  locale: Locale,
  routeBase: RouteBase = "things-to-do"
): Promise<Metadata> {
  const hotel = await getHotel(hotelSlug);
  if (!hotel) return {};
  const overrides = await getHotelLandingOverrides(hotelSlug, locale);

  const fallbackTitle =
    locale === "es"
      ? `${hotel.name} - Reserva en Punta Cana al Mejor Precio`
      : locale === "fr"
        ? `${hotel.name} - Reservation a Punta Cana au Meilleur Prix`
        : `${hotel.name} - Book in Punta Cana at the Best Price`;

  const fallbackDescription = translate(locale, "thingsToDo.meta.description", { hotel: hotel.name }).trim();
  const seoTitle = (overrides.seoTitle?.trim() || fallbackTitle).trim();
  const rawDescription = (overrides.seoDescription?.trim() || fallbackDescription).trim();
  const seoDescription = locale === "es" ? ensureSpanishMeta(rawDescription, hotel.name) : rawDescription;
  const canonical = buildCanonical(hotel.slug, locale, routeBase);

  const tourImages = await prisma.tour.findMany({
    where: { status: "published" },
    select: { heroImage: true, gallery: true },
    orderBy: { createdAt: "desc" },
    take: 12
  });

  const pickedTour = pickByHash(tourImages, hotel.slug);
  const tourImage = pickedTour ? resolveTourImage(pickedTour.heroImage, pickedTour.gallery) : null;
  const imageUrl = toAbsoluteUrl(overrides.heroImage?.trim() || hotel.heroImage || tourImage);

  return {
    title: `${seoTitle} | Proactivitis`,
    description: seoDescription,
    keywords: buildKeywords(hotel.name, locale),
    alternates: {
      canonical,
      languages: {
        es: buildLocalizedPath(hotel.slug, "es", routeBase),
        en: buildLocalizedPath(hotel.slug, "en", routeBase),
        fr: buildLocalizedPath(hotel.slug, "fr", routeBase)
      }
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
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
  locale,
  routeBase = "things-to-do"
}: {
  hotelSlug: string;
  locale: Locale;
  routeBase?: RouteBase;
}) {
  const hotel = await getHotel(hotelSlug);
  if (!hotel) return notFound();

  const overrides = await getHotelLandingOverrides(hotelSlug, locale);

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

  const secondaryTransfers = allTransferLandings.filter((landing) => landing.hotelSlug !== hotel.slug).slice(0, 2);
  const transferCards = [primaryTransfer, ...secondaryTransfers];

  const heroTitle =
    overrides.heroTitle?.trim() ||
    (locale === "es"
      ? `${hotel.name} - Reserva en Punta Cana al Mejor Precio`
      : locale === "fr"
        ? `${hotel.name} - Reservation a Punta Cana au Meilleur Prix`
        : `${hotel.name} - Book in Punta Cana at the Best Price`);

  const heroSubtitle = overrides.heroSubtitle?.trim() || t("thingsToDo.subtitle", { hotel: hotel.name });
  const overviewTitle = overrides.overviewTitle?.trim() || t("thingsToDo.overview.title");

  const descriptionParagraphs = [
    overrides.description1?.trim() ||
      ((overrides as { overviewBody1?: string }).overviewBody1 ?? "").trim() ||
      hotel.description?.trim() ||
      t("thingsToDo.overview.body1", { hotel: hotel.name }),
    overrides.description2?.trim() ||
      ((overrides as { overviewBody2?: string }).overviewBody2 ?? "").trim() ||
      t("thingsToDo.overview.body2"),
    overrides.description3?.trim() || ""
  ].filter(Boolean);

  const highlights =
    overrides.highlights?.filter(Boolean) ??
    [
      overrides.bullet1?.trim(),
      overrides.bullet2?.trim(),
      overrides.bullet3?.trim(),
      overrides.bullet4?.trim()
    ].filter(Boolean);

  const effectiveHighlights =
    highlights.length > 0
      ? highlights
      : [
          t("thingsToDo.overview.bullets.1"),
          t("thingsToDo.overview.bullets.2"),
          t("thingsToDo.overview.bullets.3"),
          t("thingsToDo.overview.bullets.4")
        ];

  const galleryImages = [
    overrides.heroImage?.trim() || hotel.heroImage || "",
    ...(overrides.galleryImages ?? [])
  ].filter(Boolean);

  const amenities = overrides.amenities?.filter(Boolean) ?? DEFAULT_AMENITIES;
  const roomTypes = (overrides.roomTypes ?? []).filter((item) => item?.name);

  const stars = buildStars(overrides.stars);
  const locationLabel = overrides.locationLabel?.trim() || hotel.address?.trim() || "Bavaro, Punta Cana";
  const mapUrl = overrides.mapUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name)}`;
  const priceFrom = parseNumber(overrides.priceFromUSD);
  const reviewRating = parseNumber(overrides.reviewRating);
  const reviewCount = parseNumber(overrides.reviewCount);

  const canonicalUrl = buildCanonical(hotel.slug, locale, routeBase);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": `${canonicalUrl}#hotel`,
        name: hotel.name,
        description: descriptionParagraphs[0],
        url: canonicalUrl,
        image: galleryImages.map((image) => toAbsoluteUrl(image)),
        starRating: {
          "@type": "Rating",
          ratingValue: parseNumber(overrides.stars) ?? 5,
          bestRating: 5
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: locationLabel,
          addressCountry: "DO"
        },
        amenityFeature: amenities.map((name) => ({
          "@type": "LocationFeatureSpecification",
          name,
          value: true
        })),
        aggregateRating:
          reviewRating && reviewCount
            ? {
                "@type": "AggregateRating",
                ratingValue: reviewRating,
                reviewCount
              }
            : undefined,
        makesOffer: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: priceFrom ?? undefined,
          availability: "https://schema.org/InStock",
          url: canonicalUrl
        }
      }
    ]
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
      <LandingViewTracker landingSlug={`${routeBase}/${hotel.slug}`} />
      <StructuredData data={schema} />

      <a href="#hotel-quote-widget" className="fixed inset-x-4 bottom-4 z-40 rounded-2xl bg-slate-900 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white md:hidden">
        {overrides.quoteCta?.trim() || "Consultar Disponibilidad"}
      </a>

      <section className="grid gap-6 md:grid-cols-[1.65fr,1fr]">
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Hotel en Punta Cana</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{heroTitle}</h1>
          <p className="text-sm text-slate-600">{heroSubtitle}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{stars}</span>
            <a href={mapUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-sky-700 underline underline-offset-4">
              {locationLabel} · Ver en Mapa
            </a>
          </div>
          <HotelGallerySlider images={galleryImages} hotelName={hotel.name} />
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <HotelQuoteWidget
            hotelSlug={hotel.slug}
            hotelName={hotel.name}
            locale={locale}
            ctaLabel={overrides.quoteCta?.trim() || undefined}
          />
        </aside>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">{overviewTitle}</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <h3 className="mt-8 text-lg font-semibold text-slate-900">Lo mas destacado</h3>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          {effectiveHighlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">Tipos de Habitaciones</h2>
        {roomTypes.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((room) => (
              <article key={`${room.name}-${room.image || room.priceFrom || ""}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {room.image ? <HotelGallerySlider images={[room.image]} hotelName={room.name} /> : null}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{room.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{room.priceFrom || "Cotizacion personalizada"}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">Junior Suite · Master Suite · Family Suite. Tarifas desde temporada disponible.</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">Servicios y Comodidades</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          {amenities.map((item) => {
            const Icon = getAmenityIcon(item);
            return (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Icon className="h-4 w-4 shrink-0 text-slate-700" />
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold text-slate-900">Politicas del Hotel</h2>
        <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-semibold text-slate-900">Check-in:</span> {overrides.checkInTime?.trim() || "3:00 PM"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Check-out:</span> {overrides.checkOutTime?.trim() || "12:00 PM"}
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Politica de Cancelacion:</span>{" "}
          {overrides.cancellationPolicy?.trim() || "Las condiciones pueden variar por temporada. Solicita cotizacion para confirmar reglas aplicables."}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Informacion para Grupos:</span>{" "}
          {overrides.groupPolicy?.trim() || "Precios especiales para grupos de mas de 10 personas."}
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.tours.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{overrides.toursTitle?.trim() || t("thingsToDo.tours.title")}</h2>
        </div>
        <FeaturedToursSection locale={locale} />
      </section>

      <section className="space-y-4 pb-20 md:pb-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.transfers.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{overrides.transfersTitle?.trim() || t("thingsToDo.transfers.title")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {transferCards.map((landing) => (
            <Link
              key={landing.landingSlug}
              href={`/transfer/${landing.landingSlug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img src={landing.heroImage || "/transfer/mini van.png"} alt={landing.heroImageAlt || landing.hotelName} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.transfers.cardTag")}</p>
                <h3 className="text-base font-semibold text-slate-900">{landing.hotelName}</h3>
                <p className="text-sm text-slate-600">
                  {locale === "es" ? landing.heroSubtitle : t("thingsToDo.transfers.cardSubtitle", { hotel: landing.hotelName })}
                </p>
                <span className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">{t("thingsToDo.transfers.cardCta")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}







