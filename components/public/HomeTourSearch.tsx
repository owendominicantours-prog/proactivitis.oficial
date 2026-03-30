"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Locale, translate } from "@/lib/translations";

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
    <div className="rounded-[28px] border border-slate-300 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:p-6">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-700">
            {translate(locale, "home.tourSearch.label")}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{translate(locale, "home.tourSearch.helper")}</p>
        </div>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={translate(locale, "home.tourSearch.placeholder")}
            className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-950 placeholder:font-normal placeholder:text-slate-500 shadow-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-200/60"
          />
          {normalizedQuery.length >= 2 && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-slate-300 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
              {results.length ? (
                <>
                  <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-600">
                    {translate(locale, "home.tourSearch.resultsLabel")}
                  </p>
                  <div className="max-h-[320px] space-y-2 overflow-auto">
                    {results.map((tour) => (
                      <Link
                        key={tour.id}
                        href={`${base}/tours/${tour.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-white"
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
                          <p className="truncate text-sm font-semibold text-slate-900">{tour.title}</p>
                          <p className="truncate text-xs font-medium text-slate-600">{tour.location ?? "Punta Cana"}</p>
                        </div>
                        <span className="ml-auto text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                          {translate(locale, "tour.card.details")}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <p className="px-2 py-2 text-xs font-medium text-slate-600">
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
