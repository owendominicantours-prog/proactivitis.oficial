import Link from "next/link";
import { Locale, translate, type TranslationKey } from "@/lib/translations";

type HomeHeroContentProps = {
  locale: Locale;
};

export function HomeHeroContent({ locale }: HomeHeroContentProps) {
  const t = (key: TranslationKey, replacements?: Record<string, string | number>) =>
    translate(locale, key, replacements);

  return (
    <div className="max-w-4xl space-y-6 text-center text-white md:text-left">
      <p className="text-xs uppercase tracking-[0.8em] text-white/70">{t("home.hero.brand")}</p>
      <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{t("home.hero.title")}</h1>
      <p className="text-lg text-white/90">{t("home.hero.description")}</p>
      <div className="botones-banner">
        <Link href="/tours" className="boton-verde">
          {t("home.hero.cta.primary")}
        </Link>
        <Link href="/tours" className="boton-naranja">
          {t("home.hero.cta.secondary")}
        </Link>
      </div>
    </div>
  );
}
