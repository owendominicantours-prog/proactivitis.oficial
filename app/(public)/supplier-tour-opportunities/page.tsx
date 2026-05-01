import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Handshake,
  Search,
  Sparkles
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  compareSupplierTourOpportunities,
  normalizeOpportunityText,
  opportunitySlug,
  supplierTourOpportunityCategories
} from "@/lib/supplierTourOpportunities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oportunidades de tours para suplidores | Proactivitis",
  description:
    "Consulta que tours de Republica Dominicana ya estan cubiertos en Proactivitis y cuales siguen disponibles para suplidores nuevos."
};

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    status?: string;
  }>;
};

const normalizeFilter = (value?: string | null) => (value ?? "").trim().toLowerCase();

const buildApplyHref = (opportunity: { name: string; category: string; covered: boolean }) => {
  const params = new URLSearchParams({
    opportunity: opportunity.name,
    category: opportunity.category,
    status: opportunity.covered ? "covered" : "available"
  });
  return `/become-a-supplier?${params.toString()}#partner-form`;
};

export default async function SupplierTourOpportunitiesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = normalizeOpportunityText(normalizeFilter(resolvedSearchParams.q));
  const categoryFilter = resolvedSearchParams.category ?? "all";
  const statusFilter = resolvedSearchParams.status ?? "all";

  const tours = await prisma.tour.findMany({
    where: {
      status: { in: ["published", "seo_only"] }
    },
    select: {
      title: true,
      slug: true,
      category: true,
      location: true,
      shortDescription: true,
      description: true,
      status: true
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  const compared = compareSupplierTourOpportunities(tours);
  const filtered = compared.filter((item) => {
    const matchesQuery = query
      ? normalizeOpportunityText([item.name, item.category, item.aliases?.join(" ")].filter(Boolean).join(" ")).includes(query)
      : true;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "covered" && item.covered) ||
      (statusFilter === "available" && !item.covered);
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const coveredCount = compared.filter((item) => item.covered).length;
  const availableCount = compared.length - coveredCount;
  const filteredByCategory = supplierTourOpportunityCategories
    .map((category) => ({
      ...category,
      opportunities: filtered.filter((item) => item.category === category.title)
    }))
    .filter((category) => category.opportunities.length > 0);

  return (
    <main className="bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.42em] text-sky-200">Supplier opportunities</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Tours de Republica Dominicana que buscamos cubrir con suplidores reales
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
              Esta pagina muestra el inventario turistico que Proactivitis quiere fortalecer. Revisa que servicios ya
              tenemos cubiertos y cuales siguen disponibles para vender dentro de la plataforma.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#tour-map"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-sky-950/30 transition hover:bg-sky-400"
              >
                Ver oportunidades <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/become-a-supplier#partner-form"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                Aplicar como suplidor
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-[28px] bg-white p-5 text-slate-950">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Handshake className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Mapa comercial</p>
                  <h2 className="text-xl font-black">Inventario para captar suplidores</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-3xl font-black">{compared.length}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Servicios</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-3xl font-black text-emerald-700">{coveredCount}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Cubiertos</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-3xl font-black text-sky-700">{availableCount}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Disponibles</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                Cada solicitud sigue pasando por revision humana. Si un servicio ya esta cubierto, el suplidor puede
                aplicar con una variante mejor: privado, VIP, mejor zona, mejor precio o mayor capacidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="tour-map" className="bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <form className="grid gap-3 lg:grid-cols-[1fr_240px_220px_auto]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  defaultValue={resolvedSearchParams.q ?? ""}
                  placeholder="Buscar por nombre, categoria o tipo de tour"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400"
                />
              </label>
              <select
                name="category"
                defaultValue={categoryFilter}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400"
              >
                <option value="all">Todas las categorias</option>
                {supplierTourOpportunityCategories.map((category) => (
                  <option key={category.title} value={category.title}>
                    {category.title}
                  </option>
                ))}
              </select>
              <select
                name="status"
                defaultValue={statusFilter}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-sky-400"
              >
                <option value="all">Todos los estados</option>
                <option value="covered">Cubiertos</option>
                <option value="available">Disponibles</option>
              </select>
              <button className="h-12 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-slate-800">
                Filtrar
              </button>
            </form>
          </div>

          <div className="mt-8 space-y-8">
            {filteredByCategory.map((category) => (
              <section key={category.title} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-700">Categoria</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-950">{category.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{category.description}</p>
                  </div>
                  <div className="flex gap-2 text-xs font-black uppercase tracking-[0.18em]">
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">
                      {category.opportunities.filter((item) => item.covered).length} cubiertos
                    </span>
                    <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-700">
                      {category.opportunities.filter((item) => !item.covered).length} disponibles
                    </span>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
                  <div className="hidden grid-cols-[1.4fr_150px_190px_1fr_180px] bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-white lg:grid">
                    <span>Tour / servicio</span>
                    <span>Cubierto</span>
                    <span>Disponible para vender</span>
                    <span>Coincidencia actual</span>
                    <span>Accion</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {category.opportunities.map((item) => (
                      <article
                        key={`${item.category}-${item.name}`}
                        id={opportunitySlug(item.name)}
                        className="grid gap-3 px-4 py-4 lg:grid-cols-[1.4fr_150px_190px_1fr_180px] lg:items-center"
                      >
                        <div>
                          <p className="text-base font-black text-slate-950">{item.name}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {item.category}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-bold">
                          {item.covered ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300" />
                          )}
                          <span className={item.covered ? "text-emerald-700" : "text-slate-400"}>
                            {item.covered ? "Cubierto" : "No cubierto"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-bold">
                          {!item.covered ? (
                            <CheckCircle2 className="h-5 w-5 text-sky-600" />
                          ) : (
                            <Sparkles className="h-5 w-5 text-amber-500" />
                          )}
                          <span className={!item.covered ? "text-sky-700" : "text-amber-700"}>
                            {!item.covered ? "Disponible" : "Solo variante"}
                          </span>
                        </div>

                        <div className="text-sm text-slate-600">
                          {item.matches.length ? (
                            <div className="space-y-1">
                              {item.matches.map((match) => (
                                <p key={`${item.name}-${match.slug ?? match.title}`} className="line-clamp-1 font-semibold">
                                  {match.title}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="font-semibold text-slate-400">Espacio abierto para nuevos suplidores</p>
                          )}
                        </div>

                        <Link
                          href={buildApplyHref(item)}
                          className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
                            item.covered
                              ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "bg-sky-500 text-white shadow-lg shadow-sky-100 hover:bg-sky-600"
                          }`}
                        >
                          {item.covered ? "Ofrecer variante" : "Publicar este servicio"}
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ))}

            {!filteredByCategory.length ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
                <BadgeCheck className="mx-auto h-8 w-8 text-slate-400" />
                <h2 className="mt-3 text-2xl font-black text-slate-950">No encontramos oportunidades con ese filtro</h2>
                <p className="mt-2 text-sm text-slate-600">Prueba con otra categoria, estado o palabra clave.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
