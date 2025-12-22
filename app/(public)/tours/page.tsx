import Link from "next/link";
import { logPrismaError, prisma } from "@/lib/prisma";
import { buildTourFilter, TourSearchParams } from "@/lib/filterBuilder";
import { TourFilters } from "@/components/public/TourFilters";
import { DynamicImage } from "@/components/shared/DynamicImage";
import type { DurationOption } from "@/components/public/TourFilters";
import type { Prisma } from "@prisma/client";

const parseDurationMeta = (value?: string | null) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      const { value: durationValue, unit } = parsed;
      if (typeof durationValue === "string" && durationValue.trim() && typeof unit === "string" && unit.trim()) {
        return { value: durationValue.trim(), unit: unit.trim() };
      }
    }
  } catch {
    // fall back to plain string
  }
  return null;
};

const formatDurationLabel = (value?: string | null) => {
  const meta = parseDurationMeta(value);
  if (meta) return `${meta.value} ${meta.unit}`;
  if (value && value.trim()) return value.trim();
  return "Duración por confirmar";
};

const buildDurationOptions = (values: (string | null)[]): DurationOption[] => {
  const map = new Map<string, string>();
  for (const value of values) {
    if (!value) continue;
    if (!map.has(value)) {
      map.set(value, formatDurationLabel(value));
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
};

export const metadata = {
  title: "Tours y Experiencias Exclusivas | Reserve con Confianza en Proactivitis",
  description:
    "Explore nuestra colección de tours y actividades premium. Confirmación inmediata, pagos seguros y soporte global 24/7 para sus vacaciones perfectas."
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: Promise<TourSearchParams>;
};

type CountryOption = Prisma.CountryGetPayload<{
  select: { name: true; slug: true };
}>;

type DestinationOption = Prisma.DestinationGetPayload<{
  select: {
    name: true;
    slug: true;
    country: { select: { slug: true } };
  };
}>;

type TourLanguageRow = Prisma.TourGetPayload<{
  select: { language: true };
}>;

type TourDurationRow = Prisma.TourGetPayload<{
  select: { duration: true };
}>;

type TourWithDeparture = Prisma.TourGetPayload<{
  include: {
    departureDestination: {
      include: { country: true };
    };
  };
}>;

export default async function ToursGridPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = resolvedSearchParams ?? {};

  let countries: CountryOption[] = [];
  try {
    countries = await prisma.country.findMany({
      select: { name: true, slug: true }
    });
  } catch (error) {
    logPrismaError("loading countries", error);
  }

  let destinations: DestinationOption[] = [];
  try {
    destinations = await prisma.destination.findMany({
      select: {
        name: true,
        slug: true,
        country: { select: { slug: true } }
      }
    });
  } catch (error) {
    logPrismaError("loading destinations", error);
  }

  let languagesRaw: TourLanguageRow[] = [];
  try {
    languagesRaw = await prisma.tour.findMany({
      where: { status: "published" },
      select: { language: true }
    });
  } catch (error) {
    logPrismaError("loading languages", error);
  }

  let durationsRaw: TourDurationRow[] = [];
  try {
    durationsRaw = await prisma.tour.findMany({
      where: { status: "published" },
      select: { duration: true }
    });
  } catch (error) {
    logPrismaError("loading durations", error);
  }

  const uniqueLanguages = Array.from(new Set(languagesRaw.map((entry) => entry.language).filter(Boolean)));
  const durationOptions = buildDurationOptions(durationsRaw.map((entry) => entry.duration));
  const durationLabelLookup = new Map(durationOptions.map((option) => [option.value, option.label]));

  const where = buildTourFilter(params);

  let tours: TourWithDeparture[] = [];
  try {
    tours = await prisma.tour.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        departureDestination: {
          include: { country: true }
        }
      },
      take: 24
    });
  } catch (error) {
    logPrismaError("loading tours", error);
  }

  const activeFilters = [
    params.country && `País: ${params.country}`,
    params.destination && `Zona: ${params.destination}`,
    params.language && `Idioma: ${params.language}`,
    params.duration &&
      `Duración: ${durationLabelLookup.get(params.duration) ?? params.duration}`,
    params.minPrice && `Mín: $${params.minPrice}`,
    params.maxPrice && `Máx: $${params.maxPrice}`
  ].filter(Boolean);

  return (
    <div className="bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Tours & Experiences</p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Experiencias Curadas: Descubra el Mundo con Otros Ojos
            </h1>
            <p className="text-base text-slate-600">
              Tours auténticos, guías verificados y momentos inolvidables. Sin procesos automáticos, solo calidad
              garantizada.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6">
            <TourFilters
              countries={countries}
              destinations={destinations.map((dest) => ({
                name: dest.name,
                slug: dest.slug,
                countrySlug: dest.country.slug
              }))}
              languages={uniqueLanguages}
              durations={durationOptions}
              mobileFriendly
              categories={["Aventura", "Cultura", "Gastronomía", "Privados", "Acuáticos"]}
            />
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Filtro inteligente (móvil friendly)</p>
              <ul className="space-y-1">
                <li>Categoría: selección rápida con iconos minimalistas.</li>
                <li>Destino: desplazamientos fluidos sin mencionar países.</li>
                <li>Duración: medio día / día completo / multidía.</li>
                <li>Tipo de grupo: privado o compartido.</li>
              </ul>
            </div>
          </aside>
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm font-medium text-slate-700 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span> Confirmación Inmediata: Reciba su voucher al instante.
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span> Cancelación Flexible: Reembolsos claros.
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span> Soporte 24/7: Asistencia humana real en su actividad.
                </span>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((label) => (
                  <span key={label} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Mostrando {tours.length} experiencia{tours.length === 1 ? "" : "s"} seg{`ún`} los filtros.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <Link
                  key={tour.slug}
                  href={`/tours/${tour.slug}`}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-slate-200">
                    <DynamicImage
                      src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                      alt={tour.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 px-4 py-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      <span>{tour.departureDestination?.name ?? tour.location}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">Verificado</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">{tour.title}</p>
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
                      <span>Desde ${tour.price.toFixed(0)}</span>
                      <span>{formatDurationLabel(tour.duration)}</span>
                    </div>
                    <p className="text-xs text-slate-500">Idioma: {tour.language ?? "Español / Inglés"}</p>
                  </div>
                </Link>
              ))}
            </div>
            {tours.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  No hay tours con esos filtros. Cambia los parámetros y vuelve a intentar.
                </div>
            )}
          </section>
        </div>
      </main>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Destinos a la vista</p>
              <h2 className="text-3xl font-semibold text-slate-900">Encuentra tu zona ideal</h2>
            </div>
            <Link href="/destinations" className="text-sm font-semibold text-slate-600 underline transition hover:text-slate-900">
              Ver todos los destinos
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.country.slug}/${dest.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-500 hover:bg-white"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Desde {dest.country.slug}</div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{dest.name}</h3>
                <p className="mt-1 text-sm text-slate-600">Explora tours y experiencias vinculadas a esta zona.</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-sky-600">
                  Ver tours ·
                  <span className="ml-2 text-xs uppercase tracking-[0.3em] text-slate-500">Descubre</span>
                </span>
              </Link>
            ))}
            <p className="mt-6 text-sm text-slate-500">
              Proactivitis selecciona rigurosamente a cada operador turístico para asegurar que su experiencia cumpla con estándares internacionales
              de seguridad y servicio. Desde traslados privados hasta excursiones exclusivas, nuestra plataforma es su garantía de un viaje sin contratiempos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
