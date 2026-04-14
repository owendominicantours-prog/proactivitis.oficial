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
  const funjetLabel = locale === "es" ? "Selecciones Funjet" : locale === "fr" ? "Selections Funjet" : "Funjet picks";
  const funjetTitle = locale === "es" ? "Escapadas que se reservan en minutos" : locale === "fr" ? "Escapades a reserver en quelques minutes" : "Getaways you can book in minutes";
  const funjetCopy =
    locale === "es"
      ? "Elegimos ideas rapidas para parejas, grupos y viajeros que quieren algo claro, visual y facil de reservar."
      : locale === "fr"
        ? "Nous avons choisi des idees rapides pour couples, groupes et voyageurs qui veulent quelque chose de clair, visuel et facile a reserver."
        : "We picked quick ideas for couples, groups, and travelers who want something clear, visual, and easy to book.";

  return (
    <div className={`space-y-3 ${isFunjet ? "overflow-hidden rounded-[36px] border border-[#E9D7FA] bg-[linear-gradient(135deg,#ffffff_0%,#fbf2ff_42%,#fff8de_100%)] px-6 py-8 shadow-[0_24px_65px_rgba(106,13,173,0.14)] md:px-8" : "text-center"}`}>
      {isFunjet ? (
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-3 text-left">
            <p className="text-xs uppercase tracking-[0.45em] text-[#6A0DAD]">{funjetLabel}</p>
            <h2 className="text-3xl font-bold text-[#34114A] md:text-4xl">{funjetTitle}</h2>
            <p className="max-w-2xl text-sm leading-7 text-[#6B4D82]">{funjetCopy}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-[26px] border border-white/70 bg-white/75 px-4 py-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#A86AD8]">
                {locale === "es" ? "Tours fresh" : locale === "fr" ? "Tours fresh" : "Fresh tours"}
              </p>
              <p className="mt-2 text-lg font-bold text-[#34114A]">
                {locale === "es" ? "Visuales, directos y sin ruido" : locale === "fr" ? "Visuels, directs et sans bruit" : "Visual, direct, no noise"}
              </p>
            </div>
            <div className="rounded-[26px] border border-[#FFD86E] bg-[#FFC300] px-4 py-4 text-[#4D0A7D] shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-70">
                {locale === "es" ? "Reserva facil" : locale === "fr" ? "Reservation facile" : "Easy booking"}
              </p>
              <p className="mt-2 text-lg font-bold">
                {locale === "es" ? "Selecciona y reserva rapido" : locale === "fr" ? "Choisissez et reservez vite" : "Pick and book fast"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {overrides?.label ?? t("home.section.recommended.label")}
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">{overrides?.title ?? t("home.section.recommended.title")}</h2>
        </>
      )}
    </div>
  );
}
