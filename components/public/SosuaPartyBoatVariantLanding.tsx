import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { getApprovedTourReviews, getTourReviewSummary } from "@/lib/tourReviews";
import SosuaPartyBoatOptions from "@/components/public/SosuaPartyBoatOptions";
import TourGalleryCollage from "@/components/tours/TourGalleryCollage";
import GalleryLightbox from "@/components/shared/GalleryLightbox";
import { SOSUA_PARTY_BOAT_VARIANTS, type SosuaPartyBoatVariant } from "@/data/sosua-party-boat-variants";
import { normalizeTextDeep } from "@/lib/text-format";

const TOUR_SLUG = "party-boat-sosua";
const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null | unknown): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      return (JSON.parse(value) as T[]) ?? [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseGallery = (gallery?: string | null) => parseJsonArray<string>(gallery);

const resolveTourHeroImage = (tour: { heroImage?: string | null; gallery?: string | null }) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};

const normalizePickupTimes = (value?: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => `${entry}`.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[;,]/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const toAbsoluteUrl = (value: string) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_TOUR_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${PROACTIVITIS_URL}${normalized}`;
};

const buildOptionPricingLabel = (option: {
  pricePerPerson?: number | null;
  basePrice?: number | null;
  baseCapacity?: number | null;
  extraPricePerPerson?: number | null;
}) => {
  if (option.basePrice && option.baseCapacity) {
    return `$${option.basePrice.toFixed(2)} USD (1-${option.baseCapacity} pax)`;
  }
  if (option.basePrice) {
    return `$${option.basePrice.toFixed(2)} USD total`;
  }
  if (option.pricePerPerson) {
    return `$${option.pricePerPerson.toFixed(2)} USD / persona`;
  }
  return "Precio variable";
};

const getVariantCopy = (variant: SosuaPartyBoatVariant, locale: Locale) => ({
  title: variant.titles[locale] ?? variant.titles.es,
  subtitle: variant.heroSubtitles[locale] ?? variant.heroSubtitles.es,
  metaDescription: variant.metaDescriptions[locale] ?? variant.metaDescriptions.es,
  sections: variant.sections[locale] ?? variant.sections.es,
  faqs: variant.faqs[locale] ?? variant.faqs.es,
  ctas: variant.ctas[locale] ?? variant.ctas.es,
  keywords: variant.keywords
});

const getOptionDetails = (optionName: string) => {
  const normalized = optionName.toLowerCase();
  if (normalized.includes("vip")) {
    return ["Brunch premium incluido", "Open bar ilimitado", "Atencion personalizada"];
  }
  if (normalized.includes("private")) {
    return ["Catamaran privado", "Snack + bebidas incluidas", "Ideal para grupos y eventos"];
  }
  return ["Catamaran compartido", "Barra libre incluida", "Ambiente social y animacion"];
};

export async function buildSosuaPartyBoatVariantMetadata(
  locale: Locale,
  variant: SosuaPartyBoatVariant
): Promise<Metadata> {
  const copy = normalizeTextDeep(getVariantCopy(variant, locale));
  const tour = await prisma.tour.findFirst({
    where: { slug: TOUR_SLUG },
    select: { heroImage: true, gallery: true }
  });
  const heroImage = toAbsoluteUrl(resolveTourHeroImage(tour ?? {}));
  const canonicalPath = `/sosua/party-boat/${variant.slug}`;
  const canonicalUrl =
    locale === "es"
      ? `${PROACTIVITIS_URL}${canonicalPath}`
      : `${PROACTIVITIS_URL}/${locale}${canonicalPath}`;

  return {
    title:
      locale === "en"
        ? `${copy.title} | Sosua Party Boat | Proactivitis`
        : locale === "fr"
          ? `${copy.title} | Party Boat Sosua | Proactivitis`
          : `${copy.title} | Sosua Party Boat | Proactivitis`,
    description: copy.metaDescription,
    keywords: copy.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: `${PROACTIVITIS_URL}${canonicalPath}`,
        en: `${PROACTIVITIS_URL}/en${canonicalPath}`,
        fr: `${PROACTIVITIS_URL}/fr${canonicalPath}`,
        "x-default": `${PROACTIVITIS_URL}${canonicalPath}`
      }
    },
    openGraph: {
      title: copy.title,
      description: copy.metaDescription,
      url: canonicalUrl,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: copy.title
        }
      ],
      siteName: "Proactivitis",
      type: "website",
      locale: locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US"
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.metaDescription,
      images: [heroImage]
    }
  };
}

export default async function SosuaPartyBoatVariantLanding({
  locale,
  variantSlug
}: {
  locale: Locale;
  variantSlug: string;
}) {
  const variant = SOSUA_PARTY_BOAT_VARIANTS.find((item) => item.slug === variantSlug);
  if (!variant) return notFound();

  const [tour] = await Promise.all([
    prisma.tour.findFirst({
      where: { slug: TOUR_SLUG },
      include: {
        SupplierProfile: { select: { stripeAccountId: true } },
        translations: {
          where: { locale },
          select: {
            title: true,
            shortDescription: true,
            description: true,
            includesList: true
          }
        },
        options: { orderBy: { createdAt: "asc" } }
      }
    })
  ]);

  if (!tour) {
    notFound();
  }

  const copy = normalizeTextDeep(getVariantCopy(variant, locale));
  const translation = tour.translations?.[0];
  const localizedTitle = translation?.title ?? tour.title;
  const localizedShortDescription =
    translation?.shortDescription ?? tour.shortDescription ?? tour.subtitle ?? "";

  const heroImage = resolveTourHeroImage(tour);
  const gallery = parseGallery(tour.gallery);
  const galleryImages = gallery.length ? gallery : [heroImage];
  const optionImages = [
    gallery[1] ?? gallery[0] ?? heroImage,
    gallery[2] ?? gallery[1] ?? heroImage,
    gallery[3] ?? gallery[2] ?? heroImage
  ];

  const includesFromTour = parseJsonArray<string>(translation?.includesList ?? tour.includesList);
  const includesFallback = tour.includes
    ? tour.includes.split(/[;\n]/g).map((item) => item.trim()).filter(Boolean)
    : [];
  const includes = includesFromTour.length ? includesFromTour : includesFallback;

  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const pickupTimes = normalizePickupTimes(tour.options?.[0]?.pickupTimes);

  const optionCards = tour.options.map((option, index) => ({
    id: option.id,
    name: option.name,
    description: option.description,
    priceLabel: buildOptionPricingLabel(option),
    details: getOptionDetails(option.name),
    pickupTimes: normalizePickupTimes(option.pickupTimes),
    image: optionImages[index] ?? heroImage,
    ctaLabel: copy.ctas[0] ?? "Seleccionar"
  }));

  const bookingProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    options: tour.options.map((option) => ({
      ...option,
      pickupTimes: normalizePickupTimes(option.pickupTimes)
    })),
    supplierHasStripeAccount: Boolean(tour.SupplierProfile?.stripeAccountId),
    platformSharePercent: tour.platformSharePercent,
    tourTitle: localizedTitle,
    tourImage: heroImage
  };

  const [reviewSummary, approvedReviews] = await Promise.all([
    getTourReviewSummary(tour.id),
    getApprovedTourReviews(tour.id, 5)
  ]);

  const canonicalPath = `/sosua/party-boat/${variant.slug}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Sosua",
        item: `${PROACTIVITIS_URL}/sosua/party-boat`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.title,
        item:
          locale === "es"
            ? `${PROACTIVITIS_URL}${canonicalPath}`
            : `${PROACTIVITIS_URL}/${locale}${canonicalPath}`
      }
    ]
  };

  const hasRatings = reviewSummary.count > 0;
  const offerPrice = Number.isFinite(tour.price) ? Number(tour.price.toFixed(2)) : undefined;
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().split("T")[0];
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    additionalType: "https://schema.org/TouristTrip",
    name: copy.title,
    description: copy.metaDescription,
    image: Array.from(
      new Set([heroImage, ...galleryImages].filter(Boolean).map((item) => toAbsoluteUrl(item)))
    ),
    provider: {
      "@type": "Organization",
      name: "Proactivitis",
      url: PROACTIVITIS_URL
    },
    areaServed: "Sosua, Puerto Plata, Dominican Republic",
    offers: offerPrice
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          price: offerPrice,
          url:
            locale === "es"
              ? `${PROACTIVITIS_URL}${canonicalPath}`
              : `${PROACTIVITIS_URL}/${locale}${canonicalPath}`,
          availability: "https://schema.org/InStock",
          availabilityStarts: new Date().toISOString(),
          priceValidUntil,
          itemCondition: "https://schema.org/NewCondition",
          shippingDetails: {
            "@type": "OfferShippingDetails",
            doesNotShip: true
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted"
          }
        }
      : undefined,
    ...(hasRatings
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(reviewSummary.average.toFixed(1)),
            reviewCount: reviewSummary.count,
            bestRating: "5"
          },
          review: approvedReviews.map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.customerName },
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: "5"
            },
            reviewBody: review.body,
            name: review.title ?? copy.title,
            datePublished: new Date(review.createdAt).toISOString()
          }))
        }
      : {})
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tourSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt={copy.title} className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto grid max-w-[1240px] gap-10 px-4 py-16 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.6em] text-emerald-300">Sosua Party Boat</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{copy.title}</h1>
            <p className="text-lg text-slate-200">{copy.subtitle}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {includes.slice(0, 3).map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/5 p-3 text-sm text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-slate-200 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Reserva directa</p>
            <p className="mt-3 text-base text-slate-100">Confirmación rápida y soporte inmediato.</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-emerald-100/80">{localizedTitle}</p>
            {localizedShortDescription && (
              <p className="mt-4 text-sm text-slate-300">{localizedShortDescription}</p>
            )}
            <div className="mt-4 space-y-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              {pickupTimes.length ? (
                <span>{pickupTimes.join(" · ")}</span>
              ) : (
                <span>Pick-up confirmado tras la reserva</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Oferta directa</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Reserva directa con prioridad y soporte humano
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Confirmación rápida, coordinación clara de pick-up y atención inmediata por WhatsApp.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Open bar real", "Snorkel incluido", "Pick-up confirmado"].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Precio base</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {Number.isFinite(tour.price) ? `$${tour.price.toFixed(0)} USD` : "Consultar"}
            </p>
            <p className="mt-2 text-sm text-slate-700">Precio directo. Elige tu opción y confirma en minutos.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Galería</h2>
            <GalleryLightbox
              images={galleryImages}
              buttonLabel="Ver fotos"
              buttonClassName="rounded-2xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
            />
          </div>
          <div className="mt-6">
            <TourGalleryCollage images={galleryImages} title={copy.title} fallbackImage={heroImage} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {copy.sections.map((section) => (
            <div key={section.title} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm leading-relaxed text-slate-700">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Incluye</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {includes.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SosuaPartyBoatOptions
        options={optionCards}
        bookingProps={bookingProps}
        sectionTitle="Opciones disponibles"
        sectionSubtitle="Selecciona la opción ideal para tu grupo."
      />

      <section className="mx-auto max-w-[1240px] px-4 pb-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Preguntas frecuentes</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {copy.faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{faq.q}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
