import Link from "next/link";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
};

const COPY = {
  es: {
    brand: "ProDiscovery",
    home: "Inicio",
    tours: "Tours",
    transfers: "Traslados",
    hotels: "Hoteles",
    rankings: "Rankings"
  },
  en: {
    brand: "ProDiscovery",
    home: "Home",
    tours: "Tours",
    transfers: "Transfers",
    hotels: "Hotels",
    rankings: "Rankings"
  },
  fr: {
    brand: "ProDiscovery",
    home: "Accueil",
    tours: "Excursions",
    transfers: "Transferts",
    hotels: "Hotels",
    rankings: "Classements"
  }
} as const;

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

export default function ProDiscoveryHeader({ locale }: Props) {
  const t = COPY[locale];
  const base = `${localePrefix(locale)}/prodiscovery`;
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={base} className="text-lg font-black tracking-tight text-slate-900">
          {t.brand}
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={base} className="rounded-full border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900">
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
        </nav>
      </div>
    </header>
  );
}
