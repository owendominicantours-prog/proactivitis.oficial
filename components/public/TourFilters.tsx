"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SITE_CONFIG } from "@/lib/site-config";

export type DurationOption = { value: string; label: string };

interface Props {
  countries: { name: string; slug: string }[];
  destinations: { name: string; slug: string; countrySlug: string }[];
  languages: string[];
  durations: DurationOption[];
  categories?: string[];
  mobileFriendly?: boolean;
}

export function TourFilters({
  countries,
  destinations,
  languages,
  durations,
  categories,
  mobileFriendly
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFunjet = SITE_CONFIG.variant === "funjet";

  const [country, setCountry] = useState("");
  const [destination, setDestination] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState("");

  const searchCountry = searchParams.get("country") ?? "";
  const searchDestination = searchParams.get("destination") ?? "";
  const searchMinPrice = searchParams.get("minPrice") ?? "";
  const searchMaxPrice = searchParams.get("maxPrice") ?? "";
  const searchLanguage = searchParams.get("language") ?? "";
  const searchDuration = searchParams.get("duration") ?? "";

  useEffect(() => {
    setCountry(searchCountry);
    setDestination(searchDestination);
    setMinPrice(searchMinPrice);
    setMaxPrice(searchMaxPrice);
    setLanguage(searchLanguage);
    setDuration(searchDuration);
  }, [searchCountry, searchDestination, searchMinPrice, searchMaxPrice, searchLanguage, searchDuration]);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (destination) params.set("destination", destination);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (language) params.set("language", language);
    if (duration) params.set("duration", duration);
    const query = params.toString();
    router.push(query ? `/tours?${query}` : "/tours");
  };

  const handleReset = () => {
    setCountry("");
    setDestination("");
    setMinPrice("");
    setMaxPrice("");
    setLanguage("");
    setDuration("");
    router.push("/tours");
  };

  const filteredDestinations = country ? destinations.filter((dest) => dest.countrySlug === country) : destinations;
  const fieldClass = isFunjet
    ? "mt-1 w-full rounded-[18px] border border-[#E6D2FB] bg-white px-3 py-2 text-sm text-[#34114A]"
    : "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900";
  const labelClass = isFunjet ? "text-[0.7rem] font-semibold text-[#4D0A7D]" : "text-[0.7rem] font-semibold text-slate-600";

  return (
    <form
      className={`space-y-4 p-4 shadow-md ${
        isFunjet
          ? "rounded-[30px] border border-[#E6D2FB] bg-[linear-gradient(180deg,#ffffff_0%,#faf2ff_100%)]"
          : "rounded-2xl border border-slate-200 bg-white"
      }`}
    >
      <p className={`text-xs uppercase tracking-[0.3em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
        {isFunjet ? "Funjet filters" : "Filtros"}
      </p>

      {mobileFriendly ? (
        <p className={`text-[0.65rem] ${isFunjet ? "text-[#6B4D82]" : "text-slate-500"}`}>
          {isFunjet
            ? "Ajusta destino, rango de precio y duracion para quedarte con una seleccion mas limpia."
            : "Filtros optimizados para movil, listos para tocar y ajustar rapidamente."}
        </p>
      ) : null}

      {categories && categories.length > 0 ? (
        <div className="space-y-2">
          <p className={`text-[0.7rem] font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
            Categoria
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.3em] ${
                  isFunjet
                    ? "border border-[#E6D2FB] bg-white text-[#6A0DAD]"
                    : "border border-slate-200 text-slate-600"
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <label className={labelClass}>
        Pais
        <select
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setDestination("");
          }}
          className={fieldClass}
        >
          <option value="">Todos los paises</option>
          {countries.map((countryOption) => (
            <option key={countryOption.slug} value={countryOption.slug}>
              {countryOption.name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Zona o destino
        <select value={destination} onChange={(event) => setDestination(event.target.value)} className={fieldClass}>
          <option value="">Todas las zonas</option>
          {filteredDestinations.map((destinationOption) => (
            <option key={destinationOption.slug} value={destinationOption.slug}>
              {destinationOption.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className={labelClass}>
          Precio minimo
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className={fieldClass}
            placeholder="0"
          />
        </label>
        <label className={labelClass}>
          Precio maximo
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className={fieldClass}
            placeholder="500"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className={labelClass}>
          Idioma
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className={fieldClass}>
            <option value="">Cualquier idioma</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Duracion
          <select value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClass}>
            <option value="">Cualquier duracion</option>
            {durations.map((durationOption) => (
              <option key={durationOption.value} value={durationOption.value}>
                {durationOption.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleApply}
          className={`w-full rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white ${
            isFunjet ? "bg-[#6A0DAD] hover:bg-[#58108F]" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={`w-full rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
            isFunjet
              ? "border-[#E6D2FB] bg-white text-[#6A0DAD] hover:border-[#CFAAF1]"
              : "border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900"
          }`}
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
