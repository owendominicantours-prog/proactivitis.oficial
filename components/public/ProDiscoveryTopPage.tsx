import Link from "next/link";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import StructuredData from "@/components/schema/StructuredData";
import { allLandings } from "@/data/transfer-landings";
import { prisma } from "@/lib/prisma";
import { formatDurationDisplay } from "@/lib/formatDuration";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";
import {
  computeDiscoveryScore,
  humanizeDiscoveryDestination,
  matchesDestination,
  round1,
  transferLandingMatchesDestination,
  type ProDiscoveryCategory,
  type ProDiscoveryDestination
} from "@/lib/prodiscovery";

type Props = {
  locale: Locale;
  destination: ProDiscoveryDestination;
  category: ProDiscoveryCategory;
};

type TourRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  shortDescription: string | null;
  heroImage: string | null;
  duration: string | null;
  price: number;
};

type RankedTour = TourRow & {
  rating: number;
  reviewCount: number;
  score: number;
};

type RankedTransfer = {
  slug: string;
  title: string;
  hotelName: string;
  description: string;
  image: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  score: number;
};

type FleetPreset = {
  id: string;
  label: string;
  note: string;
  multiplier: number;
  image: string;
  badge: string;
};

const COPY = {
  es: {
    back: "Volver a ProDiscovery",
    tours: "Top tours",
    transfers: "Top traslados",
    eyebrow: "Ranking editorial ProDiscovery",
    introTours:
      "Seleccionamos y ordenamos las experiencias con mejor reputacion, mejor contexto de reserva y señales reales de confianza para ayudarte a elegir sin abrir veinte pestañas.",
    introTransfers:
      "Este ranking agrupa traslados con mejor reputacion, reseñas aprobadas y rutas realmente buscadas para que compares antes de reservar.",
    whyTitle: "Como se ordena este ranking",
    whyOne: "Reputacion basada en reseñas aprobadas",
    whyTwo: "Recencia y consistencia del servicio",
    whyThree: "Acceso directo a la reserva sin salir de ProDiscovery",
    tocTitle: "En esta pagina",
    openTour: "Ver ficha",
    openTransfer: "Ver traslado",
    reserve: "Reservar",
    reviews: "reseñas",
    from: "Desde",
    duration: "Duracion",
    noItems: "Aun no hay suficientes fichas para este ranking.",
    itemTitleTours: "Mejores tours en {destination}",
    itemTitleTransfers: "Mejores traslados en {destination}",
    whyChoose: "Por que destaca",
    articleTitleTours: "Los 15 tours mas populares en {destination}",
    articleTitleTransfers: "Los 15 traslados mas buscados en {destination}"
  },
  en: {
    back: "Back to ProDiscovery",
    tours: "Top tours",
    transfers: "Top transfers",
    eyebrow: "ProDiscovery editorial ranking",
    introTours:
      "We rank the experiences with the strongest reputation, booking context, and trust signals so you can decide faster without opening twenty tabs.",
    introTransfers:
      "This ranking surfaces the transfers with the strongest reputation, approved reviews, and real route demand so you can compare before booking.",
    whyTitle: "How this ranking is built",
    whyOne: "Reputation based on approved reviews",
    whyTwo: "Recency and service consistency",
    whyThree: "Direct booking access from ProDiscovery",
    tocTitle: "On this page",
    openTour: "Open listing",
    openTransfer: "View transfer",
    reserve: "Book now",
    reviews: "reviews",
    from: "From",
    duration: "Duration",
    noItems: "There are not enough listings for this ranking yet.",
    itemTitleTours: "Best tours in {destination}",
    itemTitleTransfers: "Best transfers in {destination}",
    whyChoose: "Why it stands out",
    articleTitleTours: "The 15 most popular tours in {destination}",
    articleTitleTransfers: "The 15 most searched transfers in {destination}"
  },
  fr: {
    back: "Retour a ProDiscovery",
    tours: "Top excursions",
    transfers: "Top transferts",
    eyebrow: "Classement editorial ProDiscovery",
    introTours:
      "Nous classons les experiences avec la meilleure reputation, le meilleur contexte de reservation et les meilleurs signaux de confiance pour aider a choisir plus vite.",
    introTransfers:
      "Ce classement regroupe les transferts avec la meilleure reputation, des avis approuves et une vraie demande de route pour comparer avant de reserver.",
    whyTitle: "Comment ce classement est construit",
    whyOne: "Reputation basee sur des avis approuves",
    whyTwo: "Recence et constance du service",
    whyThree: "Acces direct a la reservation depuis ProDiscovery",
    tocTitle: "Sur cette page",
    openTour: "Voir fiche",
    openTransfer: "Voir transfert",
    reserve: "Reserver",
    reviews: "avis",
    from: "A partir de",
    duration: "Duree",
    noItems: "Pas encore assez de fiches pour ce classement.",
    itemTitleTours: "Meilleures excursions a {destination}",
    itemTitleTransfers: "Meilleurs transferts a {destination}",
    whyChoose: "Pourquoi il se distingue",
    articleTitleTours: "Les 15 excursions les plus populaires a {destination}",
    articleTitleTransfers: "Les 15 transferts les plus recherches a {destination}"
  }
} as const;

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
const truncate = (value: string, max = 190) => (value.length > max ? `${value.slice(0, max).trim()}...` : value);
const firstSentence = (value: string) => value.split(/(?<=[.!?])\s+/)[0]?.trim() || value;
const formatPrice = (price: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : locale === "en" ? "en-US" : "es-DO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);

const replaceTokens = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, value), template);

const getTransferFleetPresets = (locale: Locale): FleetPreset[] => {
  if (locale === "en") {
    return [
      { id: "sedan", label: "Sedan", note: "1-3 travelers", multiplier: 1, image: "/transfer/sedan.png", badge: "Couples" },
      { id: "suv", label: "SUV", note: "Premium comfort", multiplier: 1.28, image: "/transfer/suv.png", badge: "Premium" },
      { id: "van", label: "Van", note: "Families and luggage", multiplier: 1.42, image: "/transfer/mini van.png", badge: "Families" },
      { id: "vip", label: "VIP", note: "Executive arrival", multiplier: 1.75, image: "/transfer/suv.png", badge: "VIP" }
    ];
  }
  if (locale === "fr") {
    return [
      { id: "sedan", label: "Sedan", note: "1-3 voyageurs", multiplier: 1, image: "/transfer/sedan.png", badge: "Couples" },
      { id: "suv", label: "SUV", note: "Confort premium", multiplier: 1.28, image: "/transfer/suv.png", badge: "Premium" },
      { id: "van", label: "Van", note: "Familles et bagages", multiplier: 1.42, image: "/transfer/mini van.png", badge: "Familles" },
      { id: "vip", label: "VIP", note: "Arrivee executive", multiplier: 1.75, image: "/transfer/suv.png", badge: "VIP" }
    ];
  }
  return [
    { id: "sedan", label: "Sedan", note: "1-3 viajeros", multiplier: 1, image: "/transfer/sedan.png", badge: "Parejas" },
    { id: "suv", label: "SUV", note: "Confort premium", multiplier: 1.28, image: "/transfer/suv.png", badge: "Premium" },
    { id: "van", label: "Van", note: "Familias y equipaje", multiplier: 1.42, image: "/transfer/mini van.png", badge: "Familias" },
    { id: "vip", label: "VIP", note: "Llegada ejecutiva", multiplier: 1.75, image: "/transfer/suv.png", badge: "VIP" }
  ];
};

export default async function ProDiscoveryTopPage({ locale, destination, category }: Props) {
  const t = COPY[locale];
  const destinationName = humanizeDiscoveryDestination(destination);
  const basePath = `${localePrefix(locale)}/prodiscovery`;
  const showTours = category === "tours";

  const tourRows = await prisma.tour.findMany({
    where: { status: { in: ["published", "seo_only"] } },
    select: {
      id: true,
      slug: true,
      title: true,
      location: true,
      shortDescription: true,
      heroImage: true,
      duration: true,
      price: true
    },
    take: 260
  });

  const [tourAggRows, transferAggRows] = await Promise.all([
    prisma.tourReview.groupBy({
      by: ["tourId"],
      where: { status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
      _max: { createdAt: true }
    }),
    prisma.transferReview.groupBy({
      by: ["transferLandingSlug"],
      where: { status: "APPROVED", transferLandingSlug: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
      _max: { createdAt: true }
    })
  ]);

  const topTours: RankedTour[] = tourRows
    .filter((tour) => matchesDestination(tour.location, destination))
    .map((tour) => {
      const agg = tourAggRows.find((row) => row.tourId === tour.id);
      const rating = Number(agg?._avg.rating ?? 0);
      const count = agg?._count.rating ?? 0;
      const score = computeDiscoveryScore(rating, count, agg?._max.createdAt ?? null);
      return {
        ...tour,
        rating: round1(rating),
        reviewCount: count,
        score
      };
    })
    .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount)
    .slice(0, 15);

  const topTransfers: RankedTransfer[] = transferAggRows
    .filter((row) => row.transferLandingSlug && transferLandingMatchesDestination(row.transferLandingSlug, destination))
    .map((row) => {
      const landing = allLandings().find((item) => item.landingSlug === row.transferLandingSlug);
      const rating = Number(row._avg.rating ?? 0);
      const count = row._count.rating ?? 0;
      const score = computeDiscoveryScore(rating, count, row._max.createdAt ?? null);
      return {
        slug: row.transferLandingSlug as string,
        title: landing?.heroTitle ?? (row.transferLandingSlug as string),
        hotelName: landing?.hotelName ?? "",
        description: landing?.metaDescription ?? "",
        image: landing?.heroImage ?? "",
        priceFrom: landing?.priceFrom ?? 0,
        rating: round1(rating),
        reviewCount: count,
        score
      };
    })
    .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount)
    .slice(0, 15);

  const title = replaceTokens(
    showTours ? t.articleTitleTours : t.articleTitleTransfers,
    { destination: destinationName }
  );
  const intro = showTours ? t.introTours : t.introTransfers;
  const itemTitleTemplate = showTours ? t.itemTitleTours : t.itemTitleTransfers;
  const items = showTours ? topTours : topTransfers;
  const fleetPresets = getTransferFleetPresets(locale);
  const useFleetHotelView = !showTours && destination === "punta-cana";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: intro,
    about: destinationName,
    mainEntity: {
      "@type": "ItemList",
      name: title,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: showTours ? (item as RankedTour).title : (item as RankedTransfer).title,
        url: showTours
          ? `${PROACTIVITIS_URL}${basePath}/tour/${(item as RankedTour).slug}`
          : `${PROACTIVITIS_URL}${basePath}/transfer/${(item as RankedTransfer).slug}`
      }))
    }
  };

  return (
    <main className="travel-surface pb-16">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <Link href={basePath} className="text-sm font-semibold text-emerald-700">
          {t.back}
        </Link>

        <div className="mt-4 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">{t.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">{intro}</p>
          </div>

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.7fr,0.9fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{t.whyTitle}</p>
                <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
                  <li>• {t.whyOne}</li>
                  <li>• {t.whyTwo}</li>
                  <li>• {t.whyThree}</li>
                </ul>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{t.tocTitle}</p>
              <div className="mt-3 space-y-2">
                {items.map((item, index) => (
                  <a
                    key={showTours ? (item as RankedTour).id : (item as RankedTransfer).slug}
                    href={`#rank-${index + 1}`}
                    className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300"
                  >
                    {index + 1}. {showTours ? (item as RankedTour).title : (item as RankedTransfer).title}
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">{t.noItems}</div>
        ) : (
          <div className="space-y-6">
            {showTours
              ? topTours.map((tour, index) => (
                  <article
                    key={tour.id}
                    id={`rank-${index + 1}`}
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="grid gap-0 lg:grid-cols-[320px,1fr]">
                      <div className="relative h-64 bg-slate-100 lg:h-full">
                        {tour.heroImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tour.heroImage} alt={tour.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                            ProDiscovery
                          </div>
                        )}
                        <div className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="space-y-4 p-6">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                            {replaceTokens(itemTitleTemplate, { destination: destinationName })}
                          </p>
                          <h2 className="mt-2 text-2xl font-black text-slate-900">{tour.title}</h2>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            {truncate(firstSentence(tour.shortDescription ?? tour.title))}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm font-semibold">
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                            {tour.rating}/5 · {tour.reviewCount} {t.reviews}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                            {t.from} {formatPrice(tour.price, locale)}
                          </span>
                          {tour.duration ? (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                              {t.duration} {formatDurationDisplay(tour.duration)}
                            </span>
                          ) : null}
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{t.whyChoose}</p>
                          <p className="mt-2 text-sm text-slate-700">
                            {tour.reviewCount > 20
                              ? "Alta densidad de reseñas aprobadas y señales claras de demanda real."
                              : "Buena combinación de reputación, contexto de servicio y facilidad para reservar."}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`${basePath}/tour/${tour.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-slate-400"
                          >
                            {t.openTour}
                          </Link>
                          <Link
                            href={`${basePath}/tour/${tour.slug}#booking`}
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            {t.reserve}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              : topTransfers.map((transfer, index) => (
                  <article
                    key={transfer.slug}
                    id={`rank-${index + 1}`}
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="grid gap-0 lg:grid-cols-[320px,1fr]">
                      <div className="relative h-64 bg-slate-100 lg:h-full">
                        {transfer.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={transfer.image} alt={transfer.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                            ProDiscovery
                          </div>
                        )}
                        <div className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="space-y-4 p-6">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                            {useFleetHotelView ? transfer.hotelName : replaceTokens(itemTitleTemplate, { destination: destinationName })}
                          </p>
                          <h2 className="mt-2 text-2xl font-black text-slate-900">{transfer.title}</h2>
                          <p className="mt-2 text-sm font-medium text-slate-500">{transfer.hotelName}</p>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            {truncate(firstSentence(transfer.description || transfer.title))}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm font-semibold">
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                            {transfer.rating}/5 · {transfer.reviewCount} {t.reviews}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                            {t.from} {formatPrice(transfer.priceFrom, locale)}
                          </span>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{t.whyChoose}</p>
                          <p className="mt-2 text-sm text-slate-700">
                            {transfer.reviewCount > 20
                              ? "Ruta con buena señal comercial y reseñas aprobadas suficientes para comparar con criterio."
                              : "Transfer competitivo para comparar reputación, tarifa base y facilidad de reserva."}
                          </p>
                        </div>
                        {useFleetHotelView ? (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                              {locale === "es"
                                ? "Opciones de flotilla para este hotel"
                                : locale === "fr"
                                  ? "Options de flotte pour cet hotel"
                                  : "Fleet options for this hotel"}
                            </p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              {fleetPresets.map((preset) => (
                                <div
                                  key={`${transfer.slug}-${preset.id}`}
                                  className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
                                >
                                  <div className="relative h-24 bg-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preset.image} alt={preset.label} className="h-full w-full object-cover" />
                                    <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                      {preset.badge}
                                    </span>
                                  </div>
                                  <div className="space-y-2 px-3 py-3">
                                    <p className="text-sm font-bold text-slate-900">{preset.label}</p>
                                    <p className="text-xs text-slate-500">{preset.note}</p>
                                    <p className="text-sm font-semibold text-emerald-700">
                                      {formatPrice(Number((transfer.priceFrom * preset.multiplier).toFixed(0)), locale)}
                                    </p>
                                    <Link
                                      href={`${basePath}/transfer/${transfer.slug}#planner`}
                                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                                    >
                                      {preset.label}
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`${basePath}/transfer/${transfer.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-slate-400"
                          >
                            {t.openTransfer}
                          </Link>
                          <Link
                            href={`${basePath}/transfer/${transfer.slug}#planner`}
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            {t.reserve}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        )}
      </section>
    </main>
  );
}
