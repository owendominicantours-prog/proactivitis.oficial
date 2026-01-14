import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import TourGalleryViewer from "@/components/shared/TourGalleryViewer";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";
import { prisma } from "@/lib/prisma";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import { formatReviewCountValue, getTourReviewCount } from "@/lib/reviewCounts";
import { Locale, translate } from "@/lib/translations";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };
const BASE_URL = "https://proactivitis.com";

const parseJsonArray = <T,>(value?: string | null): T[] => {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
};

const parseDuration = (value?: string | null) => {
  if (!value) return { value: "4", unit: "Horas" };
  try {
    return JSON.parse(value) as { value: string; unit: string };
  } catch {
    return { value: value ?? "4", unit: "Horas" };
  }
};

const formatDurationLabel = (duration: { value: string; unit: string }, locale: Locale) => {
  const normalized = duration.unit.trim().toLowerCase();
  if (normalized.includes("hora") || normalized.includes("hour")) {
    return `${duration.value} ${translate(locale, "tourPickup.duration.unit.hours")}`;
  }
  if (normalized.includes("dia") || normalized.includes("day") || normalized.includes("jour")) {
    return `${duration.value} ${translate(locale, "tourPickup.duration.unit.days")}`;
  }
  return `${duration.value} ${duration.unit}`;
};

const formatTimeSlot = (slot: PersistedTimeSlot) => {
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

const tKey = (key: string) => key as Parameters<typeof translate>[1];

const buildItineraryMock = (t: (key: Parameters<typeof translate>[1]) => string): ItineraryStop[] => [
  {
    time: t(tKey("tourPickup.itinerary.mock.1.time")),
    title: t(tKey("tourPickup.itinerary.mock.1.title")),
    description: t(tKey("tourPickup.itinerary.mock.1.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.2.time")),
    title: t(tKey("tourPickup.itinerary.mock.2.title")),
    description: t(tKey("tourPickup.itinerary.mock.2.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.3.time")),
    title: t(tKey("tourPickup.itinerary.mock.3.title")),
    description: t(tKey("tourPickup.itinerary.mock.3.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.4.time")),
    title: t(tKey("tourPickup.itinerary.mock.4.title")),
    description: t(tKey("tourPickup.itinerary.mock.4.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.5.time")),
    title: t(tKey("tourPickup.itinerary.mock.5.title")),
    description: t(tKey("tourPickup.itinerary.mock.5.body"))
  }
];

const buildAdditionalInfo = (t: (key: Parameters<typeof translate>[1]) => string) => [
  t(tKey("tourPickup.additionalInfo.1")),
  t(tKey("tourPickup.additionalInfo.2")),
  t(tKey("tourPickup.additionalInfo.3")),
  t(tKey("tourPickup.additionalInfo.4")),
  t(tKey("tourPickup.additionalInfo.5"))
];

const buildPackingList = (t: (key: Parameters<typeof translate>[1]) => string) => [
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.1.label")),
    detail: t(tKey("tourPickup.packing.1.detail"))
  },
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.2.label")),
    detail: t(tKey("tourPickup.packing.2.detail"))
  },
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.3.label")),
    detail: t(tKey("tourPickup.packing.3.detail"))
  },
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.4.label")),
    detail: t(tKey("tourPickup.packing.4.detail"))
  }
];

const buildReviewBreakdown = (t: (key: Parameters<typeof translate>[1]) => string) => [
  { label: t(tKey("tourPickup.reviews.breakdown.5")), percent: 90 },
  { label: t(tKey("tourPickup.reviews.breakdown.4")), percent: 8 },
  { label: t(tKey("tourPickup.reviews.breakdown.3")), percent: 1 },
  { label: t(tKey("tourPickup.reviews.breakdown.2")), percent: 1 },
  { label: t(tKey("tourPickup.reviews.breakdown.1")), percent: 0 }
];

const buildReviewHighlights = (t: (key: Parameters<typeof translate>[1]) => string) => [
  {
    name: "Gabriela R.",
    date: t(tKey("tourPickup.reviews.highlights.1.date")),
    quote: t(tKey("tourPickup.reviews.highlights.1.quote")),
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    name: "James T.",
    date: t(tKey("tourPickup.reviews.highlights.2.date")),
    quote: t(tKey("tourPickup.reviews.highlights.2.quote")),
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598"
  },
  {
    name: "Anna L.",
    date: t(tKey("tourPickup.reviews.highlights.3.date")),
    quote: t(tKey("tourPickup.reviews.highlights.3.quote")),
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39"
  }
];

const buildReviewTags = (t: (key: Parameters<typeof translate>[1]) => string) => [
  t(tKey("tourPickup.reviews.tags.1")),
  t(tKey("tourPickup.reviews.tags.2")),
  t(tKey("tourPickup.reviews.tags.3"))
];

type TourHotelLandingParams = {
  params: Promise<{ slug: string; locationSlug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

const buildTourPickupUrl = (slug: string, locationSlug: string, locale: Locale) =>
  locale === "es"
    ? `${BASE_URL}/tours/${slug}/recogida/${locationSlug}`
    : `${BASE_URL}/${locale}/tours/${slug}/recogida/${locationSlug}`;

export async function buildTourPickupMetadata(
  slug: string,
  locationSlug: string,
  locale: Locale
): Promise<Metadata> {
  const [tour, location] = await Promise.all([
    prisma.tour.findUnique({
      where: { slug },
      select: {
        title: true,
        shortDescription: true,
        translations: {
          where: { locale },
          select: { title: true, shortDescription: true, description: true }
        }
      }
    }),
    prisma.location.findUnique({
      where: { slug: locationSlug },
      select: { name: true, slug: true }
    })
  ]);

  if (!tour || !location) {
    return {
      title: translate(locale, "tourPickup.meta.fallbackTitle"),
      description: translate(locale, "tourPickup.meta.fallbackDescription")
    };
  }

  const translation = tour.translations?.[0];
  const resolvedTitle = translation?.title ?? tour.title;
  const resolvedDescription =
    translation?.shortDescription ?? translation?.description ?? tour.shortDescription;
  const title = translate(locale, "tourPickup.meta.title", {
    tour: resolvedTitle,
    hotel: location.name
  });
  const description =
    resolvedDescription ??
    translate(locale, "tourPickup.meta.description", {
      tour: resolvedTitle,
      hotel: location.name
    });

  return {
    title,
    description,
    alternates: {
      canonical: buildTourPickupUrl(slug, location.slug, locale),
      languages: {
        es: `/tours/${slug}/recogida/${location.slug}`,
        en: `/en/tours/${slug}/recogida/${location.slug}`,
        fr: `/fr/tours/${slug}/recogida/${location.slug}`
      }
    }
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locationSlug: string }>;
}) {
  const { slug, locationSlug } = await params;
  return buildTourPickupMetadata(slug, locationSlug, "es");
}

export async function TourHotelLanding({
  params,
  searchParams,
  locale
}: TourHotelLandingParams & { locale: Locale }) {
  const { slug, locationSlug } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);

  let tour = null;
  let location = null;
  try {
    [tour, location] = await Promise.all([
      prisma.tour.findUnique({
        where: { slug },
        include: {
          SupplierProfile: {
            include: { User: { select: { name: true } } }
          },
          country: true,
          destination: true,
          microZone: true,
          translations: {
            where: { locale },
            select: {
              title: true,
              shortDescription: true,
              description: true,
              includesList: true,
              notIncludedList: true,
              itineraryStops: true,
              highlights: true
            }
          }
        }
      }),
      prisma.location.findUnique({
        where: { slug: locationSlug },
        include: { microZone: true, destination: true, country: true }
      })
    ]);
  } catch (error) {
        console.error("Error loading tour or location for landing page", {
          slug,
          locationSlug,
          error
        });
    throw error;
  }

  if (!tour) {
    console.error("Tour no encontrado para el slug", { slug, locationSlug });
    notFound();
  }

  if (!location) {
    console.error("Location no encontrada para el slug", { locationSlug, slug });
    notFound();
  }

  const translation = tour.translations?.[0];
  const localizedTitle = translation?.title ?? tour.title;
  const localizedShortDescription = translation?.shortDescription ?? tour.shortDescription ?? "";
  const localizedDescription = translation?.description ?? tour.description ?? "";
  const normalizeArray = (value?: unknown) =>
    Array.isArray(value) ? value.map((entry) => String(entry).trim()).filter(Boolean) : [];
  const translatedIncludes = normalizeArray(translation?.includesList);
  const translatedNotIncluded = normalizeArray(translation?.notIncludedList);
  const translatedHighlights = normalizeArray(translation?.highlights);
  const translatedItinerary = Array.isArray(translation?.itineraryStops)
    ? (translation?.itineraryStops as ItineraryStop[])
    : [];

  const rawGallery = parseJsonArray<string>(tour.gallery);
  const includesList =
    locale !== "es" && translatedIncludes.length
      ? translatedIncludes
      : tour.includes
        ? tour.includes.split(";").map((item) => item.trim()).filter(Boolean)
        : [
            t("tourPickup.includes.defaults.1"),
            t("tourPickup.includes.defaults.2"),
            t("tourPickup.includes.defaults.3")
          ];
  const excludesList =
    locale !== "es" && translatedNotIncluded.length
      ? translatedNotIncluded
      : [
          t("tourPickup.excludes.defaults.1"),
          t("tourPickup.excludes.defaults.2"),
          t("tourPickup.excludes.defaults.3")
        ];
  const categories = (tour.category ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const languages = (tour.language ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const timeSlotsRaw = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const defaultSlot: PersistedTimeSlot = { hour: 9, minute: "00", period: "AM" };
  const timeSlots: PersistedTimeSlot[] = timeSlotsRaw.length ? timeSlotsRaw : [defaultSlot];
  const durationValue = parseDuration(tour.duration);
  const durationLabel = formatDurationLabel(durationValue, locale);
  const displayTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "09:00 AM";
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const visualTimeline =
    locale !== "es" && translatedItinerary.length
      ? translatedItinerary
      : itinerarySource.length
        ? itinerarySource
        : buildItineraryMock(t);
  const heroImage = tour.heroImage ?? rawGallery[0] ?? "/fototours/fotosimple.jpg";
  const gallery = [heroImage, ...rawGallery.filter((img) => img && img !== heroImage)];
  const shortTeaser =
    localizedShortDescription && localizedShortDescription.length > 220
      ? `${localizedShortDescription.slice(0, 220).trim()}…`
      : localizedShortDescription || t("tourPickup.hero.fallback");
  const reviewBreakdown = buildReviewBreakdown(t);
  const reviewHighlights = buildReviewHighlights(t);
  const reviewTags = buildReviewTags(t);
  const packingList = buildPackingList(t);

  const detailReviewCount = getTourReviewCount(tour.slug, "detail");
  const detailReviewLabel = formatReviewCountValue(detailReviewCount);
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("tourPickup.reviews.summary", { count: detailReviewLabel })}</div>

  const quickInfo = [
    {
      label: t("tourPickup.quickInfo.duration.label"),
      value: durationLabel,
      detail: t("tourPickup.quickInfo.duration.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    },
    {
      label: t("tourPickup.quickInfo.departure.label"),
      value: displayTime,
      detail: t("tourPickup.quickInfo.departure.detail", { hotel: location.name }),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16Zm0 9V7" />
          <path d="M12 12h4" />
        </svg>
      )
    },
    {
      label: t("tourPickup.quickInfo.languages.label"),
      value: languages.length ? languages.join(", ") : t("tourPickup.quickInfo.languages.fallback"),
      detail: languages.length
        ? t("tourPickup.quickInfo.languages.detail", { count: String(languages.length) })
        : t("tourPickup.quickInfo.languages.fallback"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M8 4c0 2.21-1.343 4-3 4M18 4c0 2.21 1.343 4 3 4" />
        </svg>
      )
    },
    {
      label: t("tourPickup.quickInfo.capacity.label"),
      value: t("tourPickup.quickInfo.capacity.value", { count: String(tour.capacity ?? 15) }),
      detail: t("tourPickup.quickInfo.capacity.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <path d="M2 21c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" />
        </svg>
      )
    }
  ];

  const bookingCode = resolvedSearch.bookingCode;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-24 overflow-x-hidden">
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 pt-8 sm:pt-10">
        <div className="grid gap-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-16 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              {t("tourPickup.hero.badge", { hotel: location.name })}
            </div>
            <h1 className="mb-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {localizedTitle}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">{shortTeaser}</p>
            <div className="flex items-center gap-8 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("tourPickup.hero.fromLabel")}</p>
                <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("tourPickup.hero.ratingLabel")}</p>
                <p className="text-xl font-black">4.9</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#booking"
                className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
              >
                {t("tourPickup.hero.cta.primary")}
              </a>
              <a
                href="#gallery"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t("tourPickup.hero.cta.secondary")}
              </a>
            </div>
          </div>
          <div
            className="h-[320px] sm:h-[350px] lg:h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`
            }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 py-10">
        <div className="grid gap-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4">
          {quickInfo.map((item) => (
            <div key={item.label} className="space-y-2 rounded-[18px] border border-slate-100 bg-slate-50/60 p-4 text-sm">
              <div className="text-slate-500">{item.icon}</div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 py-8">
        <div className="rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">OK</span> {t("tourPickup.ribbon.immediate")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">OK</span> {t("tourPickup.ribbon.flexible")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">OK</span> {t("tourPickup.ribbon.support")}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto mt-12 grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:px-4 lg:grid-cols-[1fr,400px]">
        <div className="space-y-10">
          <section id="gallery" className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <TourGalleryViewer
              images={gallery.map((img, index) => ({
                url: img,
                label: `${localizedTitle} ${index + 1}`
              }))}
            />
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.summary.eyebrow")}</p>
                <h2 className="text-[20px] font-semibold text-slate-900">{t("tourPickup.summary.title")}</h2>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("tourPickup.summary.badge", { hotel: location.name })}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{localizedDescription || shortTeaser}</p>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{t("tourPickup.details.eyebrow")}</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.details.title")}</h3>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{t("tourPickup.details.badge")}</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: t("tourPickup.details.labels.categories"), value: categories.join(", ") || t("tourPickup.details.defaults.categories") },
                { title: t("tourPickup.details.labels.languages"), value: languages.join(", ") || t("tourPickup.details.defaults.languages") },
                {
                  title: t("tourPickup.details.labels.capacity"),
                  value: t("tourPickup.details.defaults.capacity", { count: String(tour.capacity ?? 15) })
                },
                {
                  title: t("tourPickup.details.labels.physical"),
                  value: tour.physicalLevel ?? t("tourPickup.details.defaults.physical")
                }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[16px] border border-[#F1F5F9] bg-white/40 px-4 py-3"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-500">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.includes.title")}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {includesList.map((entry) => (
                    <li key={entry} className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.excludes.title")}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {excludesList.map((entry) => (
                    <li key={entry} className="flex items-center gap-2">
                      <span className="text-lg">✕</span>
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.itinerary.eyebrow")}</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.itinerary.title")}</h3>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{t("tourPickup.itinerary.badge")}</span>
            </div>
            <div className="relative mt-4 pl-0 lg:pl-10">
              <div className="absolute left-4 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-200" />
              <div className="space-y-5">
                {visualTimeline.map((stop, index) => (
                  <div key={`${stop.title}-${index}`} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full bg-indigo-600" />
                      {index !== visualTimeline.length - 1 && <span className="mt-2 h-6 w-px bg-slate-200" />}
                    </div>
                    <div className="flex-1 rounded-[16px] border border-[#F1F5F9] bg-white/70 px-4 py-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{stop.time}</p>
                      <p className="mt-1 text-[16px] font-semibold text-slate-900">{stop.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{stop.description ?? t("tourPickup.itinerary.fallback")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.reviews.eyebrow")}</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.reviews.title")}</h3>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("tourPickup.reviews.summary", { count: detailReviewLabel })}</div>
            </div>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-semibold text-slate-900">4.9</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.reviews.outOf")}</p>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  {reviewBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-500">{item.label}</span>
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
                <div className="flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  {reviewTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviewHighlights.map((review) => (
                  <div key={review.name} className="rounded-[16px] border border-[#F1F5F9] bg-white p-4 shadow-sm">
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
                    <p className="mt-2 text-sm text-slate-600">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Qué llevar</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.packing.title")}</h3>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">{t("tourPickup.packing.badge")}</span>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {packingList.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-[140px] flex-col items-center gap-2 rounded-[16px] border border-[#F1F5F9] bg-white/0 px-3 py-4 text-center"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:w-[400px] w-full lg:sticky lg:top-16">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl" id="booking">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.booking.eyebrow")}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{t("tourPickup.booking.title")}</h3>
            <p className="text-sm text-slate-600">
              {t("tourPickup.booking.body", { hotel: location.name })}
            </p>
            <TourBookingWidget
              tourId={tour.id}
              basePrice={tour.price}
              timeSlots={timeSlots}
              supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
              platformSharePercent={tour.platformSharePercent ?? 20}
              tourTitle={localizedTitle}
              tourImage={heroImage}
              hotelSlug={location.slug}
              bookingCode={bookingCode ?? undefined}
              originHotelName={location.name}
            />
            <div className="mt-6 rounded-[16px] border border-[#F1F5F9] bg-slate-50/60 p-4 text-sm text-slate-600 text-center">
              <p className="font-semibold text-slate-900">
                {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? t("tourPickup.booking.supplierFallback")}
              </p>
              <p>{t("tourPickup.booking.supplierNote")}</p>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-emerald-50/80 p-5 text-sm text-emerald-900 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">{t("tourPickup.urgency.eyebrow")}</p>
            <p className="text-xl font-semibold">{t("tourPickup.urgency.title")}</p>
            <p className="text-xs text-emerald-700">{t("tourPickup.urgency.body", { hotel: location.name })}</p>
          </div>
        </aside>
      </main>

      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}

export default async function TourHotelLandingRoute(props: TourHotelLandingParams) {
  return TourHotelLanding({ ...props, locale: "es" });
}
