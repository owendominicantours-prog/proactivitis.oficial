import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const RECENT_TOURS_LIMIT = 6;

type SearchParams = {
  bookingCode?: string;
};

type RecogidaPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
};

type TourWithDeparture = Prisma.TourGetPayload<{
  include: {
    departureDestination: { select: { name: true; slug: true; country: { select: { slug: true } } } };
  };
}>;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = await prisma.location.findUnique({ where: { slug } });
  if (!location) {
    return {
      title: "Recogidas en Proactivitis",
      description: "Encuentra tours y traslados con la confianza de Proactivitis."
    };
  }

  return {
    title: `Tours y Traslados desde ${location.name} | Proactivitis`,
    description: `Explora tours premium y traslados seguros que salen desde ${location.name}.`
  };
}

const buildTourUrl = (tour: { slug: string }, locationSlug: string, bookingCode?: string) => {
  const params = new URLSearchParams({
    hotelSlug: locationSlug
  });
  if (bookingCode) {
    params.set("bookingCode", bookingCode);
  }
  return `/tours/${tour.slug}/recogida/${locationSlug}?${params.toString()}`;
};

export default async function RecogidaPage({ params, searchParams }: RecogidaPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const bookingCode = resolvedSearchParams?.bookingCode;

  let location = null;
  try {
    location = await prisma.location.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        microZone: true,
        destination: true,
        country: true
      }
    });
  } catch (error) {
    console.error("Error cargando location para slug", { slug: resolvedParams.slug, error });
    throw error;
  }

  if (!location) {
    console.error("Location no encontrada", { slug: resolvedParams.slug });
    notFound();
  }

  const bookingLabel = `Reservar Buggy con recogida en ${location.name}`;
  const baseCountryCondition = { countryId: location.countryId };
  const orFilters = [];
  if (location.microZoneId) {
    orFilters.push({ ...baseCountryCondition, microZoneId: location.microZoneId });
  }
  if (location.destinationId) {
    orFilters.push({ ...baseCountryCondition, destinationId: location.destinationId });
  }
  orFilters.push(baseCountryCondition);
  orFilters.push({
    ...baseCountryCondition,
    category: { contains: "Nacional", mode: "insensitive" }
  });
  if (location.destination?.name?.toLowerCase().includes("punta cana")) {
    orFilters.push({
      ...baseCountryCondition,
      category: { contains: "Punta Cana", mode: "insensitive" }
    });
  }

  let tours: TourWithDeparture[] = [];
  try {
    tours = await prisma.tour.findMany({
      where: {
        status: "published",
        OR: orFilters
      },
      orderBy: { featured: "desc" },
      take: RECENT_TOURS_LIMIT,
      include: {
        departureDestination: { select: { name: true, slug: true, country: { select: { slug: true } } } }
      }
    });
  } catch (error) {
    console.error("Error cargando tours para location", {
      slug: resolvedParams.slug,
      orFilters,
      error
    });
  }

  let displayTours = tours;
  if (!displayTours.length) {
    try {
      displayTours = await prisma.tour.findMany({
        where: {
          status: "published",
          countryId: location.countryId
        },
        orderBy: { createdAt: "desc" },
        take: RECENT_TOURS_LIMIT,
        include: {
          departureDestination: { select: { name: true, slug: true, country: { select: { slug: true } } } }
        }
      });
    } catch (error) {
      console.error("Fallback tour query failed for location fallback", {
        slug: resolvedParams.slug,
        countryId: location.countryId,
        error
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Recogidas VIP</p>
            <h1 className="text-4xl font-bold text-slate-900">Tours y traslados desde {location.name}</h1>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-lg text-green-500">✅</span>
              Recogida confirmada en el lobby principal de {location.name}
            </p>
            <p className="max-w-3xl text-sm text-slate-600">
              Te mostramos las experiencias mejor valoradas y traslados confiables que parten desde este hotel. Reservamos tu cupo con prioridad y mantenemos la plaza segura mientras preparas los detalles.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr,1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hotel</p>
              <p className="text-2xl font-semibold text-slate-900">{location.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reserva</p>
              <p className="text-sm text-slate-600">
                ID humano: <span className="font-semibold text-slate-900">{bookingCode ?? "Generaremos uno al reservar"}</span>
              </p>
              <p className="text-sm text-slate-500">Al iniciar la compra desde esta página transferimos el código para que lo veas en tu e-ticket.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Mejores tours</p>
          <h2 className="text-3xl font-semibold text-slate-900">Planifica tu experiencia ahora</h2>
          <p className="text-sm text-slate-600">
            Seleccionamos las experiencias premium que conectan con este punto de encuentro. Ajusta la fecha y confirma tu lugar con un solo click.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {displayTours.map((tour) => (
            <article key={tour.id} className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-44 w-full overflow-hidden bg-slate-200">
                <Image
                  src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {tour.departureDestination?.name ?? tour.location}
                  </p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{tour.shortDescription ?? "Experiencia inmersiva, guías expertos y atención 24/7."}</p>
                <div className="mt-auto flex items-center justify-between text-sm text-slate-700">
                  <span className="text-slate-900 font-semibold">${tour.price.toFixed(0)} USD</span>
                <Link
                  href={buildTourUrl(tour, location.slug, bookingCode)}
                  className="rounded-2xl bg-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-orange-600"
                >
                  {bookingLabel}
                </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
