import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";
import { SITE_CONFIG } from "@/lib/site-config";

type HomeRecommendedHeaderProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["recommended"];
};

export function HomeRecommendedHeader({ locale, overrides }: HomeRecommendedHeaderProps) {
  const t = (key: TranslationKey) => translate(locale, key);
  const isFunjet = SITE_CONFIG.variant === "funjet";

  return (
    <div className={`space-y-3 text-center ${isFunjet ? "rounded-[32px] border border-[#E9D7FA] bg-white px-6 py-8 shadow-[0_20px_55px_rgba(106,13,173,0.12)]" : ""}`}>
      <p className={`text-xs uppercase tracking-[0.4em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
        {overrides?.label ?? t("home.section.recommended.label")}
      </p>
      <h2 className={`text-3xl ${isFunjet ? "font-bold text-[#34114A]" : "font-semibold text-slate-900"}`}>
        {overrides?.title ?? t("home.section.recommended.title")}
      </h2>
      {isFunjet ? (
        <p className="mx-auto max-w-2xl text-sm leading-6 text-[#6B4D82]">
          Turismo moderno, dinamico y confiable para viajeros que quieren reservar facil y vivir experiencias memorables.
        </p>
      ) : null}
    </div>
  );
}
