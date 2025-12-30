import { Locale, translate, type TranslationKey } from "@/lib/translations";

type HomeRecommendedHeaderProps = {
  locale: Locale;
};

export function HomeRecommendedHeader({ locale }: HomeRecommendedHeaderProps) {
  const t = (key: TranslationKey) => translate(locale, key);

  return (
    <div className="space-y-3 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("home.section.recommended.label")}</p>
      <h2 className="text-3xl font-semibold text-slate-900">{t("home.section.recommended.title")}</h2>
    </div>
  );
}
