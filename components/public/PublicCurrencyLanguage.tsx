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
    const pathPart = normalizedSegments.length ? `/${normalizedSegments.join("/")}` : "";
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600"
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
