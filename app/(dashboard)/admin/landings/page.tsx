"use server";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import { genericTransferLandings } from "@/data/transfer-generic-landings";
import { landingPages } from "@/lib/landing";
import { excursionKeywordLandings } from "@/data/excursion-keyword-landings";
import { PARTY_BOAT_VARIANTS } from "@/data/party-boat-variants";
import { SANTO_DOMINGO_VARIANTS } from "@/data/santo-domingo-variants";
import { BUGGY_ATV_VARIANTS } from "@/data/buggy-atv-variants";
import { PARASAILING_VARIANTS } from "@/data/parasailing-variants";
import { SAMANA_WHALE_VARIANTS } from "@/data/samana-whale-variants";
import { premiumTransferMarketLandings } from "@/data/premium-transfer-market-landings";
import {
  buildTransferHotelVariantSlug,
  TRANSFER_HOTEL_SALES_VARIANTS
} from "@/data/transfer-hotel-sales-variants";
import { TRANSFER_QUESTION_SALES_LANDINGS } from "@/data/transfer-question-sales-landings";
import { TOUR_MARKET_INTENTS, buildTourMarketVariantSlug } from "@/lib/tourMarketVariants";
import CollapsibleSection from "@/components/admin/CollapsibleSection";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import LandingRefreshControl from "@/components/admin/LandingRefreshControl";
import { countryPuntaCanaLandings } from "@/data/country-punta-cana-landings";

type SearchParams = {
  zone?: string;
  status?: "active" | "inactive" | "all";
  query?: string;
  catalog?: string;
  sort?: "visits_desc" | "visits_asc" | "name_asc" | "name_desc";
  page?: string;
};

type LandingsAdminPageProps = {
  searchParams?: Promise<SearchParams>;
};

const TRANSFER_ZONE = "punta-cana";
const EXPLORER_PAGE_SIZE = 60;

const buildLandingSlug = (slug: string) => `punta-cana-international-airport-to-${slug}`;

type ExplorerEntry = {
  slug: string;
  name: string;
  zone: string;
  active: boolean;
  type: string;
  category: string;
  path: string;
  visits: number;
};

export default async function LandingsAdminPage({ searchParams }: LandingsAdminPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = resolvedSearchParams ?? {};
  const [zones, locations, dynamicCombos, publishedTours] = await Promise.all([
    prisma.transferZoneV2.findMany({
      where: { countryCode: "RD" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" }
    }),
    prisma.transferLocation.findMany({
      where: { type: "HOTEL" },
      include: { zone: true },
      orderBy: { name: "asc" }
    }),
    getDynamicTransferLandingCombos(),
    prisma.tour.findMany({
      where: { status: "published" },
      select: { slug: true, title: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const manual = allLandings();
  const zoneNameById = new Map(zones.map((zone) => [zone.id, zone.name]));
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
  genericTransferLandings.forEach((landing) => {
    landingMap.set(landing.landingSlug, {
      slug: landing.landingSlug,
      name: landing.keyword,
      type: "GENERIC",
      active: true,
      zone: "Transfer keywords",
      visits: 0
    });
  });
  dynamicCombos.forEach((combo) => {
    landingMap.set(combo.landingSlug, {
      slug: combo.landingSlug,
      name: combo.destinationName,
      type: "TRANSFER",
      active: true,
      zone: zoneNameById.get(combo.destinationZoneId) ?? "Transfers",
      visits: 0
    });
  });

  const transferLandingSlugs = Array.from(landingMap.keys());
  const hotelThingsToDoEntries = locations.map((location) => ({
    slug: `things-to-do/${location.slug}`,
    name: location.name,
    zone: location.zone.name,
    active: location.active
  }));
  const pickupHotelEntries = locations
    .filter((location) => location.zone.slug === "punta-cana")
    .map((location) => ({
      slug: `excursiones-con-recogida/${location.slug}`,
      name: location.name,
      zone: location.zone.name,
      active: location.active
    }));
  const safetyGuideEntries = locations.map((location) => ({
    slug: `excursiones-seguras-punta-cana/${location.slug}-protocolos-seguridad`,
    name: location.name,
    zone: location.zone.name,
    active: location.active
  }));
  const excursionKeywordEntries = excursionKeywordLandings.map((landing) => ({
    slug: `excursiones/${landing.landingSlug}`,
    name: landing.keyword,
    zone: "Excursiones keywords",
    active: true
  }));
  const genericTransferEntries = genericTransferLandings.map((landing) => ({
    slug: landing.landingSlug,
    name: landing.keyword,
    zone: "Transfer keywords",
    active: true,
    type: "SEO_ONLY",
    path: `transfer/${landing.landingSlug}`
  }));
  const partyBoatEntries = PARTY_BOAT_VARIANTS.map((variant) => ({
    slug: `thingtodo/tours/${variant.slug}`,
    name: variant.titles.es,
    zone: "Party Boat",
    active: true
  }));
  const santoDomingoEntries = SANTO_DOMINGO_VARIANTS.map((variant) => ({
    slug: `thingtodo/tours/${variant.slug}`,
    name: variant.titles.es,
    zone: "Santo Domingo",
    active: true
  }));
  const buggyAtvEntries = BUGGY_ATV_VARIANTS.map((variant) => ({
    slug: `thingtodo/tours/${variant.slug}`,
    name: variant.titles.es,
    zone: "Buggy / ATV",
    active: true
  }));
  const parasailingEntries = PARASAILING_VARIANTS.map((variant) => ({
    slug: `thingtodo/tours/${variant.slug}`,
    name: variant.titles.es,
    zone: "Parasailing",
    active: true
  }));
  const samanaWhaleEntries = SAMANA_WHALE_VARIANTS.map((variant) => ({
    slug: `thingtodo/tours/${variant.slug}`,
    name: variant.titles.es,
    zone: "Samana Whale",
    active: true
  }));
  const premiumTransferEntries = [
    {
      slug: "punta-cana/premium-transfer-services",
      name: "Punta Cana Premium Transfer Services",
      zone: "Premium Transfer",
      active: true
    },
    ...premiumTransferMarketLandings.map((landing) => ({
      slug: `punta-cana/premium-transfer-services/${landing.slug}`,
      name: landing.heroTitle.es,
      zone: "Premium Transfer",
      active: true
    }))
  ];
  const hotelSalesTransferEntries = allLandings().flatMap((landing) =>
    TRANSFER_HOTEL_SALES_VARIANTS.map((variant) => ({
      slug: `transfer/${buildTransferHotelVariantSlug(landing.landingSlug, variant.id)}`,
      name: `${landing.hotelName} - ${variant.heroHook}`,
      zone: "Transfer Sales",
      active: true
    }))
  );
  const transferQuestionEntries = TRANSFER_QUESTION_SALES_LANDINGS.map((entry) => ({
    slug: `punta-cana/premium-transfer-services/questions/${entry.slug}`,
    name: entry.question.es,
    zone: "Google Questions",
    active: true
  }));
  const tourMarketVariantEntries = publishedTours.flatMap((tour) =>
    TOUR_MARKET_INTENTS.map((intent) => ({
      slug: `thingtodo/tours/${buildTourMarketVariantSlug(tour.slug, intent.id)}`,
      name: `${tour.title} - ${intent.heroPrefix.es}`,
      zone: "Tour Market Variants",
      active: true
    }))
  );
  const tourLandingSlugs = landingPages.map((landing) => landing.slug);
  const countrySalesLandingEntries = countryPuntaCanaLandings.map((landing) => ({
    slug: `landing/${landing.slug}`,
    name: landing.title,
    zone: "Country to Punta Cana",
    active: true
  }));
  const thingsToDoSlugs = hotelThingsToDoEntries.map((entry) => entry.slug);
  const pickupHotelSlugs = pickupHotelEntries.map((entry) => entry.slug);
  const safetyGuideSlugs = safetyGuideEntries.map((entry) => entry.slug);
  const partyBoatSlugs = partyBoatEntries.map((entry) => entry.slug);
  const santoDomingoSlugs = santoDomingoEntries.map((entry) => entry.slug);
  const buggyAtvSlugs = buggyAtvEntries.map((entry) => entry.slug);
  const parasailingSlugs = parasailingEntries.map((entry) => entry.slug);
  const samanaWhaleSlugs = samanaWhaleEntries.map((entry) => entry.slug);
  const premiumTransferSlugs = premiumTransferEntries.map((entry) => entry.slug);
  const hotelSalesTransferSlugs = hotelSalesTransferEntries.map((entry) =>
    entry.slug.replace(/^transfer\//, "")
  );
  const transferQuestionSlugs = transferQuestionEntries.map((entry) => entry.slug);
  const tourMarketVariantSlugs = tourMarketVariantEntries.map((entry) => entry.slug);
  const excursionKeywordSlugs = excursionKeywordEntries.map((entry) => entry.slug);
  const landingSlugs = Array.from(
    new Set([
      ...transferLandingSlugs,
      ...tourLandingSlugs,
      ...thingsToDoSlugs,
      ...pickupHotelSlugs,
      ...safetyGuideSlugs,
      ...excursionKeywordSlugs,
      ...partyBoatSlugs,
      ...santoDomingoSlugs,
      ...buggyAtvSlugs,
      ...parasailingSlugs,
      ...samanaWhaleSlugs,
      ...premiumTransferSlugs,
      ...hotelSalesTransferSlugs,
      ...transferQuestionSlugs,
      ...tourMarketVariantSlugs,
      ...countrySalesLandingEntries.map((entry) => entry.slug)
    ])
  );
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

  const explorerEntries: ExplorerEntry[] = [
    ...entries.map((entry) => ({
      ...entry,
      category: entry.type === "GENERIC" ? "seo-transfer-100" : "transfer",
      path: `transfer/${entry.slug}`
    })),
    ...premiumTransferEntries.map((entry) => ({
      ...entry,
      type: "VIP",
      category: "premium-transfer",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...hotelSalesTransferEntries.map((entry) => ({
      ...entry,
      type: "TRANSFER_SALES",
      category: "hotel-transfer-sales",
      path: entry.slug,
      visits: trafficMap.get(entry.slug.replace(/^transfer\//, "")) ?? 0
    })),
    ...transferQuestionEntries.map((entry) => ({
      ...entry,
      type: "Q&A",
      category: "google-questions",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...hotelThingsToDoEntries.map((entry) => ({
      ...entry,
      type: "HOTEL",
      category: "hotels-things-to-do",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...pickupHotelEntries.map((entry) => ({
      ...entry,
      type: "HOTEL_PICKUP",
      category: "hotel-pickup",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...safetyGuideEntries.map((entry) => ({
      ...entry,
      type: "SAFETY",
      category: "safety-guides",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...excursionKeywordEntries.map((entry) => ({
      ...entry,
      type: "EXCURSION",
      category: "excursion-keywords",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...partyBoatEntries.map((entry) => ({
      ...entry,
      type: "TOUR_VARIANT",
      category: "party-boat-variants",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...santoDomingoEntries.map((entry) => ({
      ...entry,
      type: "TOUR_VARIANT",
      category: "santo-domingo-variants",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...buggyAtvEntries.map((entry) => ({
      ...entry,
      type: "TOUR_VARIANT",
      category: "buggy-atv-variants",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...parasailingEntries.map((entry) => ({
      ...entry,
      type: "TOUR_VARIANT",
      category: "parasailing-variants",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...samanaWhaleEntries.map((entry) => ({
      ...entry,
      type: "TOUR_VARIANT",
      category: "samana-whale-variants",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...tourMarketVariantEntries.map((entry) => ({
      ...entry,
      type: "TOUR_MARKET",
      category: "tour-market-variants",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    })),
    ...countrySalesLandingEntries.map((entry) => ({
      ...entry,
      type: "COUNTRY",
      category: "country-sales",
      path: entry.slug,
      visits: trafficMap.get(entry.slug) ?? 0
    }))
  ];

  let filteredExplorer = explorerEntries;
  if (params.catalog && params.catalog !== "all") {
    filteredExplorer = filteredExplorer.filter((entry) => entry.category === params.catalog);
  }
  if (params.zone) {
    const normalized = params.zone.toLowerCase();
    filteredExplorer = filteredExplorer.filter(
      (entry) =>
        entry.zone.toLowerCase().includes(normalized) ||
        entry.category.toLowerCase().includes(normalized)
    );
  }
  if (params.status && params.status !== "all") {
    const matchActive = params.status === "active";
    filteredExplorer = filteredExplorer.filter((entry) => entry.active === matchActive);
  }
  if (params.query) {
    const normalized = params.query.toLowerCase();
    filteredExplorer = filteredExplorer.filter(
      (entry) =>
        entry.slug.toLowerCase().includes(normalized) ||
        entry.name.toLowerCase().includes(normalized) ||
        entry.path.toLowerCase().includes(normalized)
    );
  }

  const sortMode = params.sort ?? "visits_desc";
  filteredExplorer.sort((a, b) => {
    if (sortMode === "name_asc") return a.name.localeCompare(b.name);
    if (sortMode === "name_desc") return b.name.localeCompare(a.name);
    if (sortMode === "visits_asc") return a.visits - b.visits;
    return b.visits - a.visits;
  });

  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const totalPages = Math.max(1, Math.ceil(filteredExplorer.length / EXPLORER_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * EXPLORER_PAGE_SIZE;
  const paginatedExplorer = filteredExplorer.slice(start, start + EXPLORER_PAGE_SIZE);

  const seoOnlyTransferCount = genericTransferEntries.length;
  const transferTotalCount = entries.length;
  const explorerTotalCount = explorerEntries.length;

  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (params.zone) query.set("zone", params.zone);
    if (params.status) query.set("status", params.status);
    if (params.query) query.set("query", params.query);
    if (params.catalog) query.set("catalog", params.catalog);
    if (params.sort) query.set("sort", params.sort);
    query.set("page", String(nextPage));
    return `/admin/landings?${query.toString()}`;
  };

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Transfer total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{transferTotalCount.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Manuales + dinámicas + SEO transfer.</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">SEO-only transfer</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{seoOnlyTransferCount.toLocaleString()}</p>
          <p className="text-sm text-emerald-700">Las 100 páginas de keywords de transporte.</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Catálogos</p>
          <p className="mt-2 text-3xl font-semibold text-sky-900">14</p>
          <p className="text-sm text-sky-700">Colecciones para filtrar por intención.</p>
        </article>
        <article className="rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-violet-700">Landings totales</p>
          <p className="mt-2 text-3xl font-semibold text-violet-900">{explorerTotalCount.toLocaleString()}</p>
          <p className="text-sm text-violet-700">Inventario completo en el explorador.</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-6">
          <label className="flex flex-col text-sm text-slate-600">
            Catálogo
            <select
              name="catalog"
              defaultValue={params.catalog ?? "all"}
              className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="seo-transfer-100">SEO transfer (100)</option>
              <option value="transfer">Transfer base</option>
              <option value="premium-transfer">Premium transfer</option>
              <option value="hotel-transfer-sales">Transfer sales por hotel</option>
              <option value="google-questions">Google Questions</option>
              <option value="hotels-things-to-do">Hotels Things to do</option>
              <option value="hotel-pickup">Hotel pickup tours</option>
              <option value="safety-guides">Safety guides</option>
              <option value="excursion-keywords">Excursiones keywords</option>
              <option value="tour-market-variants">Tour market variants</option>
              <option value="country-sales">Country sales</option>
            </select>
          </label>
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
          <label className="flex flex-col text-sm text-slate-600">
            Orden
            <select
              name="sort"
              defaultValue={params.sort ?? "visits_desc"}
              className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="visits_desc">Visitas (alto a bajo)</option>
              <option value="visits_asc">Visitas (bajo a alto)</option>
              <option value="name_asc">Nombre (A-Z)</option>
              <option value="name_desc">Nombre (Z-A)</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Filtrar
          </button>
          <Link
            href="/admin/landings"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
          >
            Limpiar
          </Link>
        </form>
      </section>

      <LandingRefreshControl />

      <CollapsibleSection
        title="Explorador moderno de landings"
        description="Vista única para ordenar, filtrar y abrir cualquier landing sin perderse."
        badge={`${filteredExplorer.length} items`}
      >
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Página {safePage} de {totalPages}
          </p>
          <p>{filteredExplorer.length.toLocaleString()} resultados filtrados</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedExplorer.map((entry) => (
            <Link
              key={`${entry.category}-${entry.slug}-${entry.path}`}
              href={`https://proactivitis.com/${entry.path}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div className="space-y-1">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.category}</p>
                <h3 className="text-base font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-xs text-slate-500">{entry.zone}</p>
                <p className="line-clamp-2 text-xs text-slate-500">{entry.path}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Visitas: {entry.visits.toLocaleString()}</p>
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
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={pageHref(Math.max(1, safePage - 1))}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              safePage <= 1
                ? "pointer-events-none border border-slate-200 text-slate-300"
                : "border border-slate-300 text-slate-700 hover:border-slate-500"
            }`}
          >
            Anterior
          </Link>
          <Link
            href={pageHref(Math.min(totalPages, safePage + 1))}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              safePage >= totalPages
                ? "pointer-events-none border border-slate-200 text-slate-300"
                : "border border-slate-300 text-slate-700 hover:border-slate-500"
            }`}
          >
            Siguiente
          </Link>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="SEO-only transfer (100 páginas)"
        description="Colección de landings SEO de transporte creadas por keyword (ES/EN/FR)."
        badge={`${genericTransferEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {genericTransferEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.path}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.type}</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.path}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Landings de transfer"
        description="Lista las páginas de transfer generadas automáticamente con visitas."
        badge={`${entries.length} items`}
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        title="Google Question Sales Pages"
        description="Paginas de preguntas reales de Google con respuesta directa e intencion de venta."
        badge={`${transferQuestionEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {transferQuestionEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Q&A Sales</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Transfer Sales Landings por hotel"
        description="10 landings comerciales por hotel para vender traslados + tours."
        badge={`${hotelSalesTransferEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hotelSalesTransferEntries.map((entry) => {
            const cleanSlug = entry.slug.replace(/^transfer\//, "");
            return (
              <Link
                key={entry.slug}
                href={`https://proactivitis.com/${entry.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
              >
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Transfer + Tours</p>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <p>{entry.slug}</p>
                  <p>Visitas {trafficMap.get(cleanSlug)?.toLocaleString() ?? "0"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Premium Transfer landings"
        description="Landing principal premium + variantes SEO de alta intencion."
        badge={`${premiumTransferEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {premiumTransferEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">VIP</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Landings de hoteles (Things to do)"
        description="Lista las paginas /things-to-do/{hotelSlug} generadas automaticamente por hotel."
        badge={`${hotelThingsToDoEntries.length} items`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resultados</p>
        <p className="text-sm text-slate-500">
          {hotelThingsToDoEntries.length} landings encontradas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hotelThingsToDoEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">HOTEL</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <p>{entry.slug}</p>
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
      </CollapsibleSection>

      <CollapsibleSection
        title="Excursiones con recogida por hotel"
        description="Landings de excursiones con recogida en hotel para Punta Cana."
        badge={`${pickupHotelEntries.length} items`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resultados</p>
        <p className="text-sm text-slate-500">
          {pickupHotelEntries.length} landings encontradas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pickupHotelEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">HOTEL</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <p>{entry.slug}</p>
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
      </CollapsibleSection>

      <CollapsibleSection
        title="Guias de seguridad por hotel"
        description="Landings informativas con protocolos de seguridad y transporte por hotel."
        badge={`${safetyGuideEntries.length} items`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resultados</p>
        <p className="text-sm text-slate-500">
          {safetyGuideEntries.length} guias encontradas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {safetyGuideEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">HOTEL</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 text-xs text-slate-500">
                  <p>{entry.slug}</p>
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
      </CollapsibleSection>

      <CollapsibleSection
        title="Tour landings"
        description="Minisites de tours creados con el builder."
      >
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
          {landingPages.map((landing) => {
            const landingPath = landing.path ?? `/landing/${landing.slug}`;
            return (
            <Link
              key={landing.slug}
              href={`https://proactivitis.com${landingPath}`}
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
                <p>{landingPath.replace(/^\//, "")}</p>
                <p>Visitas {trafficMap.get(landing.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Tour Market Variants"
        description="Variantes de mercado por tour (30 por tour) con enfoque de venta + traslados + hoteles."
        badge={`${tourMarketVariantEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tourMarketVariantEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">ThingToDo</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Country to Punta Cana landings"
        description="Paginas comerciales por pais para vender excursiones, hoteles y traslados en Punta Cana."
        badge={`${countrySalesLandingEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {countrySalesLandingEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Country Sales</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Landings de excursiones (keywords)"
        description="Landings SEO basadas en busquedas de excursiones con tours reales."
        badge={`${excursionKeywordEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {excursionKeywordEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Excursion</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Party Boat landings"
        description="Variantes SEO del Party Boat con contenidos personalizados."
        badge={`${partyBoatEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partyBoatEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Party Boat</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Santo Domingo landings"
        description="Variantes SEO del tour Santo Domingo con contenidos personalizados."
        badge={`${santoDomingoEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {santoDomingoEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Tour</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Buggy y ATV landings"
        description="Variantes SEO del tour Buggy y ATV con contenidos personalizados."
        badge={`${buggyAtvEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buggyAtvEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Tour</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Parasailing landings"
        description="Variantes SEO del tour Parasailing con contenidos personalizados."
        badge={`${parasailingEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {parasailingEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Tour</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Samana Whale landings"
        description="Variantes SEO del tour de ballenas en Samana con contenidos personalizados."
        badge={`${samanaWhaleEntries.length} items`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {samanaWhaleEntries.map((entry) => (
            <Link
              key={entry.slug}
              href={`https://proactivitis.com/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{entry.zone}</p>
                <h3 className="text-lg font-semibold text-slate-900">{entry.name}</h3>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Tour</p>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <p>{entry.slug}</p>
                <p>Visitas {trafficMap.get(entry.slug)?.toLocaleString() ?? "0"}</p>
              </div>
            </Link>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
