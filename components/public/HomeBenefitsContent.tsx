import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";
import { SITE_CONFIG } from "@/lib/site-config";

const benefits = [
  {
    icon: "24/7",
    titleKey: "home.benefits.support.title",
    descriptionKey: "home.benefits.support.description"
  },
  {
    icon: "OK",
    titleKey: "home.benefits.allies.title",
    descriptionKey: "home.benefits.allies.description"
  },
  {
    icon: "FX",
    titleKey: "home.benefits.flexible.title",
    descriptionKey: "home.benefits.flexible.description"
  }
] as const;

type HomeBenefitsContentProps = {
  locale: Locale;
  overrides?: HomeContentOverrides["benefits"];
};

export function HomeBenefitsContent({ locale, overrides }: HomeBenefitsContentProps) {
  const t = (key: TranslationKey) => translate(locale, key);
  const isFunjet = SITE_CONFIG.variant === "funjet";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:items-start">
      <div className={`space-y-3 rounded-[28px] px-6 py-6 shadow-sm ${isFunjet ? "border border-[#E9D7FA] bg-[linear-gradient(160deg,#6A0DAD_0%,#8B32D1_100%)] text-white shadow-[0_24px_60px_rgba(106,13,173,0.24)]" : "border border-slate-200 bg-white"}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${isFunjet ? "text-white/70" : "text-slate-500"}`}>
          {overrides?.label ?? t("home.section.whatWeDo.label")}
        </p>
        <h2 className={`text-2xl leading-tight md:text-[2rem] ${isFunjet ? "text-white" : "font-semibold text-slate-900"}`}>
          {overrides?.title ?? t("home.section.whatWeDo.title")}
        </h2>
        <p className={`max-w-xl text-sm leading-6 ${isFunjet ? "text-white/90" : "text-slate-600"}`}>
          {overrides?.description ?? t("home.section.whatWeDo.description")}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.titleKey}
            className={`rounded-[28px] px-5 py-5 shadow-sm ${isFunjet ? "border border-[#E9D7FA] bg-white shadow-[0_16px_40px_rgba(106,13,173,0.12)]" : "border border-slate-200 bg-white"}`}
          >
            <div className="flex items-start gap-3">
              <span className={`flex h-12 min-w-12 items-center justify-center rounded-2xl px-2 text-[11px] font-bold uppercase tracking-[0.14em] ${isFunjet ? "border border-[#FFE082] bg-[#FFF4CC] text-[#6A0DAD]" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {benefit.icon}
              </span>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold leading-5 text-slate-900">
                  {overrides?.items?.[index]?.title ?? t(benefit.titleKey)}
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  {overrides?.items?.[index]?.description ?? t(benefit.descriptionKey)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
