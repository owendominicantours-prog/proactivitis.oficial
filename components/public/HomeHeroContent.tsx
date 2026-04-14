import Link from "next/link";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";
import { SITE_CONFIG } from "@/lib/site-config";

type HomeHeroContentProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["hero"];
};

export function HomeHeroContent({ locale, overrides }: HomeHeroContentProps) {
  const t = (key: TranslationKey, replacements?: Record<string, string | number>) =>
    translate(locale, key, replacements);
  const toursHref = locale === "es" ? "/tours" : `/${locale}/tours`;
  const transfersHref = locale === "es" ? "/traslado" : `/${locale}/traslado`;
  const isFunjet = SITE_CONFIG.variant === "funjet";

  const funjetEyebrow =
    locale === "es"
      ? "Funjet direct booking"
      : locale === "fr"
        ? "Funjet reservation directe"
        : "Funjet direct booking";
  const funjetTitle =
    locale === "es"
      ? "Viajes y experiencias memorables en Punta Cana"
      : locale === "fr"
        ? "Voyages et experiences memorables a Punta Cana"
        : "Travel and memorable experiences in Punta Cana";
  const funjetDescription =
    locale === "es"
      ? "Tours, catamaranes, Saona, buggies y traslados privados con una marca mas fresca, dinamica y hecha para reservar sin vueltas."
      : locale === "fr"
        ? "Tours, catamarans, Saona, buggies et transferts prives avec une marque plus fraiche, dynamique et concue pour reserver simplement."
        : "Tours, catamarans, Saona, buggies, and private transfers with a fresher, more dynamic brand built for easy booking.";

  return (
    <div className={`max-w-4xl space-y-6 text-center text-white md:text-left ${isFunjet ? "py-10" : ""}`}>
      <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
        <p className={`text-xs uppercase tracking-[0.8em] ${isFunjet ? "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90" : "text-white/70"}`}>
          {isFunjet ? funjetEyebrow : overrides?.brand ?? t("home.hero.brand")}
        </p>
        {isFunjet ? (
          <span className="rounded-full bg-[#FFC300] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-[#4D0A7D]">
            {locale === "es" ? "Explora, disfruta, repite" : locale === "fr" ? "Explorer, profiter, recommencer" : "Explore, enjoy, repeat"}
          </span>
        ) : null}
      </div>
      <h1 className={`leading-tight ${isFunjet ? "text-5xl font-bold md:text-6xl" : "text-4xl font-semibold md:text-5xl"}`}>
        {isFunjet ? (
          <>
            <span className="block font-[var(--font-brand)] text-[#FFC300]">Funjet</span>
            <span className="mt-3 block">{funjetTitle}</span>
          </>
        ) : (
          overrides?.title ?? t("home.hero.title")
        )}
      </h1>
      <p className={`max-w-2xl ${isFunjet ? "text-xl text-white/95" : "text-lg text-white/90"}`}>
        {isFunjet ? funjetDescription : overrides?.description ?? t("home.hero.description")}
      </p>
      {isFunjet ? (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/90 md:justify-start">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">🌴 Experiencias tropicales</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">✈️ Reservas rápidas</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">🤝 Soporte cercano</span>
        </div>
      ) : null}
      <div className="botones-banner">
        <Link href={toursHref} className="boton-verde">
          {overrides?.ctaPrimary ?? t("home.hero.cta.primary")}
        </Link>
        <Link href={transfersHref} className="boton-naranja">
          {overrides?.ctaSecondary ?? t("home.hero.cta.secondary")}
        </Link>
      </div>
    </div>
  );
}
