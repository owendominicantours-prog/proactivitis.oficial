"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Locale, useTranslation } from "../../context/LanguageProvider";

type LanguageOption = {
  label: string;
  value: Locale;
  textKey: "language.spanish" | "language.english" | "language.french";
};

const languageOptions: LanguageOption[] = [
  { label: "ES", value: "es", textKey: "language.spanish" },
  { label: "EN", value: "en", textKey: "language.english" },
  { label: "FR", value: "fr", textKey: "language.french" }
];

const SEGMENT_LOCALIZATION: Record<string, Record<Locale, string>> = {
  hotels: { es: "hoteles", en: "hotels", fr: "hotels" }
};

const ROUTE_LOCALIZATION: Record<string, Record<Locale, string>> = {
  "/excursion-buggy-punta-cana": {
    es: "/excursion-buggy-punta-cana",
    en: "/buggy-tour-punta-cana",
    fr: "/tour-buggy-punta-cana"
  },
  "/buggy-tour-punta-cana": {
    es: "/excursion-buggy-punta-cana",
    en: "/buggy-tour-punta-cana",
    fr: "/tour-buggy-punta-cana"
  },
  "/tour-buggy-punta-cana": {
    es: "/excursion-buggy-punta-cana",
    en: "/buggy-tour-punta-cana",
    fr: "/tour-buggy-punta-cana"
  }
};

const EXPERIENCE_BASE_BY_LOCALE: Record<Locale, string> = {
  es: "excursiones-punta-cana",
  en: "punta-cana-excursions",
  fr: "excursions-punta-cana"
};

const EXPERIENCE_INTENT_SLUGS = [
  { es: "con-recogida-en-hotel", en: "hotel-pickup", fr: "prise-en-charge-hotel" },
  { es: "para-familias", en: "families", fr: "familles" },
  { es: "para-parejas", en: "couples", fr: "couples" },
  { es: "privado-vip", en: "private-vip", fr: "prive-vip" },
  { es: "ultimo-minuto", en: "last-minute", fr: "derniere-minute" },
  { es: "mejor-precio", en: "best-price", fr: "meilleur-prix" },
  { es: "top-rated", en: "top-rated", fr: "mieux-notes" },
  { es: "comparativa-excursiones", en: "compare-excursions", fr: "comparer-excursions" }
];

const invertSegmentLocalization = () => {
  const index: Record<string, string> = {};
  for (const [canonical, localizedByLocale] of Object.entries(SEGMENT_LOCALIZATION)) {
    for (const localized of Object.values(localizedByLocale)) {
      index[localized] = canonical;
    }
  }
  return index;
};

const LOCALIZED_SEGMENT_TO_CANONICAL = invertSegmentLocalization();

const canonicalExperienceIntent = (slug: string) =>
  EXPERIENCE_INTENT_SLUGS.find((entry) => Object.values(entry).includes(slug)) ?? null;

export function PublicCurrencyLanguage() {
  const { locale, setLocale, t } = useTranslation();
  const [languageOpen, setLanguageOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const pathSegments = pathname.split("/").filter(Boolean);
  const normalizedSegments =
    pathSegments.length > 0 && ["en", "fr"].includes(pathSegments[0]) ? pathSegments.slice(1) : pathSegments;

  const buildLocalizedPath = (target: Locale) => {
    const normalizedPath = normalizedSegments.length ? `/${normalizedSegments.join("/")}` : "/";
    const localizedRoute = ROUTE_LOCALIZATION[normalizedPath];
    if (localizedRoute) {
      const query = searchParams.toString();
      const targetPath = target === "es" ? localizedRoute.es : `/${target}${localizedRoute[target]}`;
      return `${targetPath}${query ? `?${query}` : ""}`;
    }

    const currentExperienceBase = normalizedSegments[0];
    const isExperienceRoute = Object.values(EXPERIENCE_BASE_BY_LOCALE).includes(currentExperienceBase);
    if (isExperienceRoute) {
      const targetBase = EXPERIENCE_BASE_BY_LOCALE[target];
      const nextSegments = [targetBase, ...normalizedSegments.slice(1)];
      if (nextSegments[1] && nextSegments[1] !== "tour") {
        const intent = canonicalExperienceIntent(nextSegments[1]);
        if (intent) nextSegments[1] = intent[target];
      }
      const prefix = target === "es" ? "" : `/${target}`;
      const query = searchParams.toString();
      return `${prefix}/${nextSegments.join("/")}${query ? `?${query}` : ""}`;
    }

    const translatedSegments = [...normalizedSegments];
    if (translatedSegments.length > 0) {
      const first = translatedSegments[0];
      const canonical = LOCALIZED_SEGMENT_TO_CANONICAL[first];
      if (canonical && SEGMENT_LOCALIZATION[canonical]?.[target]) {
        translatedSegments[0] = SEGMENT_LOCALIZATION[canonical][target];
      }
    }
    const pathPart = translatedSegments.length ? `/${translatedSegments.join("/")}` : "";
    const prefix = target === "es" ? "" : `/${target}`;
    const path = `${prefix}${pathPart}` || "/";
    const query = searchParams.toString();
    return `${path}${query ? `?${query}` : ""}`;
  };

  const handleLocaleChange = (target: Locale) => {
    setLanguageOpen(false);
    setLocale(target);
    router.push(buildLocalizedPath(target));
  };

  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-600">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setLanguageOpen((prev) => !prev);
          }}
          aria-label={t("header.language.label")}
          className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-black tracking-normal text-[#071329] shadow-sm"
        >
          {locale.toUpperCase()}
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {languageOpen && (
          <div className="absolute left-0 mt-1 w-28 rounded-2xl border border-slate-200 bg-white shadow-lg z-50">
            {languageOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className="w-full px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-600 hover:bg-slate-50"
                onClick={() => handleLocaleChange(option.value)}
              >
                {t(option.textKey)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
