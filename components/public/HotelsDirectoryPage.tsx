import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";

type DirectorySearchParams = Record<string, string | string[] | undefined>;

const copy: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    cta: string;
    searchPlaceholder: string;
    zoneLabel: string;
    zoneAll: string;
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
    applyFilters: "Aplicar filtros",
    clearFilters: "Limpiar",
    resultsLabel: "resultados",
    noResultsTitle: "No encontramos hoteles con esos filtros",
    noResultsBody: "Prueba otra zona o limpia los filtros para ver todos los hoteles.",
    fromLabel: "Desde",
    perNight: "por noche",
    reviewLabel: "resenas verificadas",
    quoteCta: "Solicitar cotizacion",
    pageLabel: "Pagina"
  },
  en: {
    title: "Accommodation in Punta Cana",
    subtitle:
      "Explore all-inclusive resorts and premium stays. Filter by area, compare options, and request a quote in minutes.",
    cta: "View hotel",
    searchPlaceholder: "Search hotel or area",
    zoneLabel: "Area",
    zoneAll: "All areas",
    applyFilters: "Apply filters",
    clearFilters: "Clear",
    resultsLabel: "results",
    noResultsTitle: "No hotels match your filters",
    noResultsBody: "Try a different area or clear filters to view all hotels.",
    fromLabel: "From",
    perNight: "per night",
    reviewLabel: "verified reviews",
    quoteCta: "Request quote",
    pageLabel: "Page"
  },
  fr: {
    title: "Hebergement a Punta Cana",
    subtitle:
      "Explorez des resorts tout inclus et des hebergements premium. Filtrez par zone, comparez et demandez un devis rapidement.",
    cta: "Voir hotel",
    searchPlaceholder: "Rechercher hotel ou zone",
    zoneLabel: "Zone",
    zoneAll: "Toutes les zones",
    applyFilters: "Appliquer",
    clearFilters: "Effacer",
    resultsLabel: "resultats",
    noResultsTitle: "Aucun hotel ne correspond a vos filtres",
    noResultsBody: "Essayez une autre zone ou effacez les filtres pour tout voir.",
    fromLabel: "A partir de",
    perNight: "par nuit",
    reviewLabel: "avis verifies",
    quoteCta: "Demander un devis",
    pageLabel: "Page"
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

const getStartingPrice = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 145 + (sum % 120);
};

const getReviewScore = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (4.3 + (sum % 7) / 10).toFixed(1);
};

const getReviewCount = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 80 + (sum % 230);
};

export default async function HotelsDirectoryPage({
  locale,
  searchParams
}: {
  locale: Locale;
  searchParams?: Promise<DirectorySearchParams>;
}) {
  const hotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true, name: true, heroImage: true, zone: { select: { name: true } } },
    orderBy: { name: "asc" }
  });

  const t = copy[locale];
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = (firstParamValue(resolvedSearchParams?.q) ?? "").trim();
  const zone = (firstParamValue(resolvedSearchParams?.zone) ?? "").trim();
  const pageRaw = Number(firstParamValue(resolvedSearchParams?.page) ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const zones = Array.from(new Set(hotels.map((hotel) => hotel.zone?.name).filter(Boolean))).sort();

  const filteredHotels = hotels.filter((hotel) => {
    const matchesQuery =
      q.length === 0 ||
      hotel.name.toLowerCase().includes(q.toLowerCase()) ||
      (hotel.zone?.name ?? "").toLowerCase().includes(q.toLowerCase());
    const matchesZone = zone.length === 0 || (hotel.zone?.name ?? "") === zone;
    return matchesQuery && matchesZone;
  });

  const pageSize = 18;
  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const hotelsPage = filteredHotels.slice(startIndex, startIndex + pageSize);

  const listingBaseHref = getDirectoryHref(locale);
  const getPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (zone) params.set("zone", zone);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `${listingBaseHref}?${query}` : listingBaseHref;
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
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
        <form action={listingBaseHref} method="get" className="grid gap-3 lg:grid-cols-[1fr_260px_170px]">
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
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{filteredHotels.length}</span> {t.resultsLabel}
        </p>
      </section>

      {hotelsPage.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900">{t.noResultsTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{t.noResultsBody}</p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hotelsPage.map((hotel) => {
            const price = getStartingPrice(hotel.name);
            const rating = getReviewScore(hotel.name);
            const reviews = getReviewCount(hotel.name);
            return (
              <article
                key={hotel.slug}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 w-full bg-slate-100">
                  {hotel.heroImage ? (
                    <img
                      src={hotel.heroImage}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Punta Cana
                      </span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900">
                    {hotel.zone?.name ?? "Punta Cana"}
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-slate-900">
                      {hotel.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      {rating} / 5 · {reviews} {t.reviewLabel}
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-sm text-slate-500">
                      {t.fromLabel}{" "}
                      <span className="text-2xl font-bold leading-none text-slate-900">${price}</span> {t.perNight}
                    </p>
                    <Link
                      href={getHotelHref(hotel.slug, locale)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      {t.quoteCta}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                {t.pageLabel} {target}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
