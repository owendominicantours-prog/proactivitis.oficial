"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { TransferZone, TransferDestination, TransferPoint } from "@prisma/client";
import type { VehicleCategory } from "@prisma/client";
import type { TransferRateWithZones, TransferConfig } from "@/lib/transfers";

type TransferConsoleRow = {
  key: string;
  origin: TransferZone;
  destination: TransferZone;
  prices: Record<VehicleCategory, number>;
};

const VEHICLE_CATEGORIES: VehicleCategory[] = ["SEDAN", "VAN", "SUV", "VIP", "BUS"];

type TransferConsoleProps = {
  countries: { code: string; name: string }[];
  activeCountryCode: string;
  config: TransferConfig;
};

type ZoneDraft = {
  name: string;
  slug: string;
  description: string;
  microzones: string;
  featuredHotels: string;
  originId: string;
};

const formatList = (items?: string[]) => (items ?? []).filter(Boolean).join(", ");
const parseList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

const buildZoneDraftState = (zones: TransferZone[]) => {
  const initial: Record<string, ZoneDraft> = {};
  for (const zone of zones) {
    const meta = (zone.meta || {}) as {
      microzones?: string[];
      featuredHotels?: string[];
    };
    initial[zone.id] = {
      name: zone.name,
      slug: zone.slug,
      description: zone.description ?? "",
      microzones: formatList(meta.microzones),
      featuredHotels: formatList(meta.featuredHotels),
      originId: zone.originId ?? ""
    };
  }
  return initial;
};

const EMPTY_ZONE_DRAFT: ZoneDraft = {
  name: "",
  slug: "",
  description: "",
  microzones: "",
  featuredHotels: "",
  originId: ""
};

const buildOverrides = (): Record<VehicleCategory, number> =>
  VEHICLE_CATEGORIES.reduce((acc, category) => ({ ...acc, [category]: 0 }), {} as Record<VehicleCategory, number>);

type DestinationDraft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  pricingOverrides: Record<VehicleCategory, number>;
};

const buildDestinationDraftState = (destinations: TransferDestination[]) => {
  const initial: Record<string, DestinationDraft> = {};
  for (const destination of destinations) {
    const overrides = (destination.pricingOverrides || {}) as Record<VehicleCategory, number>;
    initial[destination.id] = {
      id: destination.id,
      name: destination.name,
      slug: destination.slug,
      description: destination.description ?? "",
      heroImage: destination.heroImage ?? "",
      pricingOverrides: {
        ...buildOverrides(),
        ...overrides
      }
    };
  }
  return initial;
};

const EMPTY_DESTINATION_DRAFT: DestinationDraft = {
  name: "",
  slug: "",
  description: "",
  heroImage: "",
  pricingOverrides: buildOverrides()
};

type PointDraft = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  code?: string;
  description: string;
};

const POINT_TYPES = [
  { value: "airport", label: "Aeropuerto" },
  { value: "hotel", label: "Hotel" },
  { value: "general", label: "Otro punto" }
];

const buildPointDraftState = (points: TransferPoint[]) => {
  const initial: Record<string, PointDraft> = {};
  for (const point of points) {
    initial[point.id] = {
      id: point.id,
      name: point.name,
      slug: point.slug,
      type: point.type ?? "general",
      code: point.code ?? "",
      description: point.description ?? ""
    };
  }
  return initial;
};

const EMPTY_POINT_DRAFT: PointDraft = {
  name: "",
  slug: "",
  type: "airport",
  code: "",
  description: ""
};

const buildRows = (zones: TransferZone[], rates: TransferRateWithZones[]) => {
  const rowMap = new Map<string, TransferConsoleRow>();
  const zoneById = new Map(zones.map((zone) => [zone.id, zone]));

  for (const rate of rates) {
    const origin = rate.originZone ?? zoneById.get(rate.originZoneId);
    const destination = rate.destinationZone ?? zoneById.get(rate.destinationZoneId);
    if (!origin || !destination) continue;
    const key = `${origin.id}-${destination.id}`;
    const existing = rowMap.get(key);
    if (!existing) {
      rowMap.set(key, {
        key,
        origin,
        destination,
        prices: {
          ...buildOverrides(),
          [rate.vehicleCategory]: rate.price
        }
      });
    } else {
      existing.prices[rate.vehicleCategory] = rate.price;
    }
  }

  return Array.from(rowMap.values()).sort((a, b) => {
    if (a.origin.name === b.origin.name) {
      return a.destination.name.localeCompare(b.destination.name);
    }
    return a.origin.name.localeCompare(b.origin.name);
  });
};

const buildDraftState = (rows: TransferConsoleRow[]) => {
  const initial: Record<string, Record<VehicleCategory, number>> = {};
  for (const row of rows) {
    initial[row.key] = { ...row.prices };
  }
  return initial;
};

export default function TransferConsole({ countries, activeCountryCode, config }: TransferConsoleProps) {
  const router = useRouter();
  const rows = useMemo(() => buildRows(config.zones, config.rates), [config]);
  const zonesById = useMemo(() => new Map(config.zones.map((zone) => [zone.id, zone])), [config.zones]);
  const rowsMap = useMemo(() => new Map(rows.map((row) => [row.key, row])), [rows]);
  const [selectedOriginId, setSelectedOriginId] = useState<string | undefined>();
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | undefined>();
  const [drafts, setDrafts] = useState(() => buildDraftState(rows));
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [zoneDrafts, setZoneDrafts] = useState(() => buildZoneDraftState(config.zones));
  const [newZoneDraft, setNewZoneDraft] = useState<ZoneDraft>(EMPTY_ZONE_DRAFT);
  const [savingZones, setSavingZones] = useState<Record<string, boolean>>({});
  const [creatingZone, setCreatingZone] = useState(false);
  const [pointDrafts, setPointDrafts] = useState(() => buildPointDraftState(config.points));
  const [newPointDraft, setNewPointDraft] = useState<PointDraft>(EMPTY_POINT_DRAFT);
  const [savingPoints, setSavingPoints] = useState<Record<string, boolean>>({});
  const [creatingPoint, setCreatingPoint] = useState(false);
  const [destinationDrafts, setDestinationDrafts] = useState(() => buildDestinationDraftState(config.destinations));
  const [newDestinationDraft, setNewDestinationDraft] = useState<DestinationDraft>(EMPTY_DESTINATION_DRAFT);
  const [priceMode, setPriceMode] = useState<"zone" | "hotel">("zone");

  useEffect(() => {
    setDrafts(buildDraftState(rows));
  }, [rows]);

  useEffect(() => {
    setZoneDrafts(buildZoneDraftState(config.zones));
  }, [config.zones]);

  useEffect(() => {
    setPointDrafts(buildPointDraftState(config.points));
  }, [config.points]);

  useEffect(() => {
    setDestinationDrafts(buildDestinationDraftState(config.destinations));
  }, [config.destinations]);

  const originZone = selectedOriginId ? zonesById.get(selectedOriginId) : undefined;
  const destinationZone = selectedDestinationId ? zonesById.get(selectedDestinationId) : undefined;
  const zoneDestinations = selectedDestinationId
    ? config.destinations.filter((destination) => destination.zoneId === selectedDestinationId)
    : [];
  const activeRowKey = originZone && destinationZone ? `${originZone.id}-${destinationZone.id}` : null;
  const mappedRow = activeRowKey ? rowsMap.get(activeRowKey) : undefined;
  const activeRow =
    mappedRow ??
    (originZone && destinationZone
      ? {
          key: activeRowKey!,
          origin: originZone,
          destination: destinationZone,
          prices: buildOverrides()
        }
      : null);

  useEffect(() => {
    if (!activeRow) return;
    setDrafts((prev) => {
      if (prev[activeRow.key]) {
        return prev;
      }
      return { ...prev, [activeRow.key]: { ...activeRow.prices } };
    });
  }, [activeRow]);

  const handleInputChange = (key: string, category: VehicleCategory, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [category]: Number(value)
      }
    }));
  };

  const handleSaveRow = async (row: TransferConsoleRow) => {
    const payload = drafts[row.key];
    if (!payload) return;
    setStatusMessage(null);
    setSavingRows((prev) => ({ ...prev, [row.key]: true }));
    const response = await fetch("/api/admin/transfers/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originZoneId: row.origin.id,
        destinationZoneId: row.destination.id,
        countryCode: activeCountryCode,
        prices: payload
      })
    });
    setSavingRows((prev) => ({ ...prev, [row.key]: false }));
    if (response.ok) {
      setStatusMessage("Tarifa actualizada");
      router.refresh();
    } else {
      setStatusMessage("No se pudo guardar la tarifa. Intenta de nuevo.");
    }
  };

  const handleZoneInputChange = (zoneId: string, field: keyof ZoneDraft, value: string) => {
    setZoneDrafts((prev) => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [field]: value
      }
    }));
  };

  const handleDestinationPriceChange = (destinationId: string, category: VehicleCategory, value: string) => {
    setDestinationDrafts((prev) => ({
      ...prev,
      [destinationId]: {
        ...prev[destinationId],
        pricingOverrides: {
          ...prev[destinationId].pricingOverrides,
          [category]: Number(value)
        }
      }
    }));
  };

  const handleDestinationFieldChange = (destinationId: string, field: keyof DestinationDraft, value: string) => {
    setDestinationDrafts((prev) => ({
      ...prev,
      [destinationId]: {
        ...prev[destinationId],
        [field]: value
      }
    }));
  };

  const handleNewDestinationFieldChange = (field: keyof DestinationDraft, value: string) => {
    setNewDestinationDraft((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewDestinationPriceChange = (category: VehicleCategory, value: string) => {
    setNewDestinationDraft((prev) => ({
      ...prev,
      pricingOverrides: {
        ...prev.pricingOverrides,
        [category]: Number(value)
      }
    }));
  };

  const handleSaveZone = async (zoneId: string) => {
    const draft = zoneDrafts[zoneId];
    if (!draft) return;
    setStatusMessage(null);
    setSavingZones((prev) => ({ ...prev, [zoneId]: true }));
    const payload = {
      id: zoneId,
      countryCode: activeCountryCode,
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim(),
      originId: draft.originId || undefined,
      microzones: parseList(draft.microzones),
      featuredHotels: parseList(draft.featuredHotels)
    };
    const response = await fetch("/api/admin/transfers/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSavingZones((prev) => ({ ...prev, [zoneId]: false }));
    if (response.ok) {
      setStatusMessage("Zona actualizada");
      router.refresh();
    } else {
      setStatusMessage("No se pudo guardar la zona. Intenta de nuevo.");
    }
  };

  const handleSaveDestination = async (destinationId: string) => {
    const draft = destinationDrafts[destinationId];
    if (!draft) return;
    const destination = config.destinations.find((item) => item.id === destinationId);
    if (!destination) return;
    setStatusMessage(null);
    const payload = {
      id: destinationId,
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim(),
      heroImage: draft.heroImage.trim() || undefined,
      zoneId: destination.zoneId,
      originId: destination.originId ?? undefined,
      pricingOverrides: draft.pricingOverrides
    };
    const response = await fetch("/api/admin/transfers/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      setStatusMessage("Hotel actualizado");
      router.refresh();
    } else {
      setStatusMessage("No se pudo guardar el hotel. Intenta de nuevo.");
    }
  };

  const handleCreateZone = async () => {
    if (!newZoneDraft.name.trim() || !newZoneDraft.slug.trim()) {
      setStatusMessage("Nombre y slug son obligatorios para crear una zona.");
      return;
    }
    setStatusMessage(null);
    setCreatingZone(true);
    const payload = {
      countryCode: activeCountryCode,
      name: newZoneDraft.name.trim(),
      slug: newZoneDraft.slug.trim(),
      description: newZoneDraft.description.trim(),
      originId: newZoneDraft.originId || undefined,
      microzones: parseList(newZoneDraft.microzones),
      featuredHotels: parseList(newZoneDraft.featuredHotels)
    };
    const response = await fetch("/api/admin/transfers/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setCreatingZone(false);
    if (response.ok) {
      setStatusMessage("Zona creada");
      setNewZoneDraft(EMPTY_ZONE_DRAFT);
      router.refresh();
    } else {
      setStatusMessage("No se pudo crear la zona. Intenta de nuevo.");
    }
  };

  const handleCreateDestination = async () => {
    if (!selectedDestinationId) {
      setStatusMessage("Selecciona una zona antes de agregar un hotel.");
      return;
    }
    if (!newDestinationDraft.name.trim() || !newDestinationDraft.slug.trim()) {
      setStatusMessage("Nombre y slug son obligatorios para crear un hotel.");
      return;
    }
    const zone = zonesById.get(selectedDestinationId);
    if (!zone) {
      setStatusMessage("Zona no encontrada.");
      return;
    }
    setStatusMessage(null);
    const payload = {
      name: newDestinationDraft.name.trim(),
      slug: newDestinationDraft.slug.trim(),
      description: newDestinationDraft.description.trim(),
      heroImage: newDestinationDraft.heroImage.trim() || undefined,
      zoneId: zone.id,
      originId: zone.originId ?? undefined,
      pricingOverrides: newDestinationDraft.pricingOverrides
    };
    const response = await fetch("/api/admin/transfers/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      setStatusMessage("Hotel creado");
      setNewDestinationDraft(EMPTY_DESTINATION_DRAFT);
      router.refresh();
    } else {
      setStatusMessage("No se pudo crear el hotel. Intenta de nuevo.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-slate-900">Transferencias por países</h2>
        <p className="text-sm text-slate-500">Configura vehículos y precios para cada zona de origen/destino.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {countries.map((country) => (
          <Link
            key={country.code}
            href={`/admin/transfers?country=${country.code}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              country.code === activeCountryCode
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-600"
            }`}
          >
            {country.name}
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Jerarquía y zonas</p>
            <h3 className="text-lg font-semibold text-slate-900">Edita zonas y microzonas</h3>
          </div>
          <p className="text-sm text-slate-500">
            Actualiza nombre, slug y listas de microzonas o hoteles destacados.
          </p>
        </div>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {config.zones.map((zone) => (
              <div key={zone.id} className="space-y-3 rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{zone.name}</p>
                  <span className="text-xs text-slate-400">{zone.slug}</span>
                </div>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Nombre
                  <input
                    type="text"
                    value={zoneDrafts[zone.id]?.name ?? ""}
                    onChange={(event) => handleZoneInputChange(zone.id, "name", event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Slug
                  <input
                    type="text"
                    value={zoneDrafts[zone.id]?.slug ?? ""}
                    onChange={(event) => handleZoneInputChange(zone.id, "slug", event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Descripción
                  <input
                    type="text"
                    value={zoneDrafts[zone.id]?.description ?? ""}
                    onChange={(event) => handleZoneInputChange(zone.id, "description", event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Punto de partida
                  <select
                    value={zoneDrafts[zone.id]?.originId ?? zone.originId ?? ""}
                    onChange={(event) => handleZoneInputChange(zone.id, "originId", event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Sin asignar</option>
                    {config.points.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.name} ({point.type})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Microzonas (coma-separated)
                  <textarea
                    rows={2}
                    value={zoneDrafts[zone.id]?.microzones ?? ""}
                    onChange={(event) => handleZoneInputChange(zone.id, "microzones", event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Hoteles destacados (coma-separated)
                  <textarea
                    rows={2}
                    value={zoneDrafts[zone.id]?.featuredHotels ?? ""}
                    onChange={(event) => handleZoneInputChange(zone.id, "featuredHotels", event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{zone.id}</span>
                  <button
                    type="button"
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleSaveZone(zone.id)}
                    disabled={savingZones[zone.id]}
                  >
                    {savingZones[zone.id] ? "Guardando..." : "Guardar zona"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Agregar nueva zona</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Nombre
                <input
                  type="text"
                  value={newZoneDraft.name}
                  onChange={(event) => setNewZoneDraft((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Slug
                <input
                  type="text"
                  value={newZoneDraft.slug}
                  onChange={(event) => setNewZoneDraft((prev) => ({ ...prev, slug: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 md:col-span-2">
                Descripción
                <input
                  type="text"
                  value={newZoneDraft.description}
                  onChange={(event) => setNewZoneDraft((prev) => ({ ...prev, description: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 md:col-span-2">
                  Origen
                  <select
                    value={newZoneDraft.originId}
                    onChange={(event) => setNewZoneDraft((prev) => ({ ...prev, originId: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Sin asignar</option>
                    {config.points.map((origin) => (
                      <option key={origin.id} value={origin.id}>
                        {origin.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 md:col-span-2">
                  Microzonas (coma-separated)
                <textarea
                  rows={2}
                  value={newZoneDraft.microzones}
                  onChange={(event) => setNewZoneDraft((prev) => ({ ...prev, microzones: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 md:col-span-2">
                Hoteles destacados (coma-separated)
                <textarea
                  rows={2}
                  value={newZoneDraft.featuredHotels}
                  onChange={(event) => setNewZoneDraft((prev) => ({ ...prev, featuredHotels: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCreateZone}
                disabled={creatingZone}
              >
                {creatingZone ? "Creando..." : "Agregar zona"}
              </button>
            </div>
          </div>
        </div>
      </section>
      {statusMessage && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{statusMessage}</div>
      )}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Origen</label>
          <select
            value={selectedOriginId ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedOriginId(value || undefined);
              setSelectedDestinationId(undefined);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Selecciona un origen</option>
            {config.zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
        {selectedOriginId && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Destino</label>
            <select
              value={selectedDestinationId ?? ""}
              onChange={(event) => setSelectedDestinationId(event.target.value || undefined)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Selecciona un destino</option>
              {config.zones
                .filter((zone) => zone.id !== selectedOriginId)
                .map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
            </select>
            {destinationZone && (
              <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Hoteles vinculados</span>
                  <button
                    type="button"
                    className="rounded-full border border-emerald-400 bg-slate-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    onClick={() => router.push(`/admin/hotels?zone=${destinationZone.slug}`)}
                  >
                    Agregar hotel
                  </button>
                </div>
                <ul className="space-y-1 text-xs">
                  {Array.isArray((destinationZone.meta as { featuredHotels?: string[] })?.featuredHotels) &&
                  (destinationZone.meta as { featuredHotels?: string[] }).featuredHotels?.length ? (
                    (destinationZone.meta as { featuredHotels?: string[] }).featuredHotels!.map(
                      (hotel, index) => (
                        <li key={`${destinationZone.id}-${hotel}-${index}`} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>{hotel}</span>
                        </li>
                      )
                    )
                  ) : (
                    <li className="text-slate-400">No hay hoteles listados para esta zona.</li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Modo de precio</span>
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                  priceMode === "zone"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
                onClick={() => setPriceMode("zone")}
              >
                Precio por zona
              </button>
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                  priceMode === "hotel"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
                onClick={() => setPriceMode("hotel")}
              >
                Precio independiente
              </button>
            </div>
            {priceMode === "hotel" && destinationZone && (
              <section className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">Hoteles</p>
                  <span className="text-xs text-slate-500">Zona {destinationZone.name}</span>
                </div>
                {zoneDestinations.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {zoneDestinations.map((destination) => (
                      <div key={destination.id} className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                          <span>{destination.name}</span>
                          <span>{destination.slug}</span>
                        </div>
                        <label className="text-xs text-slate-500">
                          DescripciÇün
                          <input
                            type="text"
                            value={destinationDrafts[destination.id]?.description ?? ""}
                            onChange={(event) => handleDestinationFieldChange(destination.id, "description", event.target.value)}
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </label>
                        <label className="text-xs text-slate-500">
                          Hero Image
                          <input
                            type="text"
                            value={destinationDrafts[destination.id]?.heroImage ?? ""}
                            onChange={(event) => handleDestinationFieldChange(destination.id, "heroImage", event.target.value)}
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </label>
                        <div className="grid gap-2 md:grid-cols-3">
                          {VEHICLE_CATEGORIES.map((category) => (
                            <label key={`${destination.id}-${category}`} className="text-xs text-slate-500">
                              {category}
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={destinationDrafts[destination.id]?.pricingOverrides[category] ?? 0}
                                onChange={(event) => handleDestinationPriceChange(destination.id, category, event.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                              />
                            </label>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
                            onClick={() => handleSaveDestination(destination.id)}
                          >
                            Guardar hotel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No hay hoteles vinculados a esta zona.</p>
                )}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                  <p className="text-xs font-semibold tracking-[0.3em] text-slate-400">Agregar hotel</p>
                  <div className="mt-2 flex flex-col gap-2 md:grid md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={newDestinationDraft.name}
                      onChange={(event) => handleNewDestinationFieldChange("name", event.target.value)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Slug"
                      value={newDestinationDraft.slug}
                      onChange={(event) => handleNewDestinationFieldChange("slug", event.target.value)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="DescripciÇün"
                      value={newDestinationDraft.description}
                      onChange={(event) => handleNewDestinationFieldChange("description", event.target.value)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Hero Image URL"
                      value={newDestinationDraft.heroImage}
                      onChange={(event) => handleNewDestinationFieldChange("heroImage", event.target.value)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {VEHICLE_CATEGORIES.map((category) => (
                      <input
                        key={`new-${category}`}
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder={`${category} override`}
                        value={newDestinationDraft.pricingOverrides[category] ?? 0}
                        onChange={(event) => handleNewDestinationPriceChange(category, event.target.value)}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500"
                      onClick={handleCreateDestination}
                    >
                      Guardar hotel
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
        {activeRow && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {activeRow.origin.name} → {activeRow.destination.name}
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {activeRow.origin.slug} → {activeRow.destination.slug}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {VEHICLE_CATEGORIES.map((category) => (
                <label key={`${activeRow.key}-${category}`} className="text-sm text-slate-500">
                  {category}
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={drafts[activeRow.key]?.[category] ?? activeRow.prices[category] ?? 0}
                    onChange={(event) => handleInputChange(activeRow.key, category, event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500"
                onClick={() => handleSaveRow(activeRow)}
                disabled={savingRows[activeRow.key]}
              >
                {savingRows[activeRow.key] ? "Guardando..." : "Guardar ruta"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
