import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getTransferPrice, resolveZoneId } from "@/data/traslado-pricing";
import StructuredData from "@/components/schema/StructuredData";
import {
  ECUADOR_SUPPORT_EMAIL,
  ECUADOR_SUPPORT_PHONE,
  buildGoogleMapsUrl,
  getPriceValidUntil,
  PROACTIVITIS_EMAIL,
  PROACTIVITIS_LOCALBUSINESS,
  PROACTIVITIS_PHONE,
  PROACTIVITIS_URL,
  SAME_AS_URLS
} from "@/lib/seo";
import { Locale, translate } from "@/lib/translations";

type LandingLevel = "country" | "destination" | "microzone";

type LandingContext = {
  level: LandingLevel;
  country: { id: string; name: string; slug: string; heroImage?: string; shortDescription?: string };
  destination?: {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    heroImage?: string;
  };
  microZone?: { id: string; name: string; slug: string };
};

const getLevelCopy = (level: LandingLevel, locale: Locale) => ({
  badge: translate(locale, `transfer.level.${level}.badge`),
  summary: translate(locale, `transfer.level.${level}.summary`)
});

const DURATION_ESTIMATES: Record<string, number> = {
  "punta-cana": 35,
  "bavaro": 30,
  "cap-cana": 25,
  "bavaro-cortecito": 27,
  "los-corales": 28,
  "arena-gorda": 28,
  "uvero-alto": 45,
  "miches": 65,
  "santo-domingo": 80,
  "quito": 40,
  "manta": 115,
  "cuenca": 180
};

const estimateDurationMinutes = (microZoneSlug: string | null, destinationSlug: string | null) => {
  const key = (microZoneSlug ?? destinationSlug ?? "").toLowerCase().replace(/_/g, "-");
  if (!key) return 45;
  return DURATION_ESTIMATES[key] ?? 45;
};

const resolveHeroImageForContext = (context: LandingContext) => {
  if (context.level === "microzone") {
    return context.destination?.heroImage ?? context.country.heroImage;
  }
  if (context.level === "destination") {
    return context.destination?.heroImage ?? context.country.heroImage;
  }
  return context.country.heroImage;
};

const buildSegmentsContext = async (segments: string[]): Promise<LandingContext | null> => {
  if (!segments.length || segments.length > 3) return null;
  if (segments[0] === "punta-cana" && segments[1]?.startsWith("to-")) return null;
  const countrySlug = segments[0];
  const country = await prisma.country.findUnique({
    where: { slug: countrySlug },
    select: {
      id: true,
      name: true,
      slug: true,
      heroImage: true,
      shortDescription: true
    }
  });
  if (!country) return null;

  let destination;
  if (segments.length >= 2) {
    const destinationSlug = segments[1];
    destination = await prisma.destination.findFirst({
      where: {
        slug: destinationSlug,
        countryId: country.id
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        heroImage: true
      }
    });
    if (!destination) return null;
  }

  let microZone;
  if (segments.length === 3) {
    const microZoneSlug = segments[2];
    microZone = await prisma.microZone.findFirst({
      where: {
        slug: microZoneSlug,
        destinationId: destination?.id
      }
    });
    if (!microZone) return null;
  }

  const level: LandingLevel =
    segments.length === 3 ? "microzone" : segments.length === 2 ? "destination" : "country";

  return {
    level,
    country: {
      id: country.id,
      name: country.name,
      slug: country.slug,
      heroImage: country.heroImage ?? undefined,
      shortDescription: country.shortDescription ?? undefined
    },
    destination: destination
      ? {
          id: destination.id,
          name: destination.name,
          slug: destination.slug,
          shortDescription: destination.shortDescription ?? undefined,
          heroImage: destination.heroImage ?? undefined
        }
      : undefined,
    microZone: microZone
      ? { id: microZone.id, name: microZone.name, slug: microZone.slug }
      : undefined
  };
};

const DEFAULT_TITLE = "Traslados Proactivitis";
const DEFAULT_DESCRIPTION = "Descubre la red global de traslados premium de Proactivitis.";
const DEFAULT_METADATA_IMAGE = "https://www.proactivitis.com/transfer/sedan.png";
const TRANSFER_BANNER_IMAGE =
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg";
const TRANSFER_BASE_URL = "https://proactivitis.com/traslado";

const resolveLocale = async (): Promise<Locale> => {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-proactivitis-locale");
  if (localeHeader === "en" || localeHeader === "fr") return localeHeader;
  return "es";
};

const buildTransferBasePath = (locale: Locale) => (locale === "es" ? "/traslado" : `/${locale}/traslado`);
const META_DESCRIPTION_MIN = 120;
const META_DESCRIPTION_MAX = 160;

const ensureContains = (value: string, term: string) => {
  const normalizedValue = value.toLowerCase();
  const normalizedTerm = term.toLowerCase();
  if (normalizedValue.includes(normalizedTerm)) return value;
  return `${value} ${term}`.trim();
};

const trimMetaDescription = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length <= META_DESCRIPTION_MAX) return trimmed;
  return `${trimmed.slice(0, META_DESCRIPTION_MAX - 3).trimEnd()}...`;
};

const extendMetaDescription = (value: string, extra: string) => {
  const trimmed = value.trim();
  if (trimmed.length >= META_DESCRIPTION_MIN) return trimmed;
  return `${trimmed} ${extra}`.trim();
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ segments?: string[] }>;
}): Promise<Metadata> {
  const LOCALE = await resolveLocale();
  const resolvedParams = await params;
  const segments = resolvedParams.segments ?? [];
  if (!segments.length) return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  const context = await buildSegmentsContext(segments);
  if (!context) return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };

  const { level, country, destination, microZone } = context;
  const countryName = country.name;
  const destinationName = destination?.name ?? "";
  const hotelName = microZone?.name ?? "";
  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  const keywords: string[] = [];

  if (level === "country") {
    title = translate(LOCALE, "transfer.metadata.title.country", { country: countryName });
    description = translate(LOCALE, "transfer.metadata.description.country", { country: countryName });
    description = ensureContains(description, countryName);
    description = ensureContains(description, country.slug.replace(/-/g, " "));
    keywords.push(`proactivitis ${countryName}`);
  } else if (level === "destination" && destination) {
    title = translate(LOCALE, "transfer.metadata.title.destination", { destination: destinationName });
    description =
      destination.shortDescription ??
      translate(LOCALE, "transfer.metadata.description.destination", { destination: destinationName });
    description = ensureContains(description, destinationName);
    description = ensureContains(description, countryName);
    keywords.push(`transporte ${destinationName}`, `proactivitis ${countryName}`);
  } else if (level === "microzone" && microZone) {
    title = translate(LOCALE, "transfer.metadata.title.microzone", { hotel: hotelName });
    description = translate(LOCALE, "transfer.metadata.description.microzone", {
      hotel: hotelName,
      country: countryName
    });
    description = ensureContains(description, hotelName);
    description = ensureContains(description, countryName);
    keywords.push(`traslado ${hotelName}`, `transporte ${destinationName ?? countryName}`, `proactivitis ${countryName}`);
  }

  if (!keywords.length) {
    keywords.push(`proactivitis ${countryName}`);
  }

  if (level === "destination") {
    description = extendMetaDescription(
      description,
      `Reserva traslados privados en ${destinationName} con tarifa fija, vehiculos verificados y soporte 24/7.`
    );
  } else if (level === "country") {
    description = extendMetaDescription(
      description,
      `Reserva traslados privados en ${countryName} con tarifa fija, conductores verificados y soporte 24/7.`
    );
  } else if (level === "microzone") {
    description = extendMetaDescription(
      description,
      `Traslados privados con confirmacion inmediata y soporte 24/7.`
    );
  }
  description = trimMetaDescription(description);

  const heroImage = resolveHeroImageForContext(context) ?? DEFAULT_METADATA_IMAGE;
  const basePath = buildTransferBasePath(LOCALE);
  const pageUrl =
    segments.length === 0
      ? `${PROACTIVITIS_URL}${basePath}`
      : `${PROACTIVITIS_URL}${basePath}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Proactivitis",
      type: "website",
      images: [
        {
          url: heroImage,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage]
    },
    keywords: keywords.filter(Boolean),
    alternates: {
      canonical: pageUrl,
      languages: {
        es: `/traslado/${segments.join("/")}`.replace(/\/$/, ""),
        en: `/en/traslado/${segments.join("/")}`.replace(/\/$/, ""),
        fr: `/fr/traslado/${segments.join("/")}`.replace(/\/$/, "")
      }
    }
  };
}

type TrasladoLandingProps = {
  params: Promise<{ segments?: string[] }>;
};

export default async function TrasladoHierarchicalLanding({ params }: TrasladoLandingProps) {
  const LOCALE = await resolveLocale();
  const resolvedParams = await params;
  const segments = resolvedParams.segments ?? [];
  const context = await buildSegmentsContext(segments);
  if (!context) {
    notFound();
  }

  const { level, country, destination, microZone } = context;
  const levelCopy = getLevelCopy(level, LOCALE);
  const destinationName = destination?.name ?? "";
  const microzoneName = microZone?.name ?? "";

  const heroTitle =
    level === "microzone"
      ? translate(LOCALE, "transfer.hero.title.microzone", { name: microzoneName })
      : level === "destination"
      ? translate(LOCALE, "transfer.hero.title.destination", { name: destinationName })
      : translate(LOCALE, "transfer.hero.title.country", { name: country.name });

  const heroSubtitle =
    level === "country"
      ? translate(LOCALE, "transfer.hero.subtitle.country", { country: country.name })
      : level === "destination"
      ? translate(LOCALE, "transfer.hero.subtitle.destination", { destination: destinationName })
      : translate(LOCALE, "transfer.hero.subtitle.microzone", { hotel: microzoneName });

  const basePath = buildTransferBasePath(LOCALE);
  const localPath = (path: string) => (LOCALE === "es" ? path : `/${LOCALE}${path}`);
  const homeLabel = LOCALE === "en" ? "Home" : LOCALE === "fr" ? "Accueil" : "Inicio";
  const toursCtaLabel =
    LOCALE === "en" ? "See tours and experiences" : LOCALE === "fr" ? "Voir tours et experiences" : "Ver tours y experiencias";
  const callToAction = basePath;
  const toursPath = LOCALE === "es" ? "/tours" : `/${LOCALE}/tours`;
  const homeHref = LOCALE === "es" ? PROACTIVITIS_URL : `${PROACTIVITIS_URL}/${LOCALE}`;
  const breadcrumbItems = [
    { name: homeLabel, href: homeHref },
    { name: country.name, href: `${basePath}/${country.slug}` },
    ...(destination
      ? [
          {
            name: destination.name,
            href: `${basePath}/${country.slug}/${destination.slug}`
          }
        ]
      : []),
    ...(microZone
      ? [
          {
            name: microZone.name,
            href: `${basePath}/${country.slug}/${destination?.slug ?? country.slug}/${microZone.slug}`
          }
        ]
      : [])
  ];
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href
    }))
  };
  const highlightHotelName = microZone?.name ?? destination?.name ?? country.name;
  const durationMinutes = estimateDurationMinutes(microZone?.slug ?? null, destination?.slug ?? null);
  const meetingDestinationName = destination?.name ?? country.name;
  const durationCopy = translate(LOCALE, "transfer.detail.duration", {
    hotel: highlightHotelName,
    minutes: durationMinutes
  });
  const meetingCopy = translate(LOCALE, "transfer.detail.meeting", {
    destination: meetingDestinationName
  });
  const showTransferCopy = Boolean(destination || microZone);

  const destinationZoneId = resolveZoneId({
    microZoneSlug: microZone?.slug ?? undefined,
    microZoneName: microZone?.name ?? undefined,
    destinationName: destination?.name ?? country.name
  });
  const sedanPrice = getTransferPrice("PUJ_BAVARO", destinationZoneId, "SEDAN");
  const schemaOriginLabel = `Aeropuerto Internacional de ${country.name}`;
  const schemaDestinationLabel = microZone?.name ?? destination?.name ?? country.name;
  const schemaAreaServed = [
    { "@type": "Place", name: country.name },
    ...(destination ? [{ "@type": "Place", name: destination.name }] : []),
    ...(microZone ? [{ "@type": "Place", name: microZone.name }] : [])
  ];
  const heroImage = resolveHeroImageForContext(context) ?? DEFAULT_METADATA_IMAGE;
  const pageUrl =
    segments.length === 0
      ? `${PROACTIVITIS_URL}${basePath}`
      : `${PROACTIVITIS_URL}${basePath}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
  const priceValidUntil = getPriceValidUntil();
  const locationMapUrl = buildGoogleMapsUrl(schemaDestinationLabel);
  const sanitizedSegments = segments.filter(Boolean).map((segment) =>
    segment.toUpperCase().replace(/[^A-Z0-9]/g, "")
  );
  const isEcuador =
    country.slug.toLowerCase() === "ecuador" || country.slug.toLowerCase() === "ec";
  const ecuadorIdentifier =
    isEcuador && sanitizedSegments.length
      ? `EC-TRANSFER-${sanitizedSegments.join("-")}`
      : undefined;
  const ecuadorLocation = isEcuador
    ? { "@type": "Place", name: country.name, addressCountry: "EC" }
    : undefined;
  const providerContactPoint = {
    ...PROACTIVITIS_LOCALBUSINESS.contactPoint,
    email: isEcuador ? ECUADOR_SUPPORT_EMAIL : PROACTIVITIS_EMAIL,
    telephone: isEcuador ? ECUADOR_SUPPORT_PHONE : PROACTIVITIS_PHONE
  };
  const providerAddress = {
    ...PROACTIVITIS_LOCALBUSINESS.address,
    addressCountry: isEcuador ? "EC" : PROACTIVITIS_LOCALBUSINESS.address.addressCountry
  };
  const provider = {
    ...PROACTIVITIS_LOCALBUSINESS,
    hasMap: locationMapUrl,
    email: isEcuador ? ECUADOR_SUPPORT_EMAIL : PROACTIVITIS_EMAIL,
    telephone: isEcuador ? ECUADOR_SUPPORT_PHONE : PROACTIVITIS_PHONE,
    contactPoint: providerContactPoint,
    address: providerAddress
  };

  const landingSchema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: `Traslado desde ${schemaOriginLabel} a ${schemaDestinationLabel}`,
    description: heroSubtitle,
    image: heroImage,
    provider,
    publicAccess: true,
    areaServed: schemaAreaServed,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: sedanPrice ?? 0,
      priceCurrency: "USD",
      priceValidUntil,
      url: pageUrl,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        doesNotShip: true
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted"
      }
    },
    hasMap: locationMapUrl,
    sameAs: SAME_AS_URLS,
    ...(ecuadorIdentifier ? { identifier: ecuadorIdentifier } : {}),
    ...(ecuadorLocation ? { location: ecuadorLocation } : {})
  };

  const countryDestinations =
    level === "country"
      ? await prisma.destination.findMany({
          where: { countryId: country.id },
          orderBy: { name: "asc" },
          select: { name: true, slug: true, shortDescription: true }
        })
      : [];

  const microZones =
    level === "destination" && destination
      ? await prisma.microZone.findMany({
          where: { destinationId: destination.id },
          orderBy: { name: "asc" },
          select: { name: true, slug: true }
        })
      : [];

  const availableHotels =
    level === "destination" && destination
      ? await prisma.location.findMany({
          where: { destinationId: destination.id },
          orderBy: { name: "asc" },
          select: { name: true, slug: true }
        })
      : level === "microzone" && microZone
      ? await prisma.location.findMany({
          where: { microZoneId: microZone.id },
          orderBy: { name: "asc" },
          select: { name: true, slug: true }
        })
      : [];
  const relatedHotels =
    destination && destination.id
      ? await prisma.location.findMany({
          where: { destinationId: destination.id },
          orderBy: { name: "asc" },
          select: { name: true, slug: true },
          take: 4
        })
      : [];
  const nearbyItems = [
    {
      label: `Aeropuerto Internacional de ${country.name}`,
      href: localPath(`/traslado/${country.slug}`)
    },
    ...(destination
      ? [
          {
            label: `Tours y experiencias en ${destination.name}`,
            href: localPath(`/tours?destination=${encodeURIComponent(destination.slug)}`)
          }
        ]
      : []),
    ...relatedHotels.map((hotel) => ({
      label: hotel.name,
      href: localPath(`/recogida/${hotel.slug}`)
    }))
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredData data={landingSchema} />
      <StructuredData data={breadcrumbSchema} />
      <section className="relative flex min-h-[360px] items-center overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0">
          <Image
            src={TRANSFER_BANNER_IMAGE}
            alt="Traslados Proactivitis"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/55 md:bg-slate-900/65" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <nav className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
            {breadcrumbItems.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-1">
                {index > 0 && <span aria-hidden>&gt;</span>}
                <Link href={item.href} className="hover:text-white">{item.name}</Link>
              </span>
            ))}
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">{levelCopy.badge}</p>
          <h1 className="text-4xl font-bold text-white">{heroTitle}</h1>
          <p className="max-w-3xl text-lg text-white/90">{heroSubtitle}</p>
          <p className="text-sm text-white/70">{levelCopy.summary}</p>
          <div className="flex flex-wrap gap-3">
              <Link
                href={callToAction}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
              >
                {translate(LOCALE, "transfer.button.primary")}
              </Link>
            <Link
              href={toursPath}
              className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white"
            >
              {toursCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10">
        {level === "country" && (
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Destinos</p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Explora los destinos confirmados en {country.name}
                </h2>
              </div>
              <span className="text-xs uppercase tracking-[0.4em] text-emerald-600">Padre</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {countryDestinations.map((destinationItem) => (
                <Link
                  key={destinationItem.slug}
                  href={localPath(`/traslado/${country.slug}/${destinationItem.slug}`)}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-300 hover:shadow-xl"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Destino</p>
                    <h3 className="text-xl font-semibold text-slate-900">{destinationItem.name}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {destinationItem.shortDescription ?? "Tarifas fijas, zonas claras y proveedores certificados."}
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Ver microzonas
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(level === "destination" || level === "microzone") && destination && (
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Padre - Destino</p>
                <h2 className="text-2xl font-bold text-slate-900">{destination.name}</h2>
                <p className="text-sm text-slate-600">
                  {destination.shortDescription ?? "Selecciona la microzona que mejor conecta tu hotel con el aeropuerto."}
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.4em] text-slate-600">Padre</span>
            </div>
            {microZones.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                {microZones.map((zone) => (
                  <Link
                    key={zone.slug}
                    href={localPath(`/traslado/${country.slug}/${destination.slug}/${zone.slug}`)}
                    className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Microzona</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{zone.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">Ver hoteles y traslados</p>
                  </Link>
                ))}
              </div>
            )}
            {level === "microzone" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Nieto - Hoteles</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {availableHotels.map((hotel) => (
                    <div
                      key={hotel.slug}
                      className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300"
                    >
                      <p className="text-lg font-semibold text-slate-900">{hotel.name}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Lugar de aterrizaje</p>
                      <Link
                        href={localPath(`/recogida/${hotel.slug}`)}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
                      >
                        Ver tours y traslados desde aqui
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {level !== "microzone" && availableHotels.length > 0 && (
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Nietos - Hoteles</p>
            <div className="grid gap-4 md:grid-cols-3">
              {availableHotels.slice(0, 6).map((hotel) => (
                <Link
                  key={hotel.slug}
                  href={localPath(`/recogida/${hotel.slug}`)}
                  className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 transition hover:border-emerald-300"
                >
                  <p className="text-lg font-semibold text-slate-900">{hotel.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservar traslado</p>
                </Link>
              ))}
            </div>
          </section>
        )}
        {showTransferCopy && (
          <section className="space-y-3 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Detalle rapido</p>
            <h2 className="text-2xl font-bold text-slate-900">Informacion del servicio</h2>
            <p className="text-sm text-slate-600">{durationCopy}</p>
            <p className="text-sm text-slate-600">{meetingCopy}</p>
          </section>
        )}
        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              {translate(LOCALE, "transfer.longform.eyebrow")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {translate(LOCALE, "transfer.longform.title")}
            </h2>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>{translate(LOCALE, "transfer.longform.body1")}</p>
              <p>{translate(LOCALE, "transfer.longform.body2")}</p>
              <p>{translate(LOCALE, "transfer.longform.body3")}</p>
            </div>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              {translate(LOCALE, "transfer.longform2.eyebrow")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {translate(LOCALE, "transfer.longform2.title")}
            </h2>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>{translate(LOCALE, "transfer.longform2.body1")}</p>
              <p>{translate(LOCALE, "transfer.longform2.body2")}</p>
              <p>{translate(LOCALE, "transfer.longform2.body3")}</p>
            </div>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              {translate(LOCALE, "transfer.longform3.eyebrow")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {translate(LOCALE, "transfer.longform3.title")}
            </h2>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>{translate(LOCALE, "transfer.longform3.body1")}</p>
              <p>{translate(LOCALE, "transfer.longform3.body2")}</p>
              <p>{translate(LOCALE, "transfer.longform3.body3")}</p>
            </div>
          </article>
        </section>
        {nearbyItems.length > 0 && (
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Destinos cercanos</p>
                <h2 className="text-2xl font-bold text-slate-900">Explora puntos vinculados a esta ciudad</h2>
              </div>
              <span className="text-xs uppercase tracking-[0.4em] text-emerald-600">Red local</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Enlace relacionado</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{item.label}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
