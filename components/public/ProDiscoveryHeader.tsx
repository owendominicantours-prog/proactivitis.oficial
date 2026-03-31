"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
};

const COPY = {
  es: {
    brand: "ProDiscovery",
    tagline: "Compara, valida y reserva",
    home: "Inicio",
    tours: "Tours",
    transfers: "Traslados",
    hotels: "Hoteles",
    rankings: "Rankings",
    language: "Idioma"
  },
  en: {
    brand: "ProDiscovery",
    tagline: "Compare, validate and book",
    home: "Home",
    tours: "Tours",
    transfers: "Transfers",
    hotels: "Hotels",
    rankings: "Rankings",
    language: "Language"
  },
  fr: {
    brand: "ProDiscovery",
    tagline: "Comparez, validez et reservez",
    home: "Accueil",
    tours: "Excursions",
    transfers: "Transferts",
    hotels: "Hotels",
    rankings: "Classements",
    language: "Langue"
  }
} as const;

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
const stripLocalePrefix = (pathname: string) => {
  if (pathname === "/en" || pathname === "/fr") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  if (pathname.startsWith("/fr/")) return pathname.slice(3);
  return pathname;
};
const buildLocaleHref = (locale: Locale, pathname: string, query: string) => {
  const normalized = stripLocalePrefix(pathname || "/");
  const localizedPath = locale === "es" ? normalized : `/${locale}${normalized}`;
  return `${localizedPath}${query ? `?${query}` : ""}`;
};

export default function ProDiscoveryHeader({ locale }: Props) {
  const t = COPY[locale];
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const query = searchParams?.toString() ?? "";
  const base = `${localePrefix(locale)}/prodiscovery`;
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={base} className="min-w-0">
            <p className="text-lg font-black tracking-tight text-slate-900">{t.brand}</p>
            <p className="text-xs font-medium text-slate-500">{t.tagline}</p>
          </Link>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="hidden text-slate-500 sm:inline">{t.language}</span>
            {(["es", "en", "fr"] as const).map((targetLocale) => {
              const active = locale === targetLocale;
              return (
                <Link
                  key={targetLocale}
                  href={buildLocaleHref(targetLocale, pathname, query)}
                  className={`rounded-full px-2.5 py-1 font-semibold uppercase tracking-[0.08em] ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {targetLocale}
                </Link>
              );
            })}
          </div>
        </div>
        <nav className="-mx-1 flex overflow-x-auto pb-1 text-sm [scrollbar-width:none]">
          <div className="flex min-w-max items-center gap-2 px-1">
            <Link
              href={base}
              className="rounded-full border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              {t.home}
            </Link>
            <Link
              href={`${base}?type=tour`}
              className="rounded-full border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              {t.tours}
            </Link>
            <Link
              href={`${base}?type=transfer`}
              className="rounded-full border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              {t.transfers}
            </Link>
            <Link
              href={`${base}?type=hotel`}
              className="rounded-full border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              {t.hotels}
            </Link>
            <Link
              href={`${base}/top/punta-cana/tours`}
              className="rounded-full bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
            >
              {t.rankings}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
