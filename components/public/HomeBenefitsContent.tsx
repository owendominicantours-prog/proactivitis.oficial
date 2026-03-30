import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";

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

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:items-start">
      <div className="space-y-3 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          {overrides?.label ?? t("home.section.whatWeDo.label")}
        </p>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900 md:text-[2rem]">
          {overrides?.title ?? t("home.section.whatWeDo.title")}
        </h2>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          {overrides?.description ?? t("home.section.whatWeDo.description")}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.titleKey}
            className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 min-w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
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
