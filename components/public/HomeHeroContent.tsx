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
      ? "Reserva tours y traslados sin vueltas"
      : locale === "fr"
        ? "Reservez tours et transferts sans detours"
        : "Book tours and transfers fast";
  const funjetDescription =
    locale === "es"
      ? "Abre tours, cotiza traslados y decide rapido."
      : locale === "fr"
        ? "Ouvrez les tours, calculez les transferts et decidez rapidement."
        : "Open tours, quote transfers, and decide quickly.";

  return (
    <div className={`max-w-4xl space-y-6 text-center text-white md:text-left ${isFunjet ? "py-10" : ""}`}>
      <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
        <p className={`text-xs uppercase tracking-[0.8em] ${isFunjet ? "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90" : "text-white/70"}`}>
          {isFunjet ? funjetEyebrow : overrides?.brand ?? t("home.hero.brand")}
        </p>
        {isFunjet ? (
          <span className="rounded-full bg-[#FFC300] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-[#4D0A7D]">
            {locale === "es" ? "Entra y reserva" : locale === "fr" ? "Entrez et reservez" : "Open and book"}
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
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
            {locale === "es" ? "Tours listos" : locale === "fr" ? "Tours prets" : "Ready tours"}
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
            {locale === "es" ? "Traslados rapidos" : locale === "fr" ? "Transferts rapides" : "Fast transfers"}
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
            {locale === "es" ? "Reserva directa" : locale === "fr" ? "Reservation directe" : "Direct booking"}
          </span>
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
