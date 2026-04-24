"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

type HotelPickupNavigatorItem = {
  slug: string;
  name: string;
  zoneName: string;
  href: string;
};

type Locale = "es" | "en" | "fr";

const copyByLocale = {
  es: {
    searchLabel: "Buscar hotel o resort",
    searchPlaceholder: "Ej. Lopesan, Hard Rock, Majestic...",
    allAreas: "Todas las zonas",
    current: "Actual",
    noResults: "No encontramos hoteles con ese filtro.",
    open: "Abrir landing",
    showing: "Mostrando"
  },
  en: {
    searchLabel: "Search hotel or resort",
    searchPlaceholder: "Ex. Lopesan, Hard Rock, Majestic...",
    allAreas: "All areas",
    current: "Current",
    noResults: "No hotels found for that filter.",
    open: "Open landing",
    showing: "Showing"
  },
  fr: {
    searchLabel: "Rechercher hotel ou resort",
    searchPlaceholder: "Ex. Lopesan, Hard Rock, Majestic...",
    allAreas: "Toutes les zones",
    current: "Actuel",
    noResults: "Aucun hotel trouve pour ce filtre.",
    open: "Ouvrir la landing",
    showing: "Affichage"
  }
} as const;

export default function HotelPickupNavigator({
  hotels,
  locale,
  currentSlug
}: {
  hotels: HotelPickupNavigatorItem[];
  locale: Locale;
  currentSlug: string;
}) {
  const copy = copyByLocale[locale];
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const areaOptions = useMemo(
    () => [copy.allAreas, ...Array.from(new Set(hotels.map((hotel) => hotel.zoneName))).sort((a, b) => a.localeCompare(b))],
    [copy.allAreas, hotels]
  );

  const filteredHotels = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return hotels
      .filter((hotel) => selectedArea === "all" || hotel.zoneName === selectedArea)
      .filter((hotel) => {
        if (!normalizedQuery) return true;
        return `${hotel.name} ${hotel.zoneName}`.toLowerCase().includes(normalizedQuery);
      })
      .slice(0, 18);
  }, [deferredQuery, hotels, selectedArea]);

  return (
    <div className="space-y-5">
      <label className="block text-sm font-medium text-slate-700">
        {copy.searchLabel}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.searchPlaceholder}
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedArea("all")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
            selectedArea === "all" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
          }`}
        >
          {copy.allAreas}
        </button>
        {areaOptions.slice(1).map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => setSelectedArea(area)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              selectedArea === area ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
        <span>{copy.showing}</span>
        <span>{filteredHotels.length}</span>
      </div>

      {filteredHotels.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredHotels.map((hotel) => {
            const isCurrent = hotel.slug === currentSlug;
            return (
              <Link
                key={hotel.slug}
                href={hotel.href}
                className={`rounded-[22px] border px-4 py-4 transition ${
                  isCurrent
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isCurrent ? "text-slate-300" : "text-slate-500"}`}>
                      {hotel.zoneName}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6">{hotel.name}</p>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      {copy.current}
                    </span>
                  ) : null}
                </div>
                <p className={`mt-4 text-xs font-semibold uppercase tracking-[0.2em] ${isCurrent ? "text-white" : "text-slate-700"}`}>
                  {copy.open}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          {copy.noResults}
        </div>
      )}
    </div>
  );
}
