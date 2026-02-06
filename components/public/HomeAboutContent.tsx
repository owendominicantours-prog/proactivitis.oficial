import Link from "next/link";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";

type HomeAboutContentProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["about"];
};

export function HomeAboutContent({ locale, overrides }: HomeAboutContentProps) {
  const t = (key: TranslationKey) => translate(locale, key);

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
        {overrides?.label ?? t("home.section.about.label")}
      </p>
      <h2 className="text-3xl font-semibold text-slate-900">
        {overrides?.title ?? t("home.section.about.title")}
      </h2>
      <p className="text-sm text-slate-600">{overrides?.description ?? t("home.section.about.description")}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/tours" className="boton-verde">
          {overrides?.ctaPrimary ?? t("home.section.about.cta.primary")}
        </Link>
        <Link href="/contact" className="boton-naranja">
          {overrides?.ctaSecondary ?? t("home.section.about.cta.secondary")}
        </Link>
      </div>
    </div>
  );
}
