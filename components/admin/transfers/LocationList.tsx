"use client";

import { TransferLocation } from "@prisma/client";
import { useMemo, useState } from "react";

type LocationWithZone = TransferLocation & {
  zone: {
    id: string;
    name: string;
  };
};

type Props = {
  locations: LocationWithZone[];
  toggleAction: (formData: FormData) => Promise<void>;
};

export default function LocationList({ locations, toggleAction }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return locations.filter((location) => {
      if (status !== "all") {
        const matchesStatus = status === "active" ? location.active : !location.active;
        if (!matchesStatus) {
          return false;
        }
      }
      if (!normalized) {
        return true;
      }
      return (
        location.name.toLowerCase().includes(normalized) ||
        location.slug.toLowerCase().includes(normalized) ||
        location.zone.name.toLowerCase().includes(normalized)
      );
    });
  }, [locations, search, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex-1 min-w-[200px] text-sm font-semibold text-slate-700">
          Buscar hoteles o zonas
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, slug o zona"
            className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Estado
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | "active" | "inactive")}
            className="mt-1 rounded-lg border border-slate-200 p-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.length ? (
          filtered.map((location) => (
            <article key={location.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{location.slug}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{location.name}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold ${
                    location.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {location.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{location.zone.name}</span> · {location.type}
              </p>
              {location.address ? (
                <p className="text-xs text-slate-500">Dirección: {location.address}</p>
              ) : null}
              {location.description ? (
                <p className="text-xs text-slate-500">Notas: {location.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <form action={toggleAction} className="flex items-center gap-2">
                  <input type="hidden" name="locationId" value={location.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                  >
                    {location.active ? "Marcar inactivo" : "Marcar activo"}
                  </button>
                </form>
                <span className="text-xs text-slate-500">
                  Creado: {new Date(location.createdAt).toLocaleDateString()}
                </span>
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-500">No hay locations que coincidan con el filtro.</p>
        )}
      </div>
    </div>
  );
}
