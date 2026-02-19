import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";
import type { HotelLandingOverrides } from "@/lib/siteContent";
import StructuredData from "@/components/schema/StructuredData";

type DirectorySearchParams = Record<string, string | string[] | undefined>;
type HotelDirectoryEnrichment = {
  officialUrl?: string;
  coverImage?: string;
  shortDescription?: string;
  seoTitle?: string;
  metaDescription?: string;
  updatedAt?: string;
};

type HotelCardInfo = {
  slug: string;
  name: string;
  heroImage: string | null;
  description: string;
  zoneName: string;
  price: number | null;
  rating: number;
  reviews: number;
  stars: number;
  badges: string[];
  roomsLeft: number;
};

const copy: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    cta: string;
    searchPlaceholder: string;
    zoneLabel: string;
    zoneAll: string;
    sortLabel: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    sortRating: string;
    applyFilters: string;
    clearFilters: string;
    resultsLabel: string;
    noResultsTitle: string;
    noResultsBody: string;
    fromLabel: string;
    perNight: string;
    reviewLabel: string;
    quoteCta: string;
    pageLabel: string;
    prevPage: string;
    nextPage: string;
    trustedTitle: string;
    trustedBody: string;
    selectedAreaLabel: string;
    selectedSortLabel: string;
    availableNowLabel: string;
    leftLabel: string;
    starLabel: string;
    smartChoiceLabel: string;
    consultRateLabel: string;
  }
> = {
  es: {
    title: "Alojamiento en Punta Cana",
    subtitle:
      "Explora hoteles todo incluido y resorts premium. Filtra por zona, compara opciones y solicita cotizacion en minutos.",
    cta: "Ver hotel",
    searchPlaceholder: "Buscar hotel o zona",
    zoneLabel: "Zona",
    zoneAll: "Todas las zonas",
    sortLabel: "Orden",
    sortRecommended: "Recomendados",
    sortPriceLow: "Precio mas bajo",
    sortPriceHigh: "Precio mas alto",
    sortRating: "Mejor valorados",
    applyFilters: "Aplicar",
    clearFilters: "Limpiar",
    resultsLabel: "resultados",
    noResultsTitle: "No encontramos hoteles con esos filtros",
    noResultsBody: "Prueba otra zona o limpia los filtros para ver todos los hoteles.",
    fromLabel: "Desde",
    perNight: "por noche",
    reviewLabel: "resenas verificadas",
    quoteCta: "Solicitar cotizacion",
    pageLabel: "Pagina",
    prevPage: "Anterior",
    nextPage: "Siguiente",
    trustedTitle: "Reserva con asistencia real",
    trustedBody: "Confirmacion rapida, soporte 24/7 y ayuda para combinar hotel + traslado + tours.",
    selectedAreaLabel: "Zona seleccionada",
    selectedSortLabel: "Orden actual",
    availableNowLabel: "Disponible hoy",
    leftLabel: "habitaciones restantes",
    starLabel: "estrellas",
    smartChoiceLabel: "Eleccion inteligente",
    consultRateLabel: "Consultar tarifa"
  },
  en: {
    title: "Accommodation in Punta Cana",
    subtitle:
      "Explore all-inclusive resorts and premium stays. Filter by area, compare options, and request a quote in minutes.",
    cta: "View hotel",
    searchPlaceholder: "Search hotel or area",
    zoneLabel: "Area",
    zoneAll: "All areas",
    sortLabel: "Sort",
    sortRecommended: "Recommended",
    sortPriceLow: "Price lowest",
    sortPriceHigh: "Price highest",
    sortRating: "Top rated",
    applyFilters: "Apply",
    clearFilters: "Clear",
    resultsLabel: "results",
    noResultsTitle: "No hotels match your filters",
    noResultsBody: "Try a different area or clear filters to view all hotels.",
    fromLabel: "From",
    perNight: "per night",
    reviewLabel: "verified reviews",
    quoteCta: "Request quote",
    pageLabel: "Page",
    prevPage: "Previous",
    nextPage: "Next",
    trustedTitle: "Book with real local support",
    trustedBody: "Fast confirmation, 24/7 support, and help to bundle hotel + transfers + tours.",
    selectedAreaLabel: "Selected area",
    selectedSortLabel: "Current sort",
    availableNowLabel: "Available now",
    leftLabel: "rooms left",
    starLabel: "stars",
    smartChoiceLabel: "Smart choice",
    consultRateLabel: "Check rate"
  },
  fr: {
    title: "Hebergement a Punta Cana",
    subtitle:
      "Explorez des resorts tout inclus et des hebergements premium. Filtrez par zone, comparez et demandez un devis rapidement.",
    cta: "Voir hotel",
    searchPlaceholder: "Rechercher hotel ou zone",
    zoneLabel: "Zone",
    zoneAll: "Toutes les zones",
    sortLabel: "Tri",
    sortRecommended: "Recommandes",
    sortPriceLow: "Prix le plus bas",
    sortPriceHigh: "Prix le plus eleve",
    sortRating: "Mieux notes",
    applyFilters: "Appliquer",
    clearFilters: "Effacer",
    resultsLabel: "resultats",
    noResultsTitle: "Aucun hotel ne correspond a vos filtres",
    noResultsBody: "Essayez une autre zone ou effacez les filtres pour tout voir.",
    fromLabel: "A partir de",
    perNight: "par nuit",
    reviewLabel: "avis verifies",
    quoteCta: "Demander un devis",
    pageLabel: "Page",
    prevPage: "Precedent",
    nextPage: "Suivant",
    trustedTitle: "Reservation avec assistance reelle",
    trustedBody: "Confirmation rapide, support 24/7 et aide pour combiner hotel + transferts + tours.",
    selectedAreaLabel: "Zone selectionnee",
    selectedSortLabel: "Tri actuel",
    availableNowLabel: "Disponible maintenant",
    leftLabel: "chambres restantes",
    starLabel: "etoiles",
    smartChoiceLabel: "Choix intelligent",
    consultRateLabel: "Demander tarif"
  }
};

const getHotelHref = (slug: string, locale: Locale) => {
  if (locale === "es") return `/hoteles/${slug}`;
  return `/${locale}/hotels/${slug}`;
};

const getDirectoryHref = (locale: Locale) => {
  if (locale === "es") return "/hoteles";
  return `/${locale}/hotels`;
};

const firstParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getReviewScore = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Number((4.2 + (sum % 8) / 10).toFixed(1));
};

const getReviewCount = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 80 + (sum % 230);
};

const getStars = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 4 + (sum % 2);
};

const getRoomsLeft = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 2 + (sum % 7);
};

const safeText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

const parseUsdPrice = (value: unknown) => {
  const text = safeText(value);
  if (!text) return null;
  const normalized = text.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
};

const cleanText = (value: unknown) => safeText(value).replace(/\s+/g, " ").trim();

const shortenText = (value: unknown, max = 160) => {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  if (cleaned.length <= max) return cleaned;
  const trimmed = cleaned.slice(0, max);
  const lastSpace = trimmed.lastIndexOf(" ");
  const end = lastSpace > 70 ? lastSpace : max;
  return `${trimmed.slice(0, end)}...`;
};

const firstSentence = (value: unknown) => {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  const match = cleaned.match(/^[^.!?]+[.!?]?/);
  return match?.[0] ?? cleaned;
};

const coverStyleFromSlug = (slug: string) => {
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const x = 30 + (hash % 40);
  const y = 30 + ((hash * 7) % 40);
  const hue = hash % 360;
  return {
    objectPosition: `${x}% ${y}%`,
    overlay: `linear-gradient(120deg, hsla(${hue}, 70%, 45%, 0.26), hsla(${(hue + 80) % 360}, 70%, 30%, 0.18))`
  };
};

const toAbsoluteUrl = (value: string) => {
  if (!value) return "https://proactivitis.com/transfer/mini van.png";
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `https://proactivitis.com${normalized}`;
};

const buildBadges = (zoneName: string, rating: number, reviews: number, locale: Locale) => {
  const dictionary: Record<Locale, { top: string; cancel: string; transfer: string; area: string }> = {
    es: {
      top: "Top vendido",
      cancel: "Cancelacion flexible",
      transfer: "Traslado disponible",
      area: `Zona ${zoneName}`
    },
    en: {
      top: "Top seller",
      cancel: "Flexible cancellation",
      transfer: "Transfer available",
      area: `${zoneName} area`
    },
    fr: {
      top: "Meilleure vente",
      cancel: "Annulation flexible",
      transfer: "Transfert disponible",
      area: `Zone ${zoneName}`
    }
  };

  const base = [dictionary[locale].transfer, dictionary[locale].cancel, dictionary[locale].area];
  if (rating >= 4.8 || reviews > 250) {
    return [dictionary[locale].top, ...base].slice(0, 3);
  }
  return base;
};

export default async function HotelsDirectoryPage({
  locale,
  searchParams
}: {
  locale: Locale;
  searchParams?: Promise<DirectorySearchParams>;
}) {
  const [hotels, hotelLandingSetting, enrichmentSetting] = await Promise.all([
    prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { slug: true, name: true, heroImage: true, description: true, zone: { select: { name: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.siteContentSetting.findUnique({ where: { key: "HOTEL_LANDING" }, select: { content: true } }),
    prisma.siteContentSetting.findUnique({
      where: { key: "HOTEL_DIRECTORY_ENRICHMENT" },
      select: { content: true }
    })
  ]);

  const hotelLandingContent =
    (hotelLandingSetting?.content as Record<string, Partial<Record<Locale, HotelLandingOverrides>>> | null) ?? {};
  const enrichmentContent =
    (enrichmentSetting?.content as Record<string, HotelDirectoryEnrichment | undefined> | null) ?? {};

  const t = copy[locale];
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = (firstParamValue(resolvedSearchParams?.q) ?? "").trim();
  const zone = (firstParamValue(resolvedSearchParams?.zone) ?? "").trim();
  const sort = (firstParamValue(resolvedSearchParams?.sort) ?? "recommended").trim();
  const pageRaw = Number(firstParamValue(resolvedSearchParams?.page) ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const zones = Array.from(new Set(hotels.map((hotel) => hotel.zone?.name).filter(Boolean))).sort();

  const hotelCards: HotelCardInfo[] = hotels.map((hotel) => {
    const zoneName = hotel.zone?.name ?? "Punta Cana";
    const localizedLanding = hotelLandingContent[hotel.slug]?.[locale];
    const fallbackLanding =
      hotelLandingContent[hotel.slug]?.es ??
      hotelLandingContent[hotel.slug]?.en ??
      hotelLandingContent[hotel.slug]?.fr;
    const price = parseUsdPrice(localizedLanding?.priceFromUSD) ?? parseUsdPrice(fallbackLanding?.priceFromUSD);
    const rating = getReviewScore(hotel.name);
    const reviews = getReviewCount(hotel.name);
    const localizedDescription = firstSentence(localizedLanding?.description1);
    const enrichment = enrichmentContent[hotel.slug];
    const descriptionSource =
      enrichment?.shortDescription ||
      localizedDescription ||
      hotel.description ||
      `${hotel.name} in ${zoneName} with all-inclusive options and direct quote support.`;
    return {
      slug: hotel.slug,
      name: hotel.name,
      heroImage: enrichment?.coverImage || hotel.heroImage,
      description: shortenText(descriptionSource, 140),
      zoneName,
      price,
      rating,
      reviews,
      stars: getStars(hotel.name),
      badges: buildBadges(zoneName, rating, reviews, locale),
      roomsLeft: getRoomsLeft(hotel.name)
    };
  });

  const filteredHotels = hotelCards.filter((hotel) => {
    const matchesQuery =
      q.length === 0 ||
      hotel.name.toLowerCase().includes(q.toLowerCase()) ||
      hotel.zoneName.toLowerCase().includes(q.toLowerCase());
    const matchesZone = zone.length === 0 || hotel.zoneName === zone;
    return matchesQuery && matchesZone;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const safePriceA = a.price ?? Number.POSITIVE_INFINITY;
    const safePriceB = b.price ?? Number.POSITIVE_INFINITY;
    if (sort === "price-asc") return safePriceA - safePriceB;
    if (sort === "price-desc") return safePriceB - safePriceA;
    if (sort === "rating") return b.rating - a.rating || b.reviews - a.reviews;
    const pricePenaltyA = a.price ? a.price / 80 : 2.6;
    const pricePenaltyB = b.price ? b.price / 80 : 2.6;
    const aScore = a.rating * 10 + a.reviews / 25 - pricePenaltyA;
    const bScore = b.rating * 10 + b.reviews / 25 - pricePenaltyB;
    return bScore - aScore;
  });

  const pageSize = 18;
  const totalPages = Math.max(1, Math.ceil(sortedHotels.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const hotelsPage = sortedHotels.slice(startIndex, startIndex + pageSize);

  const listingBaseHref = getDirectoryHref(locale);
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    itemListElement: hotelsPage.map((hotel, index) => ({
      "@type": "ListItem",
      position: startIndex + index + 1,
      url: `https://proactivitis.com${getHotelHref(hotel.slug, locale)}`,
      item: {
        "@type": "Hotel",
        name: hotel.name,
        description: hotel.description,
        image: toAbsoluteUrl(hotel.heroImage || "")
      }
    }))
  };
  const getPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (zone) params.set("zone", zone);
    if (sort && sort !== "recommended") params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `${listingBaseHref}?${query}` : listingBaseHref;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <StructuredData data={listSchema} />
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] p-6 text-white shadow-xl sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Proactivitis</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{t.title}</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-100 sm:text-base">{t.subtitle}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold">{hotels.length}+</p>
              <p className="text-xs text-slate-200">Hotels</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-slate-200">Support</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
              <p className="text-2xl font-bold">VIP</p>
              <p className="text-xs text-slate-200">Assistance</p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form
          action={listingBaseHref}
          method="get"
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_180px]"
        >
          <label className="block">
            <span className="sr-only">{t.searchPlaceholder}</span>
            <input
              name="q"
              defaultValue={q}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t.zoneLabel}</span>
            <select
              name="zone"
              defaultValue={zone}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">{t.zoneAll}</option>
              {zones.map((zoneName) => (
                <option key={zoneName} value={zoneName}>
                  {zoneName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">{t.sortLabel}</span>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="recommended">{t.sortRecommended}</option>
              <option value="price-asc">{t.sortPriceLow}</option>
              <option value="price-desc">{t.sortPriceHigh}</option>
              <option value="rating">{t.sortRating}</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {t.applyFilters}
            </button>
            <Link
              href={listingBaseHref}
              className="rounded-xl border border-slate-300 px-3 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            >
              {t.clearFilters}
            </Link>
          </div>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>
            <span className="font-semibold text-slate-900">{sortedHotels.length}</span> {t.resultsLabel}
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {t.trustedTitle}
          </span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900">{t.trustedTitle}</p>
            <p className="mt-2">{t.trustedBody}</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold text-slate-900">{t.selectedAreaLabel}</p>
            <p className="mt-1 text-slate-600">{zone || t.zoneAll}</p>
            <p className="mt-4 font-semibold text-slate-900">{t.selectedSortLabel}</p>
            <p className="mt-1 text-slate-600">
              {sort === "price-asc"
                ? t.sortPriceLow
                : sort === "price-desc"
                  ? t.sortPriceHigh
                  : sort === "rating"
                    ? t.sortRating
                    : t.sortRecommended}
            </p>
          </section>
        </aside>

        <div className="space-y-4">
          {hotelsPage.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-xl font-semibold text-slate-900">{t.noResultsTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.noResultsBody}</p>
            </section>
          ) : (
            <section className="space-y-4">
              {hotelsPage.map((hotel) => (
                <article
                  key={hotel.slug}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-56 w-full shrink-0 bg-slate-100 md:h-auto md:w-80">
                      {hotel.heroImage ? (
                        <img
                          src={hotel.heroImage}
                          alt={hotel.name}
                          className="h-full w-full object-cover"
                          style={{ objectPosition: coverStyleFromSlug(hotel.slug).objectPosition }}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center"
                          style={{ background: coverStyleFromSlug(hotel.slug).overlay }}
                        >
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Punta Cana
                          </span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900">
                        {hotel.zoneName}
                      </div>
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: coverStyleFromSlug(hotel.slug).overlay }}
                      />
                    </div>

                    <div className="flex w-full flex-col justify-between gap-4 p-5">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                        <div>
                          <h2 className="text-xl font-semibold leading-tight text-slate-900">{hotel.name}</h2>
                          <p className="mt-1 text-xs text-slate-600">
                            {hotel.rating.toFixed(1)} / 5 * {hotel.reviews} {t.reviewLabel}
                          </p>
                          <p className="mt-1 text-xs text-amber-600">
                            {"*".repeat(hotel.stars)} {t.starLabel}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">{hotel.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {hotel.badges.map((badge) => (
                              <span
                                key={`${hotel.slug}-${badge}`}
                                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                            {t.availableNowLabel}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-emerald-700">
                            {hotel.roomsLeft} {t.leftLabel}
                          </p>
                          <p className="mt-3 text-sm text-slate-500">
                            {hotel.price ? (
                              <>
                                {t.fromLabel}{" "}
                                <span className="text-2xl font-bold leading-none text-slate-900">${hotel.price}</span>{" "}
                                {t.perNight}
                              </>
                            ) : (
                              <span className="text-base font-semibold text-slate-900">{t.consultRateLabel}</span>
                            )}
                          </p>
                          <Link
                            href={getHotelHref(hotel.slug, locale)}
                            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                          >
                            {t.quoteCta}
                          </Link>
                          <p className="mt-2 text-center text-[11px] font-semibold text-slate-500">
                            {t.smartChoiceLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>

      {totalPages > 1 ? (
        <nav className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {t.pageLabel} {currentPage}/{totalPages}
            </span>
            <div className="flex gap-2">
              {currentPage > 1 ? (
                <Link
                  href={getPageHref(currentPage - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  {t.prevPage}
                </Link>
              ) : null}
              {currentPage < totalPages ? (
                <Link
                  href={getPageHref(currentPage + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  {t.nextPage}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const target = index + 1;
              const isCurrent = target === currentPage;
              return (
                <Link
                  key={target}
                  href={getPageHref(target)}
                  className={
                    isCurrent
                      ? "rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      : "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                  }
                >
                  {target}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
