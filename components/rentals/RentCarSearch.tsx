"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getRentCarCopy,
  getRentCarOptionPath,
  type RentCarLocale,
  type RentCarOption
} from "@/data/rentCarFleet";

type RentCarSearchProps = {
  options: RentCarOption[];
  locale?: RentCarLocale;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function RentCarSearch({ options, locale = "en" }: RentCarSearchProps) {
  const copy = getRentCarCopy(locale);
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const matches = useMemo(() => {
    if (!normalizedQuery) return options.slice(0, 5);
    return options
      .map((option) => {
        const haystack = normalize(
          [
            option.locationName,
            option.regionId,
            option.airportLabel,
            option.categoryLabel,
            option.model,
            option.displayName,
            option.tag
          ].join(" ")
        );
        const starts = haystack.includes(normalizedQuery) ? 2 : 0;
        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        const tokenScore = tokens.filter((token) => haystack.includes(token)).length;
        return { option, score: starts + tokenScore };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.option.price - b.option.price)
      .slice(0, 6)
      .map((item) => item.option);
  }, [normalizedQuery, options]);

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
      <label className="sr-only">{String(copy.searchTitle)}</label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={String(copy.searchPlaceholder)}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="mt-3 grid gap-2">
        {matches.length ? (
          matches.map((option) => (
            <Link
              key={`${option.locationId}-${option.categorySlug}`}
              href={getRentCarOptionPath(option.locationId, option.categorySlug, locale)}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-slate-950">{option.categoryLabel} · {option.locationName}</span>
                <span className="block truncate text-xs font-semibold text-slate-500">{option.model}</span>
              </span>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-700">
                ${option.price}
              </span>
            </Link>
          ))
        ) : (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            {locale === "es"
              ? "No vemos esa zona exacta. Prueba con aeropuerto, ciudad o tipo de vehiculo."
              : locale === "fr"
                ? "Zone introuvable. Essayez aeroport, ville ou type de vehicule."
                : "We do not see that exact zone. Try airport, city or vehicle type."}
          </p>
        )}
      </div>
    </div>
  );
}
