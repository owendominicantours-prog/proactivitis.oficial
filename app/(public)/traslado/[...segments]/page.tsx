import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

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

const levelLabels: Record<LandingLevel, { badge: string; summary: string }> = {
  country: {
    badge: "Abuelo · País",
    summary: "Cobertura nacional y rutas homologadas de traslados en un solo lugar."
  },
  destination: {
    badge: "Padre · Destino",
    summary: "Programamos zonas específicas con tarifas claras y proveedores verificados."
  },
  microzone: {
    badge: "Nieto · Microzona",
    summary: "Hoteles y puntos de recogida definidos para transmitir confianza y claridad."
  }
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
  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;

  if (level === "country") {
    title = `Traslados en ${country.name} | Proactivitis`;
    description = `Covering ${country.name} with safe, hierarchical traslados and regional suppliers.`;
  } else if (level === "destination" && destination) {
    title = `Traslados en ${destination.name} | Proactivitis`;
    description = `${destination.shortDescription ?? "Reservas con precios fijos y operadores certificados."}`;
  } else if (level === "microzone" && microZone) {
    title = `${microZone.name} · Traslados Proactivitis`;
    description = `Descubre los hoteles y vehículos disponibles en ${microZone.name} con tarifas transparentes.`;
  }

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
    }
  };

  return { title, description };
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
  const levelCopy = levelLabels[level];

  const heroTitle =
    level === "microzone"
      ? `${microZone?.name} · Recogida premium`
      : level === "destination"
      ? `${destination?.name} · Zonas de traslado`
      : `Traslados en ${country.name}`;

  const heroSubtitle =
    level === "country"
      ? "Descubre la red de destinos, microzonas y hoteles que operan con nuestros traslados."
      : level === "destination"
      ? "Elige la microzona que conecta tu hotel con el aeropuerto y recibe la tarifa clara."
      : "Elige tu hotel y confirma el punto exacto de recogida para sentir seguridad operativa.";

  const callToAction = `/traslado`;

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

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50 to-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">{levelCopy.badge}</p>
          <h1 className="text-4xl font-bold text-slate-900">{heroTitle}</h1>
          <p className="max-w-3xl text-lg text-slate-600">{heroSubtitle}</p>
          <p className="text-sm text-slate-500">{levelCopy.summary}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={callToAction}
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
            >
              Reservar un traslado
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
      </main>
    </div>
  );
}
