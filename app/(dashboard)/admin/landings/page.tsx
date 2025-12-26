"use server";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import { landingPages } from "@/lib/landing";

type SearchParams = {
  zone?: string;
  status?: "active" | "inactive" | "all";
  query?: string;
};

type LandingsAdminPageProps = {
  searchParams?: Promise<SearchParams>;
};

const TRANSFER_ZONE = "punta-cana";

const buildLandingSlug = (slug: string) => `punta-cana-international-airport-to-${slug}`;

export default async function LandingsAdminPage({ searchParams }: LandingsAdminPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = resolvedSearchParams ?? {};
  const [zones, locations] = await Promise.all([
    prisma.transferZoneV2.findMany({
      where: { countryCode: "RD" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" }
    }),
    prisma.transferLocation.findMany({
      where: { zone: { slug: TRANSFER_ZONE } },
      include: { zone: true },
      orderBy: { name: "asc" }
    })
  ]);

  const manual = allLandings();
  const landingMap = new Map<
    string,
    { slug: string; name: string; type: string; active: boolean; zone: string; visits: number }
  >();
  locations.forEach((location) => {
    landingMap.set(buildLandingSlug(location.slug), {
      slug: buildLandingSlug(location.slug),
      name: location.name,
      type: location.type,
      active: location.active,
      zone: location.zone.name,
      visits: 0
    });
  });
  manual.forEach((landing) => {
    landingMap.set(landing.landingSlug, {
      slug: landing.landingSlug,
      name: landing.hotelName,
      type: "HOTEL",
      active: true,
      zone: TRANSFER_ZONE,
      visits: 0
    });
  });

  const transferLandingSlugs = Array.from(landingMap.keys());
  const tourLandingSlugs = landingPages.map((landing) => landing.slug);
  const landingSlugs = Array.from(new Set([...transferLandingSlugs, ...tourLandingSlugs]));
  const trafficRows = await prisma.landingPageTraffic.findMany({
    where: { slug: { in: landingSlugs } },
    select: { slug: true, visits: true }
  });
  const trafficMap = new Map(trafficRows.map((row) => [row.slug, row.visits]));


  let entries = Array.from(landingMap.values()).map((entry) => ({
    ...entry,
    visits: trafficMap.get(entry.slug) ?? 0
  }));
  if (params.zone) {
    entries = entries.filter((entry) => entry.zone.toLowerCase().includes(params.zone!.toLowerCase()));
  }
  if (params.status && params.status !== "all") {
    const matchActive = params.status === "active";
    entries = entries.filter((entry) => entry.active === matchActive);
  }
  if (params.query) {
    const normalized = params.query.toLowerCase();
    entries = entries.filter(
      (entry) => entry.slug.includes(normalized) || entry.name.toLowerCase().includes(normalized)
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Landings</p>
        <h1 className="text-3xl font-semibold text-slate-900">Landings de traslados (PUJ → hotel)</h1>
        <p className="text-sm text-slate-600">
          Monitorea todos los slugs generados (manuales + dinámicos) y accede a ellos con un solo clic.
          Usa filtros por zona, estado o palabra clave para localizar cualquier landing aunque tengas millones.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600">
            Zona / palabra clave
            <input
              name="zone"
              defaultValue={params.zone ?? ""}
              placeholder="ej. Cap Cana"
              className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Estado
            <select
              name="status"
              defaultValue={params.status ?? "all"}
              className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Clave
            <input
              name="query"
              defaultValue={params.query ?? ""}
              placeholder="ej. royalton"
              className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Filtrar
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resultados</p>
        <p className="text-sm text-slate-500">
          {entries.length} landings encontradas ({landingMap.size} en total).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/transfer/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.type}</p>
              </div>
                <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <p>{entry.slug}</p>
                  <p>Visitas: {entry.visits.toLocaleString()}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold ${
                    entry.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {entry.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tour landings</p>
            <h2 className="text-lg font-semibold text-slate-900">Landings públicas de tours</h2>
          </div>
          <p className="text-xs text-slate-500">
            Cada slug usa el builder principal y puede mostrarse con su propio SEO + FAQ.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {landingPages.map((landing) => (
            <Link
              key={landing.slug}
              href={`https://proactivitis.com/landing/${landing.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Tour</p>
                <h3 className="text-lg font-semibold text-slate-900">{landing.title}</h3>
                <p className="text-[0.75rem] text-slate-500">{landing.tagline}</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{landing.slug}</p>
                <p>Visitas {trafficMap.get(landing.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
