import Link from "next/link";
import { notFound } from "next/navigation";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";
import { allLandings } from "@/data/transfer-landings";

type Props = {
  locale: Locale;
  landingSlug: string;
};

const COPY: Record<
  Locale,
  {
    back: string;
    reserve: string;
    reviews: string;
    noReviews: string;
    from: string;
  }
> = {
  es: {
    back: "Volver a ProDiscovery",
    reserve: "Ver traslado y reservar",
    reviews: "Resenas verificadas",
    noReviews: "Este traslado aun no tiene resenas aprobadas.",
    from: "Desde"
  },
  en: {
    back: "Back to ProDiscovery",
    reserve: "Open transfer and book",
    reviews: "Verified reviews",
    noReviews: "This transfer has no approved reviews yet.",
    from: "From"
  },
  fr: {
    back: "Retour a ProDiscovery",
    reserve: "Voir transfert et reserver",
    reviews: "Avis verifies",
    noReviews: "Ce transfert n a pas encore d avis approuves.",
    from: "A partir de"
  }
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
const toDiscoveryHref = (locale: Locale) => `${localePrefix(locale)}/prodiscovery`;
const toTransferHref = (locale: Locale, slug: string) => `${localePrefix(locale)}/transfer/${slug}`;

const findLanding = (landingSlug: string) => allLandings().find((item) => item.landingSlug === landingSlug);

export default async function ProDiscoveryTransferDetailPage({ locale, landingSlug }: Props) {
  const t = COPY[locale];
  const landing = findLanding(landingSlug);
  if (!landing) return notFound();

  const reviews = await prisma.transferReview.findMany({
    where: { transferLandingSlug: landingSlug, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: { id: true, customerName: true, rating: true, body: true, createdAt: true }
  });

  const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const transferUrl = `${PROACTIVITIS_URL}${toTransferHref(locale, landingSlug)}`;
  const discoveryUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery/transfer/${landingSlug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: landing.heroTitle,
    description: landing.metaDescription,
    areaServed: "Punta Cana",
    url: discoveryUrl,
    offers: {
      "@type": "Offer",
      price: landing.priceFrom,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: transferUrl
    },
    ...(reviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(avg.toFixed(1)),
            reviewCount: reviews.length
          }
        }
      : {})
  };

  return (
    <main className="bg-slate-50 pb-16">
      <StructuredData data={schema} />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <Link href={toDiscoveryHref(locale)} className="text-sm font-semibold text-emerald-700">
          {t.back}
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Transfer</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{landing.heroTitle}</h1>
          <p className="mt-3 text-slate-600">{landing.metaDescription}</p>
          <p className="mt-4 text-lg font-bold text-emerald-700">
            {t.from} USD {Math.round(landing.priceFrom)}
          </p>
          <Link
            href={toTransferHref(locale, landingSlug)}
            className="mt-5 inline-flex rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white"
          >
            {t.reserve}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">{t.reviews}</h2>
          {!reviews.length ? (
            <p className="mt-3 text-slate-600">{t.noReviews}</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {review.customerName} · {review.rating}/5
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{review.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
