import Link from "next/link";
import { notFound } from "next/navigation";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import StructuredData from "@/components/schema/StructuredData";
import { allLandings } from "@/data/transfer-landings";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
  landingSlug: string;
  reviewKeyword?: string;
};

const COPY: Record<Locale, { back: string; reviews: string; noReviews: string; from: string; book: string; details: string; map: string; reviewFilter: string; clear: string }> = {
  es: {
    back: "Volver a ProDiscovery",
    reviews: "Resenas verificadas",
    noReviews: "Este traslado aun no tiene resenas aprobadas.",
    from: "Desde",
    book: "Ir a reserva",
    details: "Lo que incluye",
    map: "Ver en mapa",
    reviewFilter: "Filtrar reseñas por tema",
    clear: "Limpiar"
  },
  en: {
    back: "Back to ProDiscovery",
    reviews: "Verified reviews",
    noReviews: "This transfer has no approved reviews yet.",
    from: "From",
    book: "Go to booking",
    details: "What is included",
    map: "View map",
    reviewFilter: "Filter reviews by topic",
    clear: "Clear"
  },
  fr: {
    back: "Retour a ProDiscovery",
    reviews: "Avis verifies",
    noReviews: "Ce transfert n a pas encore d avis approuves.",
    from: "A partir de",
    book: "Aller a la reservation",
    details: "Ce qui est inclus",
    map: "Voir la carte",
    reviewFilter: "Filtrer les avis par theme",
    clear: "Effacer"
  }
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
const toDiscoveryHref = (locale: Locale) => `${localePrefix(locale)}/prodiscovery`;
const toTransferHref = (locale: Locale, slug: string) => `${localePrefix(locale)}/transfer/${slug}`;
const formatDate = (date: Date, locale: Locale) => new Intl.DateTimeFormat(locale === "es" ? "es-DO" : locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "medium" }).format(date);
const round1 = (value: number) => Math.round(value * 10) / 10;

function BubbleRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`rating ${rating}/5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const n = idx + 1;
        const filled = rating >= n;
        const partial = !filled && rating > idx && rating < n;
        const percent = partial ? Math.max(10, Math.min(90, (rating - idx) * 100)) : 0;
        return (
          <span key={n} className="relative h-3.5 w-3.5 rounded-full border border-emerald-700/40 bg-white">
            <span className="absolute inset-0 rounded-full bg-emerald-600" style={{ width: filled ? "100%" : partial ? `${percent}%` : "0%" }} />
          </span>
        );
      })}
    </div>
  );
}

export default async function ProDiscoveryTransferDetailPage({ locale, landingSlug, reviewKeyword }: Props) {
  const t = COPY[locale];
  const landing = allLandings().find((item) => item.landingSlug === landingSlug);
  if (!landing) return notFound();

  const [reviewsRaw, related] = await Promise.all([
    prisma.transferReview.findMany({
      where: { transferLandingSlug: landingSlug, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 14,
      select: { id: true, customerName: true, rating: true, title: true, body: true, createdAt: true }
    }),
    prisma.transferReview.groupBy({
      by: ["transferLandingSlug"],
      where: { status: "APPROVED", transferLandingSlug: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: { _count: { rating: "desc" } },
      take: 6
    })
  ]);
  const keyword = reviewKeyword?.trim().toLowerCase() || "";
  const reviews = keyword
    ? reviewsRaw.filter((review) => review.body.toLowerCase().includes(keyword) || (review.title ?? "").toLowerCase().includes(keyword))
    : reviewsRaw;
  const keywordPool = reviewsRaw
    .flatMap((review) => review.body.toLowerCase().split(/[^a-zA-ZÀ-ÿ0-9]+/g))
    .filter((word) => word.length >= 5 && !["punta", "cana", "hotel", "transfer", "great", "excelente", "proactivitis", "service"].includes(word))
    .slice(0, 400);
  const keywordCounts = new Map<string, number>();
  keywordPool.forEach((word) => keywordCounts.set(word, (keywordCounts.get(word) ?? 0) + 1));
  const keywordSuggestions = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  const average = reviews.length ? round1(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
  const pageUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery/transfer/${landingSlug}`;
  const bookingUrl = `${PROACTIVITIS_URL}${toTransferHref(locale, landingSlug)}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: landing.heroTitle,
    description: landing.metaDescription,
    areaServed: "Punta Cana",
    image: [`${PROACTIVITIS_URL}${landing.heroImage}`],
    url: pageUrl,
    offers: {
      "@type": "Offer",
      price: landing.priceFrom,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: bookingUrl
    },
    ...(reviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average,
            reviewCount: reviews.length
          }
        }
      : {})
  };

  return (
    <main className="bg-[#f5f7f9] pb-12">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href={toDiscoveryHref(locale)} className="text-sm font-semibold text-emerald-700">
          {t.back}
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="relative h-80 overflow-hidden rounded-t-2xl bg-slate-100">
              <img src={landing.heroImage} alt={landing.heroImageAlt} className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transfer</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{landing.heroTitle}</h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <BubbleRating rating={average} />
                <span className="font-bold">{average.toFixed(1)}</span>
                <span>({reviews.length})</span>
              </div>
              <p className="mt-4 leading-relaxed text-slate-700">{landing.metaDescription}</p>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t.details}</p>
              <p className="mt-3 text-2xl font-black text-slate-900">
                {t.from} USD {Math.round(landing.priceFrom)}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {landing.priceDetails.slice(0, 4).map((detail) => (
                  <li key={detail}>- {detail}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(landing.hotelName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  {t.map}
                </a>
              </div>
              <Link href={toTransferHref(locale, landingSlug)} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                {t.book}
              </Link>
            </section>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">{t.reviews}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{t.reviewFilter}</span>
              {keywordSuggestions.map((term) => (
                <Link
                  key={term}
                  href={`${localePrefix(locale)}/prodiscovery/transfer/${landingSlug}?kw=${encodeURIComponent(term)}`}
                  className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700"
                >
                  {term}
                </Link>
              ))}
              {keyword ? (
                <Link
                  href={`${localePrefix(locale)}/prodiscovery/transfer/${landingSlug}`}
                  className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                >
                  {t.clear}
                </Link>
              ) : null}
            </div>
            {!reviews.length ? (
              <p className="mt-3 text-slate-600">{t.noReviews}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{review.customerName}</p>
                      <div className="flex items-center gap-2">
                        <BubbleRating rating={review.rating} />
                        <span className="text-xs text-slate-500">{formatDate(review.createdAt, locale)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{review.body}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-bold text-slate-900">Top transfer listings</h3>
            <div className="mt-3 space-y-3">
              {related
                .filter((entry) => entry.transferLandingSlug && entry.transferLandingSlug !== landingSlug)
                .slice(0, 4)
                .map((entry) => (
                  <Link
                    key={entry.transferLandingSlug as string}
                    href={`${localePrefix(locale)}/prodiscovery/transfer/${entry.transferLandingSlug as string}`}
                    className="block rounded-xl border border-slate-200 p-3 hover:border-emerald-300"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{entry.transferLandingSlug}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {round1(Number(entry._avg.rating ?? 0))}/5 ({entry._count.rating})
                    </p>
                  </Link>
                ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
