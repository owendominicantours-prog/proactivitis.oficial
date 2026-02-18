import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translationService";
import { Locale } from "@/lib/translations";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { getApprovedTourReviews, getTourReviewSummary } from "@/lib/tourReviews";
import Link from "next/link";
import SosuaPartyBoatOptions from "@/components/public/SosuaPartyBoatOptions";
import { SOSUA_PARTY_BOAT_VARIANTS } from "@/data/sosua-party-boat-variants";
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

const BASE_COPY = {
  eyebrow: "Sosua Party Boat",
  title: "Sosua Party Boat | Private Catamaran, Snorkeling and Open Bar",
  subtitle:
    "Open bar, snorkel, snacks y BBQ con vibra caribena y equipo profesional. Elige la opcion que mas te conviene y reserva en minutos.",
  highlights: [
    "Open bar real con bebidas locales y cocteles frios.",
    "Parada para snorkel en arrecifes y aguas cristalinas.",
    "Staff especializado y coordinacion de pick-up desde hoteles."
  ],
  overviewTitle: "Que hace diferente el Party Boat de Sosua?",
  overviewBody:
    "En Sosua la clave es la logistica. Nosotros coordinamos todo: transporte, horarios, bebidas y servicio. Te subes al catamaran con todo listo y un equipo que se encarga de que solo disfrutes. Esta experiencia combina mar abierto, musica, snacks y un ambiente seguro para grupos y celebraciones.",
  experienceTitle: "Experiencia completa en el Caribe norte",
  experienceBody:
    "Navega por la costa de Puerto Plata, disfruta aguas cristalinas y un equipo que se ocupa del ritmo. La excursion tiene horarios claros, regreso garantizado y un itinerario disenado para aprovechar cada hora en el mar.",
  optionTitle: "Opciones disponibles",
  optionSubtitle: "Tres formas de vivir Sosua Party Boat. Selecciona la tuya.",
  inclusionsTitle: "Incluye",
  scheduleTitle: "Horarios de recogida",
  bookingTitle: "Reserva hoy",
  bookingSubtitle:
    "Selecciona fecha, numero de viajeros y elige la opcion ideal. Confirmacion rapida y soporte inmediato.",
  testimonialsTitle: "Opiniones reales de viajeros",
  testimonials: [
    {
      name: "Megan T.",
      quote: "La mejor fiesta en el mar en Sosua. Open bar real y el snorkel fue espectacular."
    },
    {
      name: "Carlos R.",
      quote: "Todo organizado, pick-up puntual y el equipo super atento. Repetiriamos sin dudar."
    },
    {
      name: "Sophie L.",
      quote: "Ambiente increible y vista preciosa. Perfecto para grupos y celebraciones."
    }
  ],
  seoSections: [
    {
      title: "Sosua Party Boat - Snorkeling, Snack y BBQ",
      body:
        "Salida con snorkel guiado, snacks a bordo y opciones de comida tipo BBQ para grupos. Ideal para celebrar con amigos o familia."
    },
    {
      title: "Sosua Party Boats | Private Yacht Charters",
      body:
        "Opciones privadas con tripulacion dedicada, musica y open bar. Perfecto para cumpleanos, despedidas y eventos especiales."
    },
    {
      title: "Sosua Party Boat con Brunch, Drinks y Snacks",
      body:
        "Plan completo con bebidas frias, snacks y brunch ligero. Reserva rapida con confirmacion directa."
    },
    {
      title: "Sosua Party Boats | Book Your Private Boats Tours",
      body:
        "Reserva directa con atencion humana, logistica clara y horarios confirmados. Experiencia disenada para disfrutar sin estres."
    }
  ],
  faqTitle: "Preguntas frecuentes",
  faqs: [
    {
      q: "Cuanto dura el tour de Sosua Party Boat?",
      a: "Normalmente dura alrededor de 4 horas, segun la opcion elegida y la logistica del dia."
    },
    {
      q: "Incluye recogida en hotel?",
      a: "Si, coordinamos pick-up en hoteles de Sosua, Cabarete y zonas cercanas tras confirmar la reserva."
    },
    {
      q: "Que incluye el open bar?",
      a: "Bebidas locales, refrescos y cocteles basicos durante la salida."
    },
    {
      q: "Puedo reservar un barco privado?",
      a: "Si. Tenemos opciones privadas con tripulacion dedicada y horarios personalizados."
    }
  ]
};

type SosuaLandingCopy = typeof BASE_COPY;

const localizeCopy = async (locale: Locale): Promise<SosuaLandingCopy> => {
  if (locale === "es") return BASE_COPY;
  const [
    eyebrow,
    title,
    subtitle,
    overviewTitle,
    overviewBody,
    experienceTitle,
    experienceBody,
    optionTitle,
    optionSubtitle,
    inclusionsTitle,
    scheduleTitle,
    bookingTitle,
    bookingSubtitle,
    testimonialsTitle,
    faqTitle
  ] =
    await Promise.all([
      translateText(BASE_COPY.eyebrow, locale),
      translateText(BASE_COPY.title, locale),
      translateText(BASE_COPY.subtitle, locale),
      translateText(BASE_COPY.overviewTitle, locale),
      translateText(BASE_COPY.overviewBody, locale),
      translateText(BASE_COPY.experienceTitle, locale),
      translateText(BASE_COPY.experienceBody, locale),
      translateText(BASE_COPY.optionTitle, locale),
      translateText(BASE_COPY.optionSubtitle, locale),
      translateText(BASE_COPY.inclusionsTitle, locale),
      translateText(BASE_COPY.scheduleTitle, locale),
      translateText(BASE_COPY.bookingTitle, locale),
      translateText(BASE_COPY.bookingSubtitle, locale),
      translateText(BASE_COPY.testimonialsTitle, locale),
      translateText(BASE_COPY.faqTitle, locale)
    ]);
  const highlights = await Promise.all(BASE_COPY.highlights.map((item) => translateText(item, locale)));
  const testimonials = await Promise.all(
    BASE_COPY.testimonials.map(async (item) => ({
      name: item.name,
      quote: await translateText(item.quote, locale)
    }))
  );
  const seoSections = await Promise.all(
    BASE_COPY.seoSections.map(async (section) => ({
      title: await translateText(section.title, locale),
      body: await translateText(section.body, locale)
    }))
  );
  const faqs = await Promise.all(
    BASE_COPY.faqs.map(async (faq) => ({
      q: await translateText(faq.q, locale),
      a: await translateText(faq.a, locale)
    }))
  );
  return {
    eyebrow,
    title,
    subtitle,
    highlights,
    overviewTitle,
    overviewBody,
    experienceTitle,
    experienceBody,
    optionTitle,
    optionSubtitle,
    inclusionsTitle,
    scheduleTitle,
    bookingTitle,
    bookingSubtitle,
    testimonialsTitle,
    testimonials,
    seoSections,
    faqTitle,
    faqs
  };
};

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

export async function buildSosuaPartyBoatMetadata(locale: Locale): Promise<Metadata> {
  const [copy, tour] = await Promise.all([
    localizeCopy(locale).then((content) => normalizeTextDeep(content)),
    prisma.tour.findFirst({
      where: { slug: TOUR_SLUG },
      select: { heroImage: true, gallery: true }
    })
  ]);
  const heroImage = toAbsoluteUrl(resolveTourHeroImage(tour ?? {}));
  const canonicalPath = "/sosua/party-boat";
  const canonicalUrl =
    locale === "es"
      ? `${PROACTIVITIS_URL}${canonicalPath}`
      : `${PROACTIVITIS_URL}/${locale}${canonicalPath}`;

  return {
    title:
      locale === "en"
        ? "Sosua Party Boat | Private Catamaran & Open Bar | Proactivitis"
        : locale === "fr"
          ? "Sosua Party Boat | Catamaran prive & Open Bar | Proactivitis"
          : "Sosua Party Boat | Catamaran privado y Open Bar | Proactivitis",
    description: copy.subtitle,
    keywords: [
      copy.title,
      "Sosua party boat",
      "Sosua party boats",
      "Sosua boat party",
      "party boat prices in Sosua",
      "best party boat in Sosua",
      "Sosua snorkeling boat",
      "Sosua private boat tour",
      "private yacht charter in Sosua",
      "Sosua catamaran party",
      "Puerto Plata boat party"
    ],
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
      description: copy.subtitle,
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
      description: copy.subtitle,
      images: [heroImage]
    }
  };
}

export default async function SosuaPartyBoatLanding({ locale }: { locale: Locale }) {
  const [copy, tour] = await Promise.all([
    localizeCopy(locale).then((content) => normalizeTextDeep(content)),
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
  const localizedIncludes =
    locale === "es" ? includes : await Promise.all(includes.map((item) => translateText(item, locale)));

  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const pickupTimes = normalizePickupTimes(tour.options?.[0]?.pickupTimes);

  const optionCards = await Promise.all(
    tour.options.map(async (option, index) => {
      const name = locale === "es" ? option.name : await translateText(option.name, locale);
      const description = option.description
        ? locale === "es"
          ? option.description
          : await translateText(option.description, locale)
        : null;
      const detailsBase = getOptionDetails(option.name);
      const details =
        locale === "es"
          ? detailsBase
          : await Promise.all(detailsBase.map((item) => translateText(item, locale)));
      return {
        id: option.id,
        name,
        description,
        priceLabel: buildOptionPricingLabel(option),
        details,
        pickupTimes: normalizePickupTimes(option.pickupTimes),
        image: optionImages[index] ?? heroImage,
        ctaLabel: locale === "es" ? "Seleccionar" : await translateText("Seleccionar", locale)
      };
    })
  );

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

  const variantLinks = SOSUA_PARTY_BOAT_VARIANTS.map((variant) => ({
    slug: variant.slug,
    title: variant.titles[locale] ?? variant.titles.es,
    subtitle: variant.heroSubtitles[locale] ?? variant.heroSubtitles.es
  }));

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
      }
    ]
  };

  const hasRatings = reviewSummary.count > 0;
  const mainTourHref = locale === "es" ? "/tours/party-boat-sosua" : `/${locale}/tours/party-boat-sosua`;
  const offerPrice = Number.isFinite(tour.price) ? Number(tour.price.toFixed(2)) : undefined;
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    additionalType: "https://schema.org/TouristTrip",
    name: copy.title,
    description: copy.subtitle,
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
              ? `${PROACTIVITIS_URL}/sosua/party-boat`
              : `${PROACTIVITIS_URL}/${locale}/sosua/party-boat`,
          availability: "https://schema.org/InStock",
          availabilityStarts: new Date().toISOString(),
          itemCondition: "https://schema.org/NewCondition"
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
          <img src={heroImage} alt={localizedTitle} className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto grid max-w-[1240px] gap-10 px-4 py-16 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.6em] text-emerald-300">{copy.eyebrow}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{copy.title}</h1>
            <p className="text-lg text-slate-200">{copy.subtitle}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {copy.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/5 p-3 text-sm text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-slate-200 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">{copy.bookingTitle}</p>
            <p className="mt-3 text-base text-slate-100">{copy.bookingSubtitle}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-emerald-100/80">{localizedTitle}</p>
            {localizedShortDescription && (
              <p className="mt-4 text-sm text-slate-300">{localizedShortDescription}</p>
            )}
            <div className="mt-4 space-y-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              {pickupTimes.length ? (
                <span>{pickupTimes.join(" - ")}</span>
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

      <section className="mx-auto max-w-[1240px] px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.overviewTitle}</p>
            <p className="text-sm leading-relaxed text-slate-700">{copy.overviewBody}</p>
          </div>
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.experienceTitle}</p>
            <p className="text-sm leading-relaxed text-slate-700">{copy.experienceBody}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.inclusionsTitle}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {localizedIncludes.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{copy.scheduleTitle}</p>
          <p className="mt-3 text-sm text-slate-700">
            {pickupTimes.length ? pickupTimes.join(" - ") : "Pick-up confirmado tras la reserva"}
          </p>
          <Link
            href={mainTourHref}
            className="mt-4 inline-block text-sm font-semibold text-emerald-700 underline underline-offset-2"
          >
            {locale === "es"
              ? "Ver ficha completa del Sosua Party Boat con resenas verificadas"
              : locale === "en"
                ? "View full Sosua Party Boat product page with verified reviews"
                : "Voir la fiche complete Sosua Party Boat avec avis verifies"}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{copy.testimonialsTitle}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {copy.testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">"{item.quote}"</p>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Explora más opciones en Sosua</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {variantLinks.map((variant) => (
              <Link
                key={variant.slug}
                href={locale === "es" ? `/sosua/party-boat/${variant.slug}` : `/${locale}/sosua/party-boat/${variant.slug}`}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">{variant.title}</p>
                <p className="mt-1 text-xs text-slate-600">{variant.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {copy.seoSections.map((section) => (
            <div key={section.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-700">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{copy.faqTitle}</h2>
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

      <SosuaPartyBoatOptions
        options={optionCards}
        bookingProps={bookingProps}
        sectionTitle={copy.optionTitle}
        sectionSubtitle={copy.optionSubtitle}
      />
    </div>
  );
}
