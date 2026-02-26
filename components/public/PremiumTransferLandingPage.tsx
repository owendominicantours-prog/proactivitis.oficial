import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/translations";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { prisma } from "@/lib/prisma";
import PremiumTransferBookingWidget from "@/components/transfers/PremiumTransferBookingWidget";
import StructuredData from "@/components/schema/StructuredData";
import { PROACTIVITIS_URL, PROACTIVITIS_LOCALBUSINESS, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";
import { normalizeTextDeep } from "@/lib/text-format";
import {
  premiumTransferMarketLandings,
  type PremiumTransferMarketLanding
} from "@/data/premium-transfer-market-landings";

const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/18093949877";
const DOMINICAN_COUNTRY_CODES = ["RD", "DO", "DOMINICAN-REPUBLIC"];
const PREMIUM_AREA_HINTS = ["bavaro", "cap-cana", "uvero-alto", "arena-gorda", "punta-cana-resorts"];

const toAbsoluteImageUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}/transfer/suv.png`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const LABELS = {
  es: {
    eliteRoute: "Ruta premium recomendada",
    galleryTitle: "Galeria VIP",
    fleetCadillac: "Cadillac Escalade Class",
    fleetSuburban: "Chevrolet Suburban Class",
    connectedHotels: "Hoteles conectados para transfer VIP",
    certificationsTitle: "Certificaciones VIP",
    bookingFallback:
      "No hay destinos premium disponibles ahora mismo. Escribe por WhatsApp para cotizacion inmediata.",
    faqTitle: "Preguntas frecuentes VIP"
  },
  en: {
    eliteRoute: "Recommended premium route",
    galleryTitle: "VIP Gallery",
    fleetCadillac: "Cadillac Escalade Class",
    fleetSuburban: "Chevrolet Suburban Class",
    connectedHotels: "Connected hotels for VIP transfer",
    certificationsTitle: "VIP Certifications",
    bookingFallback: "No premium destinations available right now. Message us on WhatsApp for instant quote.",
    faqTitle: "VIP Frequently Asked Questions"
  },
  fr: {
    eliteRoute: "Itineraire premium recommande",
    galleryTitle: "Galerie VIP",
    fleetCadillac: "Cadillac Escalade Class",
    fleetSuburban: "Chevrolet Suburban Class",
    connectedHotels: "Hotels connectes pour transfert VIP",
    certificationsTitle: "Certifications VIP",
    bookingFallback:
      "Aucune destination premium disponible pour le moment. Ecrivez-nous sur WhatsApp pour un devis immediat.",
    faqTitle: "Questions frequentes VIP"
  }
} as const;

type Props = {
  locale: Locale;
  variant?: PremiumTransferMarketLanding;
};

export default async function PremiumTransferLandingPage({ locale, variant }: Props) {
  const content = normalizeTextDeep(await getPremiumTransferContentOverrides(locale));
  const copy = normalizeTextDeep(LABELS[locale] ?? LABELS.es);
  const heroTitle = variant?.heroTitle[locale] ?? content.heroTitle;
  const heroSubtitle = variant?.heroSubtitle[locale] ?? content.heroSubtitle;
  const seoTitle = variant?.seoTitle[locale] ?? content.seoTitle;
  const seoDescription = variant?.seoDescription[locale] ?? content.seoDescription;
  const variantKeyword = variant?.keyword[locale];
  const variantBodyTitle = variant?.bodyTitle[locale];
  const variantBodyIntro = variant?.bodyIntro[locale];

  let origin:
    | {
        id: string;
        slug: string;
        name: string;
      }
    | null = null;
  let origins: Array<{ id: string; slug: string; name: string }> = [];
  let locationOptions: Array<{ id: string; slug: string; name: string }> = [];
  let destinations: Array<{ id: string; slug: string; name: string }> = [];

  try {
    origins = await prisma.transferLocation.findMany({
      where: {
        type: "AIRPORT",
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        active: true
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 20
    });

    const allHotelsAndAirports = await prisma.transferLocation.findMany({
      where: {
        active: true,
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        type: { in: ["HOTEL", "AIRPORT"] }
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 500
    });
    locationOptions = allHotelsAndAirports;

    origin = await prisma.transferLocation.findFirst({
      where: {
        type: "AIRPORT",
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        active: true,
        OR: [{ slug: { contains: "punta-cana" } }, { slug: { contains: "puj" } }]
      },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true }
    });
    if (!origin) {
      origin = origins[0] ?? null;
    }

    destinations = await prisma.transferLocation.findMany({
      where: {
        type: "HOTEL",
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        active: true,
        zone: { slug: { contains: "punta-cana" } }
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 500
    });
    if (!destinations.length) {
      destinations = await prisma.transferLocation.findMany({
        where: {
          type: "HOTEL",
          countryCode: { in: DOMINICAN_COUNTRY_CODES },
          active: true
        },
        select: { id: true, slug: true, name: true },
        orderBy: { name: "asc" },
        take: 500
      });
    }
  } catch (error) {
    console.warn("premium-transfer: fallback mode without transfer locations", error);
  }

  const originFallback = {
    id: "",
    slug: "puj-airport",
    name: "Punta Cana International Airport (PUJ)"
  };
  const safeOrigin = origin ?? originFallback;
  const safeOrigins = origins.length ? origins : [safeOrigin];
  const safeLocationOptions = locationOptions.length ? locationOptions : [...safeOrigins, ...destinations];
  const canBook = safeLocationOptions.length > 1;
  const preferredDestinationHint =
    variant?.slug
      ?.split("-")
      .slice(-3)
      .join("-")
      .toLowerCase() ?? "";
  const matchedHint = PREMIUM_AREA_HINTS.find((item) => variant?.slug?.includes(item));

  const gallery = content.galleryImages ?? [];
  const bullets = content.vipBullets ?? [];
  const certifications = content.vipCertifications ?? [];

  const localizedBasePath = locale === "es" ? "/punta-cana/premium-transfer-services" : `/${locale}/punta-cana/premium-transfer-services`;
  const canonicalPath = variant ? `${localizedBasePath}/${variant.slug}` : localizedBasePath;
  const canonicalUrl = `${PROACTIVITIS_URL}${canonicalPath}`;
  const priceValidUntil = getPriceValidUntil();
  const homePath = locale === "es" ? "/" : `/${locale}`;
  const puntaCanaPath = locale === "es" ? "/punta-cana/traslado" : `/${locale}/punta-cana/traslado`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: heroTitle,
    description: heroSubtitle,
    serviceType: "Luxury Airport Transfer",
    areaServed: {
      "@type": "City",
      name: "Punta Cana"
    },
    provider: {
      ...PROACTIVITIS_LOCALBUSINESS
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      priceCurrency: "USD",
      priceValidUntil,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        doesNotShip: true,
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "DO"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        applicableCountry: "DO",
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
      }
    },
    sameAs: SAME_AS_URLS,
    ...(variantKeyword ? { keywords: variantKeyword } : {}),
    image: [
      toAbsoluteImageUrl(content.heroBackgroundImage),
      toAbsoluteImageUrl(content.heroSpotlightImage),
      toAbsoluteImageUrl(content.cadillacImage),
      toAbsoluteImageUrl(content.suburbanImage),
      ...(content.galleryImages ?? []).map((image) => toAbsoluteImageUrl(image))
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home",
        item: `${PROACTIVITIS_URL}${homePath}`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Punta Cana Transfers",
        item: `${PROACTIVITIS_URL}${puntaCanaPath}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: heroTitle,
        item: canonicalUrl
      }
    ]
  };

  const faqQuestions =
    locale === "es"
      ? [
          {
            q: "Puedo reservar un transfer VIP para hoy?",
            a: "Si hay disponibilidad de flota premium, confirmamos el servicio el mismo dia."
          },
          {
            q: "Monitorean retrasos de vuelo?",
            a: "Si, operamos con seguimiento de vuelo para ajustar la recogida automaticamente."
          },
          {
            q: "Solo trabajan con Cadillac y Suburban?",
            a: "Priorizamos SUVs premium como Cadillac Escalade y Chevrolet Suburban, sujetas a disponibilidad."
          }
        ]
      : locale === "fr"
      ? [
          {
            q: "Puis-je reserver un transfert VIP pour aujourd'hui ?",
            a: "Si la flotte premium est disponible, nous confirmons le service le jour meme."
          },
          {
            q: "Suivez-vous les retards de vol ?",
            a: "Oui, nous utilisons le suivi de vol pour ajuster automatiquement la prise en charge."
          },
          {
            q: "Travaillez-vous uniquement avec Cadillac et Suburban ?",
            a: "Nous privilegions les SUV premium comme Cadillac Escalade et Chevrolet Suburban selon disponibilite."
          }
        ]
      : [
          {
            q: "Can I book a VIP transfer for today?",
            a: "If premium fleet is available, we can confirm same-day service."
          },
          {
            q: "Do you track flight delays?",
            a: "Yes, we monitor flights and adjust pickup time automatically."
          },
          {
            q: "Do you only work with Cadillac and Suburban?",
            a: "We prioritize premium SUVs such as Cadillac Escalade and Chevrolet Suburban, subject to availability."
          }
        ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqQuestions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seoTitle,
    description: seoDescription,
    url: canonicalUrl,
    inLanguage: locale,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: toAbsoluteImageUrl(content.heroBackgroundImage || content.heroSpotlightImage)
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Proactivitis",
      url: PROACTIVITIS_URL
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={webPageSchema} />

      <section className="relative overflow-hidden border-b border-amber-200/20">
        <div className="absolute inset-0">
          <Image
            src={content.heroBackgroundImage || "/transfer/suv.png"}
            alt={heroTitle || "Premium transfer"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/35" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.2fr,1fr] md:py-24">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-amber-100">
              {content.heroBadge}
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
              {heroTitle}
            </h1>
            <p className="max-w-2xl text-lg text-slate-200 md:text-xl">{heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#vip-booking"
                className="rounded-full bg-amber-300 px-6 py-3 text-xs font-black uppercase tracking-[0.28em] text-slate-900 transition hover:bg-amber-200"
              >
                {content.ctaPrimaryLabel}
              </a>
              <Link
                href={WHATSAPP_LINK}
                className="rounded-full border border-white/50 px-6 py-3 text-xs font-bold uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
              >
                {content.ctaSecondaryLabel}
              </Link>
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
              {copy.eliteRoute}: {safeOrigin.name} {"->"} Punta Cana Resorts
            </p>
          </div>
          <div className="relative min-h-[380px] overflow-hidden rounded-[34px] border border-amber-200/30 shadow-[0_40px_90px_rgba(0,0,0,0.45)]">
            <Image
              src={content.heroSpotlightImage || content.lifestyleImage || "/transfer/sedan.png"}
              alt={heroTitle || "VIP spotlight"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      <section id="vip-booking" className="mx-auto max-w-7xl px-4 py-12">
        {canBook ? (
          <PremiumTransferBookingWidget
            locale={locale}
            origins={safeOrigins}
            destinations={destinations.length ? destinations : safeLocationOptions}
            title={content.bookingTitle || "Book your premium transfer"}
            cadillacImage={content.cadillacImage}
            suburbanImage={content.suburbanImage}
            preferredDestinationHint={matchedHint ?? preferredDestinationHint}
          />
        ) : (
          <div className="rounded-2xl border border-amber-200/30 bg-slate-900/70 p-6 text-sm text-amber-100">
            {copy.bookingFallback}
          </div>
        )}
      </section>

      {destinations.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{copy.connectedHotels}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(variant ? destinations : destinations.slice(0, 12)).map((hotel) => (
                <Link
                  key={hotel.id}
                  href={
                    locale === "es"
                      ? `/transfer/${safeOrigin.slug}-to-${hotel.slug}`
                      : `/${locale}/transfer/${safeOrigin.slug}-to-${hotel.slug}`
                  }
                  className="rounded-xl border border-amber-200/25 bg-slate-800/70 px-3 py-3 text-sm text-slate-100 transition hover:border-amber-200/60"
                >
                  {hotel.name}
                </Link>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {variant && destinations.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
            {variantKeyword ? <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{variantKeyword}</p> : null}
            {variantBodyTitle ? <h2 className="mt-2 text-2xl font-semibold text-white">{variantBodyTitle}</h2> : null}
            {variantBodyIntro ? <p className="mt-3 text-sm leading-relaxed text-slate-200">{variantBodyIntro}</p> : null}
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {locale === "es"
                ? "Cobertura hotelera completa en esta landing premium: "
                : locale === "fr"
                ? "Couverture hoteliere complete sur cette landing premium : "
                : "Full hotel coverage in this premium landing: "}
              {destinations.map((hotel) => hotel.name).join(", ")}.
            </p>
          </article>
        </section>
      ) : null}

      {!variant ? (
      <section className="mx-auto max-w-7xl px-4 pb-12">
          <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              {locale === "es" ? "Mas rutas premium en Punta Cana" : locale === "fr" ? "Plus d itineraires premium a Punta Cana" : "More premium routes in Punta Cana"}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {premiumTransferMarketLandings.map((item) => (
                <Link
                  key={item.slug}
                  href={
                    locale === "es"
                      ? `/punta-cana/premium-transfer-services/${item.slug}`
                      : `/${locale}/punta-cana/premium-transfer-services/${item.slug}`
                  }
                  className="rounded-xl border border-amber-200/25 bg-slate-800/70 px-3 py-3 text-sm text-slate-100 transition hover:border-amber-200/60"
                >
                  {item.keyword[locale]}
                </Link>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 md:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-900/60">
          <div className="relative h-64">
            <Image
              src={content.cadillacImage || "/transfer/suv.png"}
              alt="Cadillac premium transfer"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200">{copy.fleetCadillac}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Cadillac Escalade</h3>
          </div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-900/60">
          <div className="relative h-64">
            <Image
              src={content.suburbanImage || "/transfer/suv.png"}
              alt="Suburban premium transfer"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-200">{copy.fleetSuburban}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Chevrolet Suburban</h3>
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-[1.3fr,1fr]">
        <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{content.experienceTitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{content.experienceBody}</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-100">
            {bullets.map((bullet) => (
              <li key={bullet} className="rounded-xl border border-amber-200/20 bg-slate-800/60 px-4 py-3">
                {bullet}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{copy.galleryTitle}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {gallery.slice(0, 4).map((image, index) => (
              <div key={image + index} className="relative h-28 overflow-hidden rounded-xl">
                <Image src={image} alt={`Premium gallery ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </article>
      </section>

      {certifications.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{copy.certificationsTitle}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {certifications.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-amber-200/20 bg-slate-800/60 p-4"
                >
                  <span className="mt-0.5 text-base text-amber-200">✓</span>
                  <p className="text-sm text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <article className="rounded-3xl border border-amber-200/20 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{copy.faqTitle}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {faqQuestions.map((item) => (
              <div key={item.q} className="rounded-xl border border-amber-200/20 bg-slate-800/60 p-4">
                <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-xs text-slate-200">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
