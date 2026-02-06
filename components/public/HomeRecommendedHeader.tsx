import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";

type HomeRecommendedHeaderProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["recommended"];
};

export function HomeRecommendedHeader({ locale, overrides }: HomeRecommendedHeaderProps) {
  const t = (key: TranslationKey) => translate(locale, key);

  return (
    <div className="space-y-3 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
        {overrides?.label ?? t("home.section.recommended.label")}
      </p>
      <h2 className="text-3xl font-semibold text-slate-900">
        {overrides?.title ?? t("home.section.recommended.title")}
      </h2>
    </div>
  );
}
