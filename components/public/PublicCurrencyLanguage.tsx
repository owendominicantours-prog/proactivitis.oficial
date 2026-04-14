"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Locale, useTranslation } from "../../context/LanguageProvider";
import { SITE_CONFIG } from "@/lib/site-config";

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

export function PublicCurrencyLanguage() {
  const { locale, setLocale, t } = useTranslation();
  const [languageOpen, setLanguageOpen] = useState(false);
  const isFunjet = SITE_CONFIG.variant === "funjet";
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const pathSegments = pathname.split("/").filter(Boolean);
  const normalizedSegments =
    pathSegments.length > 0 && ["en", "fr"].includes(pathSegments[0]) ? pathSegments.slice(1) : pathSegments;

  const buildLocalizedPath = (target: Locale) => {
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
    <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] ${isFunjet ? "text-white" : "text-slate-600"}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setLanguageOpen((prev) => !prev);
          }}
          aria-label={t("header.language.label")}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isFunjet
              ? "border border-white/20 bg-white/10 text-white hover:border-[#FFC300] hover:text-[#FFC300]"
              : "border border-slate-200 text-slate-600"
          }`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.4 4 5.7 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.7-4-9s1.5-6.6 4-9Zm-8.2 7h16.4m-16.4 4h16.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {languageOpen && (
          <div
            className={`absolute left-0 z-50 mt-1 w-28 rounded-2xl shadow-lg ${
              isFunjet
                ? "border border-white/10 bg-[#4D0A7D] shadow-[0_18px_38px_rgba(40,5,66,0.35)]"
                : "border border-slate-200 bg-white"
            }`}
          >
            {languageOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`w-full px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.35em] ${
                  isFunjet ? "text-white/85 hover:bg-white/10 hover:text-[#FFC300]" : "text-slate-600 hover:bg-slate-50"
                }`}
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
