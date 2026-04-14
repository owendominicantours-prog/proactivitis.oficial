"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Locale, translate } from "@/lib/translations";
import { SITE_CONFIG } from "@/lib/site-config";

type TourSearchItem = {
  id: string;
  slug: string;
  title: string;
  location?: string | null;
  image?: string | null;
};

type Props = {
  locale: Locale;
  tours: TourSearchItem[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const levenshtein = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const scoreMatch = (query: string, haystack: string) => {
  const tokens = query.split(" ").filter(Boolean);
  if (!tokens.length) return null;
  if (tokens.every((token) => haystack.includes(token))) return 0;

  const words = haystack.split(" ").filter(Boolean);
  const threshold = query.length <= 4 ? 1 : query.length <= 8 ? 2 : 3;
  let total = 0;

  for (const token of tokens) {
    let best = Infinity;
    for (const word of words) {
      if (word.startsWith(token)) {
        best = 0;
        break;
      }
      const distance = levenshtein(token, word);
      if (distance < best) best = distance;
    }
    total += best;
  }

  return total <= threshold * tokens.length ? total : null;
};

export default function HomeTourSearch({ locale, tours }: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);
  const base = locale === "es" ? "" : `/${locale}`;
  const isFunjet = SITE_CONFIG.variant === "funjet";

  const results = useMemo(() => {
    if (normalizedQuery.length < 2) return [];
    const scored = tours
      .map((tour) => {
        const text = normalize(`${tour.title} ${tour.slug} ${tour.location ?? ""}`);
        const score = scoreMatch(normalizedQuery, text);
        if (score === null) return null;
        return { tour, score };
      })
      .filter((item): item is { tour: TourSearchItem; score: number } => item !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);
    return scored.map((item) => item.tour);
  }, [normalizedQuery, tours]);

  return (
    <div
      className={`p-5 sm:p-6 ${
        isFunjet
          ? "rounded-[34px] border border-[#E6D2FB] bg-[linear-gradient(140deg,#4D0A7D_0%,#6A0DAD_62%,#7B24C5_100%)] shadow-[0_30px_80px_rgba(63,9,102,0.32)]"
          : "rounded-[28px] border border-slate-300 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70"
      }`}
    >
      <div className="space-y-3">
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.32em] ${isFunjet ? "text-[#FFD86E]" : "text-slate-700"}`}>
            {isFunjet
              ? locale === "es"
                ? "Radar de experiencias"
                : locale === "fr"
                  ? "Radar d experiences"
                  : "Experience radar"
              : translate(locale, "home.tourSearch.label")}
          </p>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${isFunjet ? "text-white/86" : "text-slate-700"}`}>
            {isFunjet
              ? locale === "es"
                ? "Escribe una idea simple y te mostramos opciones que encajan rapido. Saona, buggy, snorkel, catamaran o destinos aunque escribas con errores."
                : locale === "fr"
                  ? "Ecrivez une idee simple et nous vous montrons rapidement les options correspondantes. Saona, buggy, snorkel, catamaran ou destinations meme avec fautes."
                  : "Type a simple idea and we quickly surface matching options. Saona, buggy, snorkel, catamaran, or destinations even with typos."
              : translate(locale, "home.tourSearch.helper")}
          </p>
        </div>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              isFunjet
                ? locale === "es"
                  ? "Prueba: Saona, buggy, snorkel, Santo Domingo"
                  : locale === "fr"
                    ? "Essayez : Saona, buggy, snorkel, Saint-Domingue"
                    : "Try: Saona, buggy, snorkel, Santo Domingo"
                : translate(locale, "home.tourSearch.placeholder")
            }
            className={`w-full rounded-[24px] px-4 py-4 text-sm font-medium outline-none transition ${
              isFunjet
                ? "border border-white/15 bg-white/10 text-white placeholder:font-normal placeholder:text-white/55 focus:border-[#FFD86E] focus:bg-white/12 focus:ring-4 focus:ring-[#FFD86E]/25"
                : "border-2 border-slate-300 bg-slate-50 text-slate-950 placeholder:font-normal placeholder:text-slate-500 shadow-sm focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-200/60"
            }`}
          />
          {normalizedQuery.length >= 2 && (
            <div
              className={`absolute left-0 right-0 top-[calc(100%+8px)] z-20 p-3 ${
                isFunjet
                  ? "rounded-[26px] border border-white/10 bg-[#4B0A79] shadow-[0_20px_60px_rgba(18,3,29,0.45)]"
                  : "rounded-2xl border border-slate-300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
              }`}
            >
              {results.length ? (
                <>
                  <p className={`px-2 pb-2 text-xs font-bold uppercase tracking-[0.3em] ${isFunjet ? "text-[#FFD86E]" : "text-slate-600"}`}>
                    {isFunjet
                      ? locale === "es"
                        ? "Coincidencias funjet"
                        : locale === "fr"
                          ? "Correspondances funjet"
                          : "Funjet matches"
                      : translate(locale, "home.tourSearch.resultsLabel")}
                  </p>
                  <div className="max-h-[320px] space-y-2 overflow-auto">
                    {results.map((tour) => (
                      <Link
                        key={tour.id}
                        href={`${base}/tours/${tour.slug}`}
                        className={`flex items-center gap-3 p-3 transition ${
                          isFunjet
                            ? "rounded-[20px] border border-white/10 bg-white/7 hover:border-[#FFD86E] hover:bg-white/10"
                            : "rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-white"
                        }`}
                      >
                        <div className="h-12 w-14 overflow-hidden rounded-lg bg-slate-200">
                          {tour.image ? (
                            <Image
                              src={tour.image}
                              alt={tour.title}
                              width={56}
                              height={48}
                              className="h-full w-full object-cover"
                              sizes="56px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${isFunjet ? "text-white" : "text-slate-900"}`}>{tour.title}</p>
                          <p className={`truncate text-xs font-medium ${isFunjet ? "text-white/65" : "text-slate-600"}`}>{tour.location ?? "Punta Cana"}</p>
                        </div>
                        <span className={`ml-auto text-xs font-bold uppercase tracking-[0.2em] ${isFunjet ? "text-[#FFD86E]" : "text-emerald-700"}`}>
                          {isFunjet ? (locale === "es" ? "Abrir" : locale === "fr" ? "Voir" : "Open") : translate(locale, "tour.card.details")}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <p className={`px-2 py-2 text-xs font-medium ${isFunjet ? "text-white/75" : "text-slate-600"}`}>
                  {translate(locale, "home.tourSearch.noResults")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
