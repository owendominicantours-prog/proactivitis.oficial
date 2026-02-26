import Link from "next/link";
import { notFound } from "next/navigation";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
  slug: string;
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
    reserve: "Reservar en Proactivitis",
    reviews: "Resenas verificadas",
    noReviews: "Este producto aun no tiene resenas aprobadas.",
    from: "Desde"
  },
  en: {
    back: "Back to ProDiscovery",
    reserve: "Book on Proactivitis",
    reviews: "Verified reviews",
    noReviews: "This product has no approved reviews yet.",
    from: "From"
  },
  fr: {
    back: "Retour a ProDiscovery",
    reserve: "Reserver sur Proactivitis",
    reviews: "Avis verifies",
    noReviews: "Ce produit n a pas encore d avis approuves.",
    from: "A partir de"
  }
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
const toTourHref = (locale: Locale, slug: string) => `${localePrefix(locale)}/tours/${slug}`;
const toDiscoveryHref = (locale: Locale) => `${localePrefix(locale)}/prodiscovery`;

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveImage = (hero?: string | null, gallery?: string | null) => {
  const fromGallery = parseGallery(gallery)[0];
  return hero || fromGallery || "/fototours/fotosimple.jpg";
};

const toAbs = (src: string) => (src.startsWith("http") ? src : `${PROACTIVITIS_URL}${src.startsWith("/") ? src : `/${src}`}`);

export default async function ProDiscoveryTourDetailPage({ locale, slug }: Props) {
  const t = COPY[locale];
  const tour = await prisma.tour.findFirst({
    where: { slug, status: { in: ["published", "seo_only"] } },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      description: true,
      price: true,
      location: true,
      heroImage: true,
      gallery: true,
      translations: {
        where: { locale },
        select: { title: true, shortDescription: true, description: true }
      }
    }
  });

  if (!tour) return notFound();

  const localized = tour.translations[0];
  const title = localized?.title || tour.title;
  const description = localized?.shortDescription || localized?.description || tour.shortDescription || tour.description;
  const image = resolveImage(tour.heroImage, tour.gallery);

  const reviews = await prisma.tourReview.findMany({
    where: { tourId: tour.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, customerName: true, rating: true, body: true, createdAt: true }
  });

  const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const tourUrl = `${PROACTIVITIS_URL}${toTourHref(locale, tour.slug)}`;
  const discoveryUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery/tour/${tour.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    image: [toAbs(image)],
    url: discoveryUrl,
    offers: {
      "@type": "Offer",
      price: tour.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: tourUrl
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{tour.location || "Punta Cana"}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
          <p className="mt-3 text-slate-600">{description}</p>
          <p className="mt-4 text-lg font-bold text-emerald-700">
            {t.from} USD {Math.round(tour.price)}
          </p>
          <Link
            href={toTourHref(locale, tour.slug)}
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
