import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import { prisma } from "@/lib/prisma";
import { formatReviewCountValue, getTourRating, getTourReviewCount } from "@/lib/reviewCounts";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";
import StructuredData from "@/components/schema/StructuredData";
import { PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { Prisma } from "@prisma/client";
import GalleryLightbox from "@/components/shared/GalleryLightbox";
import TourGalleryCollage from "@/components/tours/TourGalleryCollage";
import { Locale, translate, type TranslationKey } from "@/lib/translations";

export type TourDetailSearchParams = {
  hotelSlug?: string;
  bookingCode?: string;
};

type TourDetailProps = {
  params: Promise<{
    slug?: string;
  }>;
  searchParams?: Promise<TourDetailSearchParams>;
  locale: Locale;
};

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null | Prisma.JsonValue): T[] => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined) as T[];
  }
  if (!value) return [];
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T[];
    } catch {
      return [];
    }
  }
  return [];
};

type CanonicalDurationUnit = "minute" | "hour" | "day" | "week" | "month";

const DURATION_UNIT_SYNONYMS = new Map<string, CanonicalDurationUnit>([
  ["min", "minute"],
  ["mins", "minute"],
  ["minute", "minute"],
  ["minutes", "minute"],
  ["minuto", "minute"],
  ["minutos", "minute"],
  ["heure", "hour"],
  ["heures", "hour"],
  ["hour", "hour"],
  ["hours", "hour"],
  ["hora", "hour"],
  ["horas", "hour"],
  ["jour", "day"],
  ["jours", "day"],
  ["day", "day"],
  ["days", "day"],
  ["dia", "day"],
  ["d\u00eda", "day"],
  ["dias", "day"],
  ["d\u00edas", "day"],
  ["week", "week"],
  ["weeks", "week"],
  ["semana", "week"],
  ["semanas", "week"],
  ["month", "month"],
  ["months", "month"],
  ["mes", "month"],
  ["meses", "month"]
]);

const DURATION_UNIT_LABELS: Record<Locale, Record<CanonicalDurationUnit, string>> = {
  es: {
    minute: "minutos",
    hour: "horas",
    day: "d\u00edas",
    week: "semanas",
    month: "meses"
  },
  en: {
    minute: "minutes",
    hour: "hours",
    day: "days",
    week: "weeks",
    month: "months"
  },
  fr: {
    minute: "minutes",
    hour: "heures",
    day: "jours",
    week: "semaines",
    month: "mois"
  }
};

const normalizeDurationUnit = (unit: string, locale: Locale) => {
  const key = DURATION_UNIT_SYNONYMS.get(unit.trim().toLowerCase());
  if (!key) return unit.trim();
  return DURATION_UNIT_LABELS[locale][key] ?? unit.trim();
};

const parseDuration = (value?: string | null) => {
  if (!value) return { value: "4", unit: "hour" };
  try {
    const parsed = JSON.parse(value) as { value?: string; unit?: string };
    if (parsed?.value && parsed?.unit) {
      return { value: parsed.value.trim(), unit: parsed.unit.trim() };
    }
  } catch {
    // fall back to plain string
  }
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(\D+)$/);
  if (match) {
    return { value: match[1], unit: match[2].trim() };
  }
  return { value: trimmed || "4", unit: "hour" };
};

const fetchTourTranslations = async (tourId: string) => {
  try {
    return await prisma.tourTranslation.findMany({
      where: { tourId }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return [];
    }
    throw error;
  }
};

const formatTimeSlot = (slot: PersistedTimeSlot) => {
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

const itineraryMock: ItineraryStop[] = [
  {
    time: "09:00",
    title: "Pick-up",
    description: "Recogida en el lobby de tu hotel para arrancar con energía."
  },
  {
    time: "Ruta Safari",
    title: "Ruta Safari",
    description: "Recorrido por senderos de selva con paradas para fotos."
  },
  {
    time: "Cultura Local",
    title: "Cultura Local",
    description: "Degustación de café, cacao y tabaco en casa típica."
  },
  {
    time: "Cenote / Playa",
    title: "Cenote / Playa",
    description: "Parada para nadar y refrescarse en un entorno natural."
  },
  {
    time: "Regreso",
    title: "Regreso",
    description: "Traslado de vuelta al punto de origen."
  }
];

const reviewBreakdown: { labelKey: TranslationKey; percent: number }[] = [
  { labelKey: "tour.reviews.breakdown.5", percent: 90 },
  { labelKey: "tour.reviews.breakdown.4", percent: 8 },
  { labelKey: "tour.reviews.breakdown.3", percent: 1 },
  { labelKey: "tour.reviews.breakdown.2", percent: 1 },
  { labelKey: "tour.reviews.breakdown.1", percent: 0 }
];

const reviewerProfiles = [
  { name: "Gabriela R.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
  { name: "James T.", avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598" },
  { name: "Anna L.", avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39" },
  { name: "Miguel P.", avatar: "https://images.unsplash.com/photo-1544723795-432537d2c8a3" },
  { name: "Sofía M.", avatar: "https://images.unsplash.com/photo-1544723795-3f7118e5f72d" }
] as const;

const reviewTemplates = [
  "Sentí el {keyword} justo al principio y el resto del tour fluyó sin parar.",
  "El {keyword} estuvo presente en cada parada y el equipo lo mantuvo con energía.",
  "Ese {keyword} inesperado me hizo creer que estaba viviendo una experiencia premium.",
  "Cuando el {keyword} apareció, supe que este era el tour que decía ofrecer aventuras reales.",
  "Basta con mencionar {keyword} para describir lo que viví; todo fue muy auténtico."
] as const;

const buildReviewHighlights = (
  locale: Locale,
  keywords: string[],
  title: string,
  locationLabel: string
) =>
  reviewerProfiles.map((profile, index) => {
    const phraseTemplate = reviewTemplates[index % reviewTemplates.length];
    const keyword = keywords[index % keywords.length] ?? "momentos inolvidables";
    const localeChunk = locale === "es" ? "Verified traveler" : "Verified traveler";
    const quote = phraseTemplate
      .replace("{keyword}", keyword)
      .replace("{title}", title || "este tour");
    const suffix = locationLabel ? `El punto de partida en ${locationLabel} te hará repetir.` : "";
    return {
      name: profile.name,
      date: `${["Mayo 2025", "Abril 2025", "Marzo 2025", "Febrero 2025", "Enero 2025"][index]} · ${localeChunk}`,
      quote: `${quote} ${suffix}`.trim(),
      avatar: profile.avatar
    };
  });

const reviewTags = ["Excelente guía", "Mucha adrenalina", "Puntualidad"];
const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";
const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as unknown as string[]) ?? [];
  } catch {
    return [];
  }
};
const resolveTourHeroImage = (tour: { heroImage?: string | null; gallery?: string | null }) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};
const toAbsoluteUrl = (value: string) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_TOUR_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${PROACTIVITIS_URL}${normalized}`;
};

const buildTourTrustBadges = (locale: Locale, languages: string[], categories: string[]) => {
  const languageLabel = languages.length
    ? languages.join(" · ")
    : translate(locale, "tour.badges.languagesFallback");
  const categoryLabel = categories.length
    ? categories[0]
    : translate(locale, "tour.badges.categoryFallback");
  return [
    translate(locale, "tour.badges.guides", { languages: languageLabel }),
    translate(locale, "tour.badges.category", { category: categoryLabel }),
    translate(locale, "tour.badges.support")
  ];
};

const buildTourFaq = (
  locale: Locale,
  tourTitle: string,
  durationLabel: string,
  displayTime: string,
  priceLabel: string
) => [
  {
    question: translate(locale, "tour.faq.question.reserve", { tourTitle }),
    answer: translate(locale, "tour.faq.answer.reserve", { priceLabel })
  },
  {
    question: translate(locale, "tour.faq.question.includes"),
    answer: translate(locale, "tour.faq.answer.includes", { priceLabel, duration: durationLabel })
  },
  {
    question: translate(locale, "tour.faq.question.flight"),
    answer: translate(locale, "tour.faq.answer.flight", { displayTime })
  }
];

export default async function TourDetailPage({ params, searchParams, locale }: TourDetailProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hotelSlugFromQuery = resolvedSearchParams?.hotelSlug;
  const bookingCodeFromQuery = resolvedSearchParams?.bookingCode;
  const originHotel =
    hotelSlugFromQuery !== undefined
      ? await prisma.location.findUnique({
          where: { slug: hotelSlugFromQuery }
        })
      : null;
  if (!slug) notFound();
  if (slug === HIDDEN_TRANSFER_SLUG) notFound();

  const tour = await prisma.tour.findFirst({
    where: { slug },
    select: {
      id: true,
      slug: true,
      status: true,
      title: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      heroImage: true,
      gallery: true,
      highlights: true,
      includes: true,
      includesList: true,
      notIncludedList: true,
      category: true,
      language: true,
      location: true,
      timeOptions: true,
      duration: true,
      adminNote: true,
      price: true,
      capacity: true,
      platformSharePercent: true,
      SupplierProfile: {
        select: {
          company: true,
          stripeAccountId: true,
          User: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!tour) {
    const fallback = await prisma.tour.findUnique({ where: { id: slug } });
    if (fallback?.slug) redirect(`/tours/${fallback.slug}`);
    notFound();
  }

  if (tour.status !== "published") notFound();

  const translations = await fetchTourTranslations(tour.id);

  // --- Lógica de datos ---
  const rawGallery = parseGallery(tour.gallery);
  const rawHighlights = parseJsonArray<string>(tour.highlights);
  const includesFromString = tour.includes ? tour.includes.split(";").map((i) => i.trim()).filter(Boolean) : [];
  const includesList = parseJsonArray<string>(tour.includesList);
  const notIncludedList = parseJsonArray<string>(tour.notIncludedList);
  const fallbackIncludes = [
    translate(locale, "tour.fallback.include.transfer"),
    translate(locale, "tour.fallback.include.guide"),
    translate(locale, "tour.fallback.include.lunch")
  ];
  const fallbackExcludes = [
    translate(locale, "tour.fallback.exclude.tips"),
    translate(locale, "tour.fallback.exclude.drinks"),
    translate(locale, "tour.fallback.exclude.photos")
  ];
  const categories = (tour.category ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  const languages = (tour.language ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const durationValue = parseDuration(tour.duration);
  const displayTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "09:00 AM";
  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const heroImage = resolveTourHeroImage(tour);
  const gallery = [heroImage, ...rawGallery.filter((img) => img && img !== heroImage)];
  const translation = translations.find((entry) => entry.locale === locale);
  const translationIncludes = (translation?.includesList as string[] | undefined) ?? [];
  const translationNotIncluded = (translation?.notIncludedList as string[] | undefined) ?? [];
  const translationHighlights = (translation?.highlights as string[] | undefined) ?? [];
  const translationItineraryStops = (translation?.itineraryStops as string[] | undefined) ?? [];
  const includes = translationIncludes.length
    ? translationIncludes
    : includesList.length
      ? includesList
      : includesFromString.length
        ? includesFromString
        : fallbackIncludes;
  const excludes = translationNotIncluded.length
    ? translationNotIncluded
    : notIncludedList.length
      ? notIncludedList
      : fallbackExcludes;
  const highlights = translationHighlights.length ? translationHighlights : rawHighlights;
  const hasBaseItinerary = itinerarySource.length > 0;
  const hasTranslationItinerary = translationItineraryStops.length > 0;
  const visualTimeline =
    hasTranslationItinerary && hasBaseItinerary
      ? itinerarySource.map((stop, index) => ({
          ...stop,
          title: translationItineraryStops[index] ?? stop.title,
          description: stop.description
        }))
      : hasTranslationItinerary
        ? translationItineraryStops.map((title) => ({
            time: "",
            title,
            description: ""
          }))
        : hasBaseItinerary
          ? itinerarySource
          : [];
  const hasVisualTimeline = visualTimeline.length > 0;
  const localizedTitle = translation?.title ?? tour.title;
  const localizedSubtitle = translation?.subtitle ?? tour.subtitle ?? "";
  const localizedShortDescription = translation?.shortDescription ?? tour.shortDescription;
  const localizedDescription = translation?.description ?? tour.description;
  const durationUnitSource = translation?.durationUnit ?? durationValue.unit;
  const durationUnit = normalizeDurationUnit(durationUnitSource, locale);
  const durationLabel = `${durationValue.value} ${durationUnit}`;
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const shortDescriptionText = localizedShortDescription ?? localizedDescription;
  const needsReadMore = Boolean(shortDescriptionText && shortDescriptionText.length > 220);
  const shortTeaser =
    shortDescriptionText && shortDescriptionText.length > 220
      ? `${shortDescriptionText.slice(0, 220).trim()}…`
      : shortDescriptionText ?? "Explora esta aventura guiada por expertos locales.";
  const longDescriptionParagraphs = localizedDescription
    ? localizedDescription
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
  const trustBadges = buildTourTrustBadges(locale, languages, categories);
  const faqList = buildTourFaq(locale, localizedTitle, durationLabel, displayTime, priceLabel);

  const detailReviewCount = getTourReviewCount(tour.slug, "detail");
  const detailReviewLabel = formatReviewCountValue(detailReviewCount);
  const ratingValue = getTourRating(tour.slug);
  const reviewSummary = translate(locale, "tour.section.reviews.summary", {
    rating: ratingValue.toFixed(1),
    count: detailReviewCount
  });
  const heroPriceLabel = translate(locale, "tour.hero.priceLabel");
  const heroRatingLabel = translate(locale, "tour.hero.ratingLabel");
  const heroReviewsLabel = translate(locale, "tour.hero.reviewsCount", { count: detailReviewCount });
  const heroReserveCta = translate(locale, "tour.hero.cta.reserve");
  const heroGalleryCta = translate(locale, "tour.hero.cta.gallery");

  const heroNavTabs: { labelKey: TranslationKey; href: string }[] = [
    { labelKey: "tour.nav.overview", href: "#overview" },
    { labelKey: "tour.nav.includes", href: "#includes" },
    { labelKey: "tour.nav.itinerary", href: "#itinerary" },
    { labelKey: "tour.nav.reviews", href: "#reviews" },
    { labelKey: "tour.nav.faq", href: "#faq" }
  ];

  const languagesValue = languages.length ? languages.join(", ") : translate(locale, "tour.quickInfo.languages.pending");
  const languagesDetail = languages.length
    ? translate(locale, "tour.quickInfo.languages.detailAvailable", { count: languages.length })
    : translate(locale, "tour.quickInfo.languages.detailPending");

  const keywordPool = Array.from(new Set([...highlights, ...includes, ...excludes, ...categories])).filter(Boolean);
  const reviewHighlights = buildReviewHighlights(
    locale,
    keywordPool,
    localizedTitle,
    tour.location ?? languagesValue
  );

  const quickInfo = [
    {
      label: translate(locale, "tour.quickInfo.duration.label"),
      value: durationLabel,
      detail: translate(locale, "tour.quickInfo.duration.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    },
    {
      label: translate(locale, "tour.quickInfo.departure.label"),
      value: displayTime,
      detail: translate(locale, "tour.quickInfo.departure.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16Zm0 9V7" />
          <path d="M12 12h4" />
        </svg>
      )
    },
    {
      label: translate(locale, "tour.quickInfo.languages.label"),
      value: languagesValue,
      detail: languagesDetail,
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M8 4c0 2.21-1.343 4-3 4M18 4c0 2.21 1.343 4 3 4" />
        </svg>
      )
    },
    {
      label: translate(locale, "tour.quickInfo.capacity.label"),
      value: `${tour.capacity ?? "15"} pers.`,
      detail: translate(locale, "tour.quickInfo.capacity.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <path d="M2 21c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" />
        </svg>
      )
    }
  ];

  const heroImageAbsolute = heroImage
    ? heroImage.startsWith("http")
      ? heroImage
      : `${PROACTIVITIS_URL}${heroImage}`
    : `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;
  const tourUrl = `${PROACTIVITIS_URL}/tours/${tour.slug}`;
  const priceValidUntil = getPriceValidUntil();
  const touristTypeFallback = categories.find((category) =>
    ["Family", "Adventure", "Couples"].includes(category)
  );
  const aggregateRating =
    detailReviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: 4.9,
          reviewCount: detailReviewCount,
          bestRating: "5"
        }
      : undefined;
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localizedTitle,
    description: localizedDescription ?? shortTeaser,
    image: [heroImageAbsolute],
    url: tourUrl,
    brand: {
      "@type": "Brand",
      name: "Proactivitis"
    },
    category: touristTypeFallback ?? "Tour",
    offers: {
      "@type": "Offer",
      url: tourUrl,
      price: tour.price,
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      seller: PROACTIVITIS_LOCALBUSINESS,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD"
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "DO"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY"
          }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 1,
        returnFees: "https://schema.org/FreeReturn",
        applicableCountry: "DO"
      }
    },
    sameAs: SAME_AS_URLS,
    ...(aggregateRating ? { aggregateRating } : {})
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const bookingWidgetProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    supplierHasStripeAccount: Boolean(tour.SupplierProfile?.stripeAccountId),
    platformSharePercent: tour.platformSharePercent ?? 20,
    tourTitle: localizedTitle,
    tourImage: heroImage,
    hotelSlug: hotelSlugFromQuery ?? undefined,
    bookingCode: bookingCodeFromQuery ?? undefined,
    originHotelName: originHotel?.name ?? undefined
  };

  const BookingPanel = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl ${className}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {translate(locale, "tour.booking.panel.label")}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">
        {translate(locale, "tour.booking.panel.title")}
      </h3>
      <div className="mt-4">
        <TourBookingWidget {...bookingWidgetProps} />
      </div>
      <div className="mt-6 rounded-[16px] border border-[#F1F5F9] bg-slate-50/60 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">
          {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? translate(locale, "tour.booking.panel.providerFallback")}
        </p>
        <p>{translate(locale, "tour.booking.panel.supplier")}</p>
      </div>
    </div>
  );

  return (
  <div className="min-h-screen bg-[#FDFDFD] text-slate-950 pb-24 overflow-x-hidden">
      <StructuredData data={tourSchema} />
      <StructuredData data={faqSchema} />

      <section className="mx-auto max-w-[1240px] px-4 pt-8 sm:pt-10">
        <div className="grid gap-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-16">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              <svg
                aria-hidden
                className="h-3 w-3 text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 12.5 7 12.5s7-7.25 7-12.5c0-3.866-3.134-7-7-7zm0 4a3 3 0 100-6 3 3 0 000 6z"
                />
                <circle cx="12" cy="8.4" r="2.4" />
              </svg>
              <span>{tour.location ?? "Punta Cana"}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">{localizedTitle}</h1>
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{heroPriceLabel}</p>
                  <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{heroRatingLabel}</p>
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="text-2xl text-indigo-600">★</span>
                    <p className="text-xl font-black">{detailReviewLabel}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{heroReviewsLabel}</p>
                </div>
              </div>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                  {trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              <div className="flex flex-wrap gap-3">
                    <Link
                      href="#booking"
                      className="rounded-3xl bg-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
                    >
                      {heroReserveCta}
                    </Link>
                    <GalleryLightbox
                      images={gallery}
                      buttonLabel={heroGalleryCta}
                  buttonClassName="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                />
              </div>
            </div>
          </div>
          <TourGalleryCollage images={gallery} title={localizedTitle} fallbackImage={heroImage} />
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-[1240px] px-4">
        <nav className="sticky top-16 z-10 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur lg:top-8">
          <div className="flex gap-3 overflow-x-auto py-1 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            {heroNavTabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {translate(locale, tab.labelKey)}
              </a>
            ))}
          </div>
        </nav>
      </section>

      <section id="overview" className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "tour.section.overview.label")}
          </p>
          <p className="text-lg text-slate-800 line-clamp-3">{shortDescriptionText ?? shortTeaser}</p>
          {highlights.length ? (
            <ul className="space-y-2 text-sm font-semibold text-slate-700">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden className="text-lg text-emerald-600">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {longDescriptionParagraphs.length ? (
        <section className="mx-auto mt-6 max-w-[1240px] px-4">
          <div className="space-y-3 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {translate(locale, "tour.section.description.label")}
            </p>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {longDescriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="key-info" className="mx-auto mt-6 max-w-[1240px] px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickInfo.map((item) => (
            <div
              key={item.label}
              className="rounded-[16px] border border-slate-100 bg-white/80 px-5 py-4 text-center shadow-md"
            >
              <span className="mb-2 inline-block text-2xl">{item.icon}</span>
              <p className="text-[10px] font-semibold text-slate-500 tracking-[0.2em]">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="booking" className="mx-auto mt-6 max-w-[1240px] px-4 lg:hidden">
        <div className="md:hidden mb-3">
          <p className="text-sm font-semibold text-gray-900">
            {translate(locale, "tour.booking.mobile.title")}
          </p>
          <p className="text-xs text-gray-600">{translate(locale, "tour.booking.mobile.description")}</p>
        </div>
        <div className="md:hidden ring-1 ring-black/10 shadow-md">
          <BookingPanel />
        </div>
      </section>

      <main className="mx-auto mt-10 grid max-w-[1240px] gap-10 px-4 lg:grid-cols-[1fr,420px]">
        <div className="space-y-10">
          <section id="includes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {translate(locale, "tour.section.coverage.label")}
                </p>
                <h2 className="text-[20px] font-semibold text-slate-900">
                  {translate(locale, "tour.section.coverage.heading")}
                  <span className="sr-only"> {localizedTitle}</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500">{translate(locale, "tour.section.coverage.note")}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {translate(locale, "tour.section.coverage.includes")}
                </p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-emerald-600">
                  {includes.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span aria-hidden className="text-lg text-emerald-500">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {translate(locale, "tour.section.coverage.excludes")}
                </p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-rose-500">
                  {excludes.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span aria-hidden className="text-lg text-rose-500">
                        ✕
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="itinerary" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {translate(locale, "tour.section.itinerary.label")}
                </p>
                <h2 className="text-[20px] font-semibold text-slate-900">
                  {translate(locale, "tour.section.itinerary.heading")}
                  <span className="sr-only"> {localizedTitle}</span>
                </h2>
              </div>
            </div>
          <div className="space-y-4">
            {hasVisualTimeline ? (
              visualTimeline.map((stop, index) => (
                <div key={`${stop.title}-${index}`} className="flex gap-4 rounded-[16px] border border-[#F1F5F9] bg-white/70 px-4 py-3">
                  <div className="flex flex-col items-center text-sm text-slate-500">
                    <span className="h-3 w-3 rounded-full bg-indigo-600" />
                    {index !== visualTimeline.length - 1 && <span className="mt-2 h-6 w-px bg-slate-200" />}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-700">
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{stop.time}</p>
                    <p className="text-base font-semibold text-slate-900">{stop.title}</p>
                    <p>{stop.description ?? translate(locale, "tour.section.itinerary.detailPending")}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                {translate(locale, "tour.section.itinerary.detailPending")}
              </div>
            )}
          </div>
          </section>

          <section id="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {translate(locale, "tour.section.reviews.label")}
                </p>
                <h2 className="text-[20px] font-semibold text-slate-900">
                  {translate(locale, "tour.section.reviews.heading")}
                  <span className="sr-only"> {localizedTitle}</span>
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{reviewSummary}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-semibold text-slate-900">4.9</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {translate(locale, "tour.section.reviews.ratingOutOf")}
                  </p>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                {reviewBreakdown.map((item) => (
                    <div key={item.labelKey} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-500">{translate(locale, item.labelKey)}</span>
                      <div className="relative flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-2 rounded-full bg-emerald-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs font-semibold text-slate-500">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviewHighlights.map((review) => (
                  <div key={review.name} className="rounded-[16px] border border-[#F1F5F9] bg-white p-4 shadow">
                    <div className="flex items-center gap-3">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                        <p className="text-xs text-slate-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {translate(locale, "tour.section.faq.label")}
              </p>
              <h2 className="text-[20px] font-semibold text-slate-900">
                {translate(locale, "tour.section.faq.heading")}
                <span className="sr-only"> {localizedTitle}</span>
              </h2>
            </div>
            <div className="space-y-4 text-sm text-slate-700">
              {faqList.map((item) => (
                <article key={item.question} className="rounded-[16px] border border-[#F1F5F9] bg-white/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.question}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-10 space-y-6">
            <BookingPanel />
          </div>
        </aside>
      </main>

      <ReserveFloatingButton
        targetId="booking"
        priceLabel={priceLabel}
        label={translate(locale, "tour.booking.floating.label")}
        buttonLabel={translate(locale, "tour.booking.floating.button")}
      />
    </div>
  );
}
