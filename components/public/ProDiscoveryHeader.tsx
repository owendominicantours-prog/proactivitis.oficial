"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { PRODISCOVERY_LOGO_URL } from "@/lib/prodiscoveryBrand";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
};

const COPY = {
  es: {
    brand: "ProDiscovery",
    tagline: "Custom Group Planner",
    home: "Planificador",
    dominican: "Republica Dominicana",
    corporate: "Empresas",
    weddings: "Bodas",
    families: "Familias",
    language: "Idioma",
    book: "Planificar"
  },
  en: {
    brand: "ProDiscovery",
    tagline: "Custom Group Planner",
    home: "Planner",
    dominican: "Dominican Republic",
    corporate: "Companies",
    weddings: "Weddings",
    families: "Families",
    language: "Language",
    book: "Plan"
  },
  fr: {
    brand: "ProDiscovery",
    tagline: "Custom Group Planner",
    home: "Planificateur",
    dominican: "Republique dominicaine",
    corporate: "Entreprises",
    weddings: "Mariages",
    families: "Familles",
    language: "Langue",
    book: "Planifier"
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
  const safePath = normalized.startsWith("/prodiscovery/planificador-grupos-") ? "/prodiscovery" : normalized;
  const localizedPath = locale === "es" ? safePath : `/${locale}${safePath}`;
  return `${localizedPath}${query ? `?${query}` : ""}`;
};

export default function ProDiscoveryHeader({ locale }: Props) {
  const t = COPY[locale];
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const query = searchParams?.toString() ?? "";
  const base = `${localePrefix(locale)}/prodiscovery`;
  const normalizedPath = stripLocalePrefix(pathname);
  const navClass = (active: boolean) =>
    active
      ? "rounded-full bg-slate-950 px-3 py-1.5 font-semibold text-white shadow-sm"
      : "rounded-full border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900";
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={base} className="flex min-w-0 items-center gap-3">
            <span className="inline-flex rounded-2xl bg-white">
              <Image
                src={PRODISCOVERY_LOGO_URL}
                alt={t.brand}
                width={510}
                height={156}
                className="h-[120px] w-auto object-contain"
                priority
              />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-black tracking-tight text-slate-950">ProDiscovery: {t.tagline}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={base}
              className="hidden rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-emerald-700 sm:inline-flex"
            >
              {t.book}
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
                      active ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {targetLocale}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <nav className="-mx-1 flex overflow-x-auto pb-1 text-sm [scrollbar-width:none]">
          <div className="flex min-w-max items-center gap-2 px-1">
            <Link href={base} className={navClass(normalizedPath === "/prodiscovery")}>
              {t.home}
            </Link>
            <Link href={`${base}/republica-dominicana`} className={navClass(normalizedPath === "/prodiscovery/republica-dominicana")}>
              {t.dominican}
            </Link>
            <Link href={`${base}/grupos-corporativos`} className={navClass(normalizedPath === "/prodiscovery/grupos-corporativos")}>
              {t.corporate}
            </Link>
            <Link href={`${base}/bodas-y-celebraciones`} className={navClass(normalizedPath === "/prodiscovery/bodas-y-celebraciones")}>
              {t.weddings}
            </Link>
            <Link href={`${base}/familias-y-amigos`} className={navClass(normalizedPath === "/prodiscovery/familias-y-amigos")}>
              {t.families}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
