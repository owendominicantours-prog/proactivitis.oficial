"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { translations, type TranslationKey, Locale as TranslationLocale } from "../lib/translations";

export type Locale = TranslationLocale;
export const defaultLocale: Locale = "es";

type TranslationReplacements = Record<string, string | number>;

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (
    key: TranslationKey,
    replacements?: TranslationReplacements | string,
    fallback?: string
  ) => string;
  availableLocales: readonly Locale[];
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const [, firstSegment] = (pathname ?? window.location.pathname).split("/");
    const normalizedSegment = firstSegment?.toLowerCase();
    if (normalizedSegment && normalizedSegment in translations) {
      setLocale(normalizedSegment as Locale);
      return;
    }

    const stored = window.localStorage.getItem("proactivitis-language");
    if (stored && stored in translations) {
      setLocale(stored as Locale);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("proactivitis-language", locale);
    }
  }, [locale]);

  const translate = (
    key: TranslationKey,
    replacementsOrFallback?: TranslationReplacements | string,
    fallback?: string
  ) => {
    let replacements: TranslationReplacements | undefined;
    let fallbackValue: string | undefined = fallback;

    if (typeof replacementsOrFallback === "string") {
      fallbackValue = replacementsOrFallback;
    } else if (replacementsOrFallback) {
      replacements = replacementsOrFallback;
    }

    let value = translations[locale][key as keyof typeof translations["es"]];
    value = value ?? fallbackValue ?? key;

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, replacement]) => {
        value = value.replaceAll(`{${placeholder}}`, String(replacement));
      });
    }

    return value;
  };

  const availableLocales = useMemo(() => Object.keys(translations) as Locale[], []);

  const contextValue: LanguageContextValue = {
    locale,
    setLocale,
    t: translate,
    availableLocales
  };

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
