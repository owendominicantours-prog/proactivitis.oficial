import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/translations";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { getTourReviewSummaryForTours } from "@/lib/tourReviews";

type Props = {
  locale: Locale;
};

type DiscoveryCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  topTours: string;
  topTransfers: string;
  noReviews: string;
  openTour: string;
  openTransfer: string;
  topByDestination: string;
};

const COPY: Record<Locale, DiscoveryCopy> = {
  es: {
    eyebrow: "ProDiscovery",
    title: "Descubre lo mejor antes de reservar",
    subtitle:
      "Compara experiencias reales por reputacion, valor y comentarios verificados. Cuando estes listo, reservas en Proactivitis.",
    topTours: "Tours mejor valorados",
    topTransfers: "Traslados mejor valorados",
    noReviews: "Aun sin resenas aprobadas",
    openTour: "Ver ficha",
    openTransfer: "Ver traslado",
    topByDestination: "Rankings por destino"
  },
  en: {
    eyebrow: "ProDiscovery",
    title: "Discover what is best before booking",
    subtitle:
      "Compare real experiences by reputation, value, and verified feedback. When ready, book directly on Proactivitis.",
    topTours: "Top-rated tours",
    topTransfers: "Top-rated transfers",
    noReviews: "No approved reviews yet",
    openTour: "Open listing",
    openTransfer: "View transfer",
    topByDestination: "Destination rankings"
  },
  fr: {
    eyebrow: "ProDiscovery",
    title: "Decouvrez le meilleur avant de reserver",
    subtitle:
      "Comparez des experiences reelles selon reputation, valeur et avis verifies. Quand vous etes pret, reservez sur Proactivitis.",
    topTours: "Excursions les mieux notees",
    topTransfers: "Transferts les mieux notes",
    noReviews: "Pas encore d avis approuves",
    openTour: "Voir fiche",
    openTransfer: "Voir transfert",
    topByDestination: "Classements par destination"
  }
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const toTourHref = (locale: Locale, slug: string) => `${localePrefix(locale)}/prodiscovery/tour/${slug}`;

const toTransferHref = (locale: Locale, slug?: string | null) => {
  if (!slug) return `${localePrefix(locale)}/traslado`;
  return `${localePrefix(locale)}/prodiscovery/transfer/${slug}`;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export default async function ProDiscoveryPage({ locale }: Props) {
  const t = COPY[locale];
  const [publishedTours, transferRows] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { in: ["published", "seo_only"] } },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        location: true
      },
      take: 120
    }),
    prisma.transferReview.groupBy({
      by: ["transferLandingSlug"],
      where: { status: "APPROVED", transferLandingSlug: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: { _count: { rating: "desc" } },
      take: 40
    })
  ]);

  const tourSummary = await getTourReviewSummaryForTours(publishedTours.map((tour) => tour.id));
  const rankedTours = publishedTours
    .map((tour) => {
      const summary = tourSummary[tour.id] ?? { average: 0, count: 0 };
      const score = summary.average * 0.7 + (Math.min(summary.count, 150) / 150) * 5 * 0.3;
      return {
        ...tour,
        rating: round1(summary.average),
        reviewCount: summary.count,
        score
      };
    })
    .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount)
    .slice(0, 12);

  const rankedTransfers = transferRows
    .map((row) => ({
      slug: row.transferLandingSlug,
      rating: round1(Number(row._avg.rating ?? 0)),
      reviewCount: row._count.rating
    }))
    .filter((row) => Boolean(row.slug))
    .slice(0, 12);

  const pageUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `ProDiscovery | ${t.title}`,
        description: t.subtitle
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#top-tours`,
        name: t.topTours,
        itemListElement: rankedTours.map((tour, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tour.title,
          url: `${PROACTIVITIS_URL}${toTourHref(locale, tour.slug)}`
        }))
      }
    ]
  };

  return (
    <main className="bg-slate-50 pb-16">
      <StructuredData data={schema} />
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">{t.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black text-slate-900">{t.title}</h1>
          <p className="mt-4 max-w-3xl text-base text-slate-600">{t.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">{t.topTours}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rankedTours.map((tour) => (
              <article key={tour.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{tour.location || "Punta Cana"}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{tour.title}</h3>
                <p className="mt-2 text-sm text-amber-600 font-semibold">
                  {tour.reviewCount > 0 ? `${tour.rating}/5 · ${tour.reviewCount}` : t.noReviews}
                </p>
                <p className="mt-2 text-sm text-slate-600">USD {Math.round(tour.price)}</p>
                <Link
                  href={toTourHref(locale, tour.slug)}
                  className="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white"
                >
                  {t.openTour}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">{t.topTransfers}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rankedTransfers.map((transfer) => (
              <article key={transfer.slug as string} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Transfer</p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{transfer.slug}</h3>
                <p className="mt-2 text-sm text-amber-600 font-semibold">
                  {transfer.rating}/5 · {transfer.reviewCount}
                </p>
                <Link
                  href={toTransferHref(locale, transfer.slug)}
                  className="mt-3 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700"
                >
                  {t.openTransfer}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">{t.topByDestination}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { slug: "punta-cana", label: "Punta Cana" },
              { slug: "sosua", label: "Sosua" },
              { slug: "puerto-plata", label: "Puerto Plata" }
            ].map((destination) => (
              <article key={destination.slug} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{destination.label}</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`${localePrefix(locale)}/prodiscovery/top/${destination.slug}/tours`}
                    className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                  >
                    Tours
                  </Link>
                  <Link
                    href={`${localePrefix(locale)}/prodiscovery/top/${destination.slug}/transfers`}
                    className="rounded-full border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700"
                  >
                    Transfers
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
