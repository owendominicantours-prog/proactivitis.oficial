import Link from "next/link";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";

type HomeHeroContentProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["hero"];
};

export function HomeHeroContent({ locale, overrides }: HomeHeroContentProps) {
  const t = (key: TranslationKey, replacements?: Record<string, string | number>) =>
    translate(locale, key, replacements);

  return (
    <div className="max-w-4xl space-y-6 text-center text-white md:text-left">
      <p className="text-xs uppercase tracking-[0.8em] text-white/70">
        {overrides?.brand ?? t("home.hero.brand")}
      </p>
      <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
        {overrides?.title ?? t("home.hero.title")}
      </h1>
      <p className="text-lg text-white/90">{overrides?.description ?? t("home.hero.description")}</p>
      <div className="botones-banner">
        <Link href="/tours" className="boton-verde">
          {overrides?.ctaPrimary ?? t("home.hero.cta.primary")}
        </Link>
        <Link href="/tours" className="boton-naranja">
          {overrides?.ctaSecondary ?? t("home.hero.cta.secondary")}
        </Link>
      </div>
    </div>
  );
}
