import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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
import { Locale, translate, es } from "@/lib/translations";

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

const estimateDurationMinutes = (microZoneSlug?: string | null, destinationSlug?: string | null) => {
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
const TRANSFER_BASE_URL = "https://proactivitis.com/traslado";
const LOCALE: Locale = es;
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
  const pageUrl =
    segments.length === 0
      ? `${TRANSFER_BASE_URL}`
      : `${TRANSFER_BASE_URL}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;

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
      canonical: pageUrl
    }
  };
}

type TrasladoLandingProps = {
  params: Promise<{ segments?: string[] }>;
};

export default async function TrasladoHierarchicalLanding({ params }: TrasladoLandingProps) {
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

  const callToAction = `/traslado`;
  const breadcrumbItems = [
    { name: "Inicio", href: PROACTIVITIS_URL },
    { name: country.name, href: `${TRANSFER_BASE_URL}/${country.slug}` },
    ...(destination
      ? [
          {
            name: destination.name,
            href: `/traslado/${country.slug}/${destination.slug}`
          }
        ]
      : []),
    ...(microZone
      ? [
          {
            name: microZone.name,
            href: `/traslado/${country.slug}/${destination?.slug ?? country.slug}/${microZone.slug}`
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
  const durationMinutes = estimateDurationMinutes(microZone?.slug, destination?.slug);
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
      ? `${TRANSFER_BASE_URL}`
      : `${TRANSFER_BASE_URL}/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
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
      url: pageUrl
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
      href: `/traslado/${country.slug}`
    },
    ...(destination
      ? [
          {
            label: `Tours y experiencias en ${destination.name}`,
            href: `/tours?destination=${encodeURIComponent(destination.slug)}`
          }
        ]
      : []),
    ...relatedHotels.map((hotel) => ({
      label: hotel.name,
      href: `/recogida/${hotel.slug}`
    }))
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredData data={landingSchema} />
      <StructuredData data={breadcrumbSchema} />
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <nav className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            {breadcrumbItems.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-1">
                {index > 0 && <span aria-hidden>›</span>}
                <Link href={item.href}>{item.name}</Link>
              </span>
            ))}
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">{levelCopy.badge}</p>
          <h1 className="text-4xl font-bold text-slate-900">{heroTitle}</h1>
          <p className="max-w-3xl text-lg text-slate-600">{heroSubtitle}</p>
          <p className="text-sm text-slate-500">{levelCopy.summary}</p>
          <div className="flex flex-wrap gap-3">
              <Link
                href={callToAction}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
              >
                {translate(LOCALE, "transfer.button.primary")}
              </Link>
            <Link
              href="/tours"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
            >
              Ver tours y experiencias
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
                  href={`/traslado/${country.slug}/${destinationItem.slug}`}
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
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Padre · Destino</p>
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
                    href={`/traslado/${country.slug}/${destination.slug}/${zone.slug}`}
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
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Nieto · Hoteles</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {availableHotels.map((hotel) => (
                    <div
                      key={hotel.slug}
                      className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300"
                    >
                      <p className="text-lg font-semibold text-slate-900">{hotel.name}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Lugar de aterrizaje</p>
                      <Link
                        href={`/recogida/${hotel.slug}`}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
                      >
                        Ver tours y traslados desde aquí
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
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Nietos · Hoteles</p>
            <div className="grid gap-4 md:grid-cols-3">
              {availableHotels.slice(0, 6).map((hotel) => (
                <Link
                  key={hotel.slug}
                  href={`/recogida/${hotel.slug}`}
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
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Detalle rápido</p>
            <h2 className="text-2xl font-bold text-slate-900">Información del servicio</h2>
            <p className="text-sm text-slate-600">{durationCopy}</p>
            <p className="text-sm text-slate-600">{meetingCopy}</p>
          </section>
        )}
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
