import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { TourFilters } from "@/components/public/TourFilters";
import type { DurationOption } from "@/components/public/TourFilters";
import { buildTourFilter, type TourSearchParams } from "@/lib/filterBuilder";
import { getZoneInfo } from "@/lib/destinationInfo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params
}: {
  params: Promise<{ countrySlug: string; destinationSlug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const destination = await prisma.destination.findFirst({
    where: {
      slug: resolvedParams.destinationSlug,
      country: { slug: resolvedParams.countrySlug }
    },
    include: { country: true }
  });

  if (!destination) return {};

  const title = `Tours y traslados en ${destination.name} | Proactivitis`;
  const baseDescription =
    destination.shortDescription ??
    `Explora ${destination.name} en ${destination.country.name} con tours, excursiones y traslados verificados.`;
  const description = `${baseDescription} Reserva actividades con precios claros, recogida en hotel y soporte 24/7.`;

  return {
    title,
    description,
    keywords: [destination.name, destination.country.name, "tours", "excursiones", "traslados", "actividades", "Proactivitis"],
    alternates: {
      canonical: `/destinations/${destination.country.slug}/${destination.slug}`
    }
  };
}

export default async function DestinationPage({
  params,
  searchParams
}: {
  params: Promise<{ countrySlug: string; destinationSlug: string }>;
  searchParams?: Promise<TourSearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const destination = await prisma.destination.findFirst({
    where: {
      slug: resolvedParams.destinationSlug,
      country: { slug: resolvedParams.countrySlug }
    },
    include: {
      country: true,
      tours: {
        where: { status: "published" },
        select: {
          id: true,
          slug: true,
          title: true,
          heroImage: true,
          price: true,
          duration: true,
          language: true
        }
      }
    }
  });

  if (!destination) {
    notFound();
  }

  const filterParams: TourSearchParams = {
    ...(resolvedSearchParams ?? {}),
    country: destination.country.slug,
    destination: destination.slug
  };
  const where = buildTourFilter(filterParams);

  const tours = await prisma.tour.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      departureDestination: { include: { country: true } }
    },
    take: 24
  });

  const languages = Array.from(new Set(tours.map((t) => t.language).filter(Boolean))) as string[];
  const durations: DurationOption[] = Array.from(
    new Set(tours.map((t) => t.duration).filter(Boolean))
  ).map((duration) => ({
    value: duration,
    label: duration
  }));

  const zoneInfo = getZoneInfo(resolvedParams.countrySlug, resolvedParams.destinationSlug);

  return (
    <div className="bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Destino  {destination.name}
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">{destination.name}</h1>
          <p className="text-sm text-slate-600">
            {zoneInfo?.summary ??
              destination.shortDescription ??
              `Descubre tours desde ${destination.name}, parte de ${destination.country.name} con playas, cultura y guias expertos.`}
          </p>
        </div>
      </section>

      {zoneInfo && (
        <section className="mx-auto mb-8 mt-6 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 md:w-1/3">
              <Image
                src={zoneInfo.hero.image ?? "/fototours/fotosimple.jpg"}
                alt={zoneInfo.zone}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-3 md:w-2/3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{zoneInfo.hero.title}</p>
              <h2 className="text-3xl font-semibold text-slate-900">{zoneInfo.zone}</h2>
              <p className="text-sm text-slate-600">{zoneInfo.hero.subtitle}</p>
              <p className="text-sm text-slate-500">{zoneInfo.summary}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {zoneInfo.highlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-600">
                    {highlight}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Datos practicos</p>
                <p>Temporada: {zoneInfo.practical.bestSeason}</p>
                <p>Traslado: {zoneInfo.practical.transport}</p>
                <p>Tip local: {zoneInfo.practical.localTip}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <section className="mx-auto mt-6 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Guia rapida</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Tours, excursiones y traslados en {destination.name}</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-600">
          <p>Compara tours y actividades con salida desde {destination.name} y reservas con confirmacion inmediata.</p>
          <p>Incluimos datos claros de duracion, punto de encuentro y lo que esta incluido para elegir con seguridad.</p>
          <p>Si necesitas traslado, puedes coordinar ida, vuelta o rutas entre hoteles con soporte 24/7.</p>
        </div>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          <li>Excursiones con guias locales y operadores verificados.</li>
          <li>Opciones privadas o en grupo segun tu presupuesto.</li>
          <li>Recogida en hotel y horarios coordinados.</li>
          <li>Precios fijos y cancelacion flexible.</li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Como organizar tu visita a {destination.name}</h2>
        <p className="mt-3">
          Define tu horario ideal segun el clima y el tipo de experiencia: playa, cultura, aventura o gastronomia.
          Asi puedes combinar tours cortos con traslados puntuales y evitar tiempos muertos.
        </p>
        <p className="mt-3">
          Recomendamos confirmar el punto de recogida con antelacion y revisar la duracion estimada de cada actividad.
          Nuestro equipo valida la logistica para que llegues a tiempo y con comodidad.
        </p>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          <li>Rutas con salidas desde hotel.</li>
          <li>Opciones para familia y grupos.</li>
          <li>Soporte local en espanol e ingles.</li>
          <li>Confirmacion rapida y precios claros.</li>
        </ul>
      </section>

        <section>
          <TourFilters
            countries={[{ name: destination.country.name, slug: destination.country.slug }]}
            destinations={[
              { name: destination.name, slug: destination.slug, countrySlug: destination.country.slug }
            ]}
            languages={languages}
            durations={durations}
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Tours que salen de {destination.name}</h2>
          <p className="text-sm text-slate-500">
            Cada tour esta conectado a esta zona y respeta itinerarios locales, guias bilingues y logistica confiable.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {tours.map((tour) => (
              <Link
                key={tour.slug}
                href={`/tours/${tour.slug}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400"
              >
                <h3 className="text-lg font-semibold text-slate-900">{tour.title}</h3>
                <p className="text-xs text-slate-500">
                  Desde ${tour.price.toFixed(0)}  {tour.duration ?? "Duracion pendiente"}
                </p>
              </Link>
            ))}
            {tours.length === 0 && (
              <p className="text-sm text-slate-500">No hay tours publicados para esta zona aun.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
