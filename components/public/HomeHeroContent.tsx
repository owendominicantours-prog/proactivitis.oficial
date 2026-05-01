import Link from "next/link";
import { Locale } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";

type HomeHeroContentProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["hero"];
};

const heroCopy = {
  es: {
    brand: "Tours + traslados en República Dominicana",
    title: "Reserva experiencias y traslados confiables sin perder tiempo",
    description:
      "Explora tours reales, coordina tu llegada y reserva con soporte humano local antes, durante y después del viaje.",
    primary: "Explorar tours",
    secondary: "Reservar traslado",
    proof: ["Fotos verificadas", "Pago seguro", "Soporte 24/7"]
  },
  en: {
    brand: "Tours + transfers in the Dominican Republic",
    title: "Book trusted experiences and transfers without wasting time",
    description:
      "Explore real tours, coordinate your arrival, and book with local human support before, during, and after your trip.",
    primary: "Explore tours",
    secondary: "Book transfer",
    proof: ["Verified photos", "Secure payment", "24/7 support"]
  },
  fr: {
    brand: "Tours + transferts en Republique dominicaine",
    title: "Reservez experiences et transferts fiables sans perdre de temps",
    description:
      "Explorez de vrais tours, coordonnez votre arrivee et reservez avec une assistance humaine locale avant, pendant et apres le voyage.",
    primary: "Explorer les tours",
    secondary: "Reserver un transfert",
    proof: ["Photos verifiees", "Paiement securise", "Support 24/7"]
  }
} as const;

export function HomeHeroContent({ locale, overrides }: HomeHeroContentProps) {
  const copy = heroCopy[locale];
  const localePrefix = locale === "es" ? "" : `/${locale}`;

  return (
    <div className="max-w-4xl space-y-6 text-center text-white md:text-left">
      <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-white/85 backdrop-blur">
        {overrides?.brand ?? copy.brand}
      </p>
      <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
        {overrides?.title ?? copy.title}
      </h1>
      <p className="max-w-2xl text-base font-medium leading-7 text-white/90 md:text-lg">
        {overrides?.description ?? copy.description}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
        <Link
          href={`${localePrefix}/tours`}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
        >
          {overrides?.ctaPrimary ?? copy.primary}
        </Link>
        <Link
          href={`${localePrefix}/traslado`}
          className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-6 py-4 text-sm font-black text-white shadow-xl shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
        >
          {overrides?.ctaSecondary ?? copy.secondary}
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
        {copy.proof.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/20 bg-slate-950/35 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
