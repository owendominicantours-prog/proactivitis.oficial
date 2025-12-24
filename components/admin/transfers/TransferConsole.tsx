"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { TransferZone } from "@prisma/client";
import type { VehicleCategory } from "@prisma/client";
import type { TransferRateWithZones } from "@/lib/transfers";

type TransferConsoleRow = {
  key: string;
  origin: TransferZone;
  destination: TransferZone;
  prices: Record<VehicleCategory, number>;
};

const VEHICLE_CATEGORIES: VehicleCategory[] = ["SEDAN", "VAN", "SUV"];

type TransferConsoleProps = {
  countries: { code: string; name: string }[];
  activeCountryCode: string;
  config: {
    zones: TransferZone[];
    rates: TransferRateWithZones[];
  };
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
          SEDAN: 0,
          VAN: 0,
          SUV: 0,
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
  const [drafts, setDrafts] = useState(() => buildDraftState(rows));
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(buildDraftState(rows));
  }, [rows]);

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

  const applyUniformPrice = (key: string, value: number) => {
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        SEDAN: value,
        VAN: value,
        SUV: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-slate-900">Transferencias por país</h2>
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
      {statusMessage && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{statusMessage}</div>
      )}
      <div className="space-y-4">
        {rows.map((row) => {
          const originMeta = row.origin.meta as { microzones?: string[] } | null;
          const destinationMeta = row.destination.meta as { microzones?: string[] } | null;
          const relatedZones = [
            ...(Array.isArray(originMeta?.microzones) ? originMeta.microzones : []),
            ...(Array.isArray(destinationMeta?.microzones) ? destinationMeta.microzones : [])
          ]
            .filter(Boolean)
            .slice(0, 5);

          return (
            <article key={row.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {row.origin.name} → {row.destination.name}
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {row.origin.slug} → {row.destination.slug}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                {VEHICLE_CATEGORIES.map((category) => (
                  <label key={`${row.key}-${category}`} className="text-sm text-slate-500">
                    {category}
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={drafts[row.key]?.[category] ?? row.prices[category] ?? 0}
                      onChange={(event) => handleInputChange(row.key, category, event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-base text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-slate-300"
                  onClick={() => applyUniformPrice(row.key, drafts[row.key]?.SEDAN ?? row.prices.SEDAN)}
                >
                  Aplicar tarifa de SEDAN a todos
                </button>
                <button
                  type="button"
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-indigo-500"
                  onClick={() => handleSaveRow(row)}
                  disabled={savingRows[row.key]}
                >
                  {savingRows[row.key] ? "Guardando..." : "Guardar"}
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Zonas relacionadas: {relatedZones.join(", ") || "N/A"}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
