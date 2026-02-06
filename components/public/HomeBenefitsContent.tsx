import { Locale, translate, type TranslationKey } from "@/lib/translations";
import type { HomeContentOverrides } from "@/lib/siteContent";

const benefits = [
  {
    icon: "V",
    titleKey: "home.benefits.support.title",
    descriptionKey: "home.benefits.support.description"
  },
  {
    icon: "?",
    titleKey: "home.benefits.allies.title",
    descriptionKey: "home.benefits.allies.description"
  },
  {
    icon: "?",
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
    <>
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          {overrides?.label ?? t("home.section.whatWeDo.label")}
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          {overrides?.title ?? t("home.section.whatWeDo.title")}
        </h2>
        <p className="text-sm text-slate-500">
          {overrides?.description ?? t("home.section.whatWeDo.description")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.titleKey}
            className="space-y-3 rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-sm"
          >
            <div className="flex items-center gap-3 text-emerald-600">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-xl">
                {benefit.icon}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">
                {overrides?.items?.[index]?.title ?? t(benefit.titleKey)}
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              {overrides?.items?.[index]?.description ?? t(benefit.descriptionKey)}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
