import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";

type HomeRecommendedHeaderProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["recommended"];
};

export function HomeRecommendedHeader({ locale, overrides }: HomeRecommendedHeaderProps) {
  const t = (key: TranslationKey) => translate(locale, key);

  return (
    <div className="flex flex-col gap-3 text-left sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-700">
          {overrides?.label ?? t("home.section.recommended.label")}
        </p>
        <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
          {overrides?.title ?? t("home.section.recommended.title")}
        </h2>
      </div>
      <p className="max-w-sm text-sm font-medium leading-6 text-slate-600">
        {locale === "es"
          ? "Experiencias con demanda real, fotos claras y salida coordinada desde tu zona."
          : locale === "fr"
            ? "Experiences demandees, photos claires et depart coordonne depuis votre zone."
            : "High-demand experiences with clear photos and coordinated pickup from your area."}
      </p>
    </div>
  );
}
