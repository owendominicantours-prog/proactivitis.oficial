"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

import { AgencyProBuilder } from "@/components/agency/AgencyProBuilder";
import { DynamicImage } from "@/components/shared/DynamicImage";

export type AgencyTourSummary = {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  supplier: string;
  heroImage?: string | null;
  duration?: string | null;
  commissionPercent: number;
};

type SortMode = "title" | "publicPrice" | "netPrice";
type ViewMode = "cards" | "list";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

export const TourCatalog = ({ tours }: { tours: AgencyTourSummary[] }) => {
  const [query, setQuery] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>("title");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const destinations = useMemo(() => Array.from(new Set(tours.map((tour) => tour.location))).sort(), [tours]);
  const suppliers = useMemo(() => Array.from(new Set(tours.map((tour) => tour.supplier))).sort(), [tours]);
  const commissionPercent = tours[0]?.commissionPercent ?? 0;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const results = tours.filter((tour) => {
      const haystack = [tour.title, tour.location, tour.supplier, tour.slug, tour.duration ?? ""]
        .join(" ")
        .toLowerCase();
      const matchesQuery = normalizedQuery ? haystack.includes(normalizedQuery) : true;
      const matchesDestination = destinationFilter ? tour.location === destinationFilter : true;
      const matchesSupplier = supplierFilter ? tour.supplier === supplierFilter : true;
      return matchesQuery && matchesDestination && matchesSupplier;
    });

    results.sort((left, right) => {
      const leftNet = left.price - left.price * (left.commissionPercent / 100);
      const rightNet = right.price - right.price * (right.commissionPercent / 100);

      if (sortBy === "publicPrice") return right.price - left.price;
      if (sortBy === "netPrice") return rightNet - leftNet;
      return left.title.localeCompare(right.title, "es", { sensitivity: "base" });
    });

    return results;
  }, [destinationFilter, query, sortBy, supplierFilter, tours]);

  const totalPublicInventory = useMemo(() => tours.reduce((sum, tour) => sum + tour.price, 0), [tours]);
  const totalNetInventory = useMemo(
    () => tours.reduce((sum, tour) => sum + (tour.price - tour.price * (tour.commissionPercent / 100)), 0),
    [tours]
  );

  const resetFilters = () => {
    setQuery("");
    setDestinationFilter("");
    setSupplierFilter("");
    setSortBy("title");
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tours activos" value={String(tours.length)} helper="Inventario publicado listo para vender" />
        <StatCard label="Destinos" value={String(destinations.length)} helper="Zonas activas en tu catalogo" />
        <StatCard label="Proveedores" value={String(suppliers.length)} helper="Operadores con cupo publicado" />
        <StatCard
          label="Comision base"
          value={`${commissionPercent}%`}
          helper="Aplicada en reservas directas de agencia"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1.5fr,1fr,1fr,1fr,auto]">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Buscar tour
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Titulo, destino, proveedor o slug"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Destino</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
              value={destinationFilter}
              onChange={(event) => setDestinationFilter(event.target.value)}
            >
              <option value="">Todos</option>
              {destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Proveedor</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
            >
              <option value="">Todos</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Ordenar</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortMode)}
            >
              <option value="title">Nombre A-Z</option>
              <option value="publicPrice">Mayor precio publico</option>
              <option value="netPrice">Mayor neto agencia</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 xl:w-auto"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
          <span>{filtered.length} resultados visibles</span>
          <span>Total publico: {formatMoney(totalPublicInventory)}</span>
          <span>Total neto estimado: {formatMoney(totalNetInventory)}</span>
          </div>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filtered.map((tour) => {
          const commissionValue = tour.price * (tour.commissionPercent / 100);
          const netAgencyPrice = tour.price - commissionValue;
          const durationLabel = formatDurationLabel(tour.duration);

          return (
            <article
              key={tour.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div
                className={`gap-4 ${viewMode === "cards" ? "grid xl:grid-cols-[220px,1.4fr,0.9fr,0.9fr] xl:items-center" : "grid lg:grid-cols-[180px,1.5fr,0.8fr,0.8fr] lg:items-center"}`}
              >
                <div className={`overflow-hidden rounded-2xl bg-slate-100 ${viewMode === "list" ? "hidden lg:block" : ""}`}>
                  <div className="relative h-40 w-full">
                    <DynamicImage
                      src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                      alt={tour.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">Tour listo para vender</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{tour.title}</h2>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <Tag>{tour.location}</Tag>
                    <Tag>{tour.supplier}</Tag>
                    {durationLabel ? <Tag>{durationLabel}</Tag> : null}
                    <Tag>Slug: {tour.slug}</Tag>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span>Precio publico {formatMoney(tour.price)}</span>
                    <span>Neto agencia {formatMoney(netAgencyPrice)}</span>
                    <span>Comision {tour.commissionPercent}%</span>
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <InfoLine label="Precio publico" value={formatMoney(tour.price)} emphasis="indigo" />
                  <InfoLine label="Pago agencia" value={formatMoney(netAgencyPrice)} emphasis="slate" />
                  <InfoLine label="Comision directa" value={`${tour.commissionPercent}% / ${formatMoney(commissionValue)}`} emphasis="emerald" />
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/tours/${tour.slug}?from=agency#booking`}
                    className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                  >
                    Vender y crear reserva
                  </Link>
                  <AgencyProBuilder tourId={tour.id} tourTitle={tour.title} basePrice={tour.price} />
                  <p className="text-xs leading-relaxed text-slate-500">
                    Usa reserva directa si tu agencia gestiona el checkout. Usa AgencyPro si enviaras un link con tu
                    propio precio final al cliente.
                  </p>
                </div>
              </div>
            </article>
          );
        })}

        {!filtered.length && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No encontramos tours con esos filtros.</p>
            <p className="mt-2 text-sm text-slate-500">
              Cambia la busqueda, limpia los filtros o prueba por destino, proveedor o slug.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </div>
);

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{children}</span>
);

const InfoLine = ({
  label,
  value,
  emphasis
}: {
  label: string;
  value: string;
  emphasis: "indigo" | "slate" | "emerald";
}) => {
  const valueClass =
    emphasis === "indigo"
      ? "text-indigo-600"
      : emphasis === "emerald"
        ? "text-emerald-600"
        : "text-slate-900";

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className={`text-base font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
};

const formatDurationLabel = (value?: string | null) => {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("{") && trimmed.includes("\"value\"")) {
      try {
        const parsed = JSON.parse(trimmed) as { value?: string | number; unit?: string };
        if (parsed?.value && parsed?.unit) {
          return `${parsed.value} ${parsed.unit}`;
        }
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  return String(value);
};
