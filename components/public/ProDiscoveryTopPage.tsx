import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";
import {
  computeDiscoveryScore,
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

const DEST_LABEL: Record<Locale, Record<ProDiscoveryDestination, string>> = {
  es: {
    "punta-cana": "Punta Cana",
    sosua: "Sosua",
    "puerto-plata": "Puerto Plata"
  },
  en: {
    "punta-cana": "Punta Cana",
    sosua: "Sosua",
    "puerto-plata": "Puerto Plata"
  },
  fr: {
    "punta-cana": "Punta Cana",
    sosua: "Sosua",
    "puerto-plata": "Puerto Plata"
  }
};

const COPY = {
  es: {
    back: "Volver a ProDiscovery",
    tours: "Top tours",
    transfers: "Top traslados",
    openTour: "Ver ficha",
    openTransfer: "Ver traslado"
  },
  en: {
    back: "Back to ProDiscovery",
    tours: "Top tours",
    transfers: "Top transfers",
    openTour: "Open listing",
    openTransfer: "View transfer"
  },
  fr: {
    back: "Retour a ProDiscovery",
    tours: "Top excursions",
    transfers: "Top transferts",
    openTour: "Voir fiche",
    openTransfer: "Voir transfert"
  }
} as const;

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

export default async function ProDiscoveryTopPage({ locale, destination, category }: Props) {
  const t = COPY[locale];
  const destinationName = DEST_LABEL[locale][destination];
  const basePath = `${localePrefix(locale)}/prodiscovery`;

  const tourRows = await prisma.tour.findMany({
    where: { status: { in: ["published", "seo_only"] } },
    select: {
      id: true,
      slug: true,
      title: true,
      location: true,
      price: true
    },
    take: 220
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

  const topTours = tourRows
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
    .slice(0, 30);

  const topTransfers = transferAggRows
    .filter((row) => row.transferLandingSlug && transferLandingMatchesDestination(row.transferLandingSlug, destination))
    .map((row) => {
      const rating = Number(row._avg.rating ?? 0);
      const count = row._count.rating ?? 0;
      const score = computeDiscoveryScore(rating, count, row._max.createdAt ?? null);
      return {
        slug: row.transferLandingSlug as string,
        rating: round1(rating),
        reviewCount: count,
        score
      };
    })
    .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount)
    .slice(0, 30);

  const showTours = category === "tours";
  const title = `${showTours ? t.tours : t.transfers} · ${destinationName} | ProDiscovery`;
  const canonical = `${PROACTIVITIS_URL}${basePath}/top/${destination}/${category}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: (showTours ? topTours : topTransfers).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: showTours ? (item as (typeof topTours)[number]).title : (item as (typeof topTransfers)[number]).slug,
      url: showTours
        ? `${PROACTIVITIS_URL}${basePath}/tour/${(item as (typeof topTours)[number]).slug}`
        : `${PROACTIVITIS_URL}${basePath}/transfer/${(item as (typeof topTransfers)[number]).slug}`
    }))
  };

  return (
    <main className="bg-slate-50 pb-16">
      <StructuredData data={schema} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Link href={basePath} className="text-sm font-semibold text-emerald-700">
          {t.back}
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-3xl font-black text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{canonical}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {showTours
            ? topTours.map((tour) => (
                <article key={tour.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{destinationName}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{tour.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-amber-600">
                    {tour.rating}/5 · {tour.reviewCount}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">USD {Math.round(tour.price)}</p>
                  <Link
                    href={`${basePath}/tour/${tour.slug}`}
                    className="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white"
                  >
                    {t.openTour}
                  </Link>
                </article>
              ))
            : topTransfers.map((transfer) => (
                <article key={transfer.slug} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{destinationName}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{transfer.slug}</h3>
                  <p className="mt-2 text-sm font-semibold text-amber-600">
                    {transfer.rating}/5 · {transfer.reviewCount}
                  </p>
                  <Link
                    href={`${basePath}/transfer/${transfer.slug}`}
                    className="mt-3 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700"
                  >
                    {t.openTransfer}
                  </Link>
                </article>
              ))}
        </div>
      </section>
    </main>
  );
}
