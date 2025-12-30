import Link from "next/link";
import { Locale, translate, type TranslationKey } from "@/lib/translations";

type HomeAboutContentProps = {
  locale: Locale;
};

export function HomeAboutContent({ locale }: HomeAboutContentProps) {
  const t = (key: TranslationKey) => translate(locale, key);

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t("home.section.about.label")}</p>
      <h2 className="text-3xl font-semibold text-slate-900">{t("home.section.about.title")}</h2>
      <p className="text-sm text-slate-600">{t("home.section.about.description")}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/tours" className="boton-verde">
          {t("home.section.about.cta.primary")}
        </Link>
        <Link href="/contact" className="boton-naranja">
          {t("home.section.about.cta.secondary")}
        </Link>
      </div>
    </div>
  );
}
