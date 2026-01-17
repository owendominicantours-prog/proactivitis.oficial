import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import { allLandings } from "@/data/transfer-landings";
import { Locale, translate } from "@/lib/translations";

const buildTransfersHubHref = (locale: Locale) =>
  locale === "es" ? "/punta-cana/traslado" : `/${locale}/punta-cana/traslado`;

const buildToursHubHref = (locale: Locale) =>
  locale === "es" ? "/punta-cana/tours" : `/${locale}/punta-cana/tours`;

const buildTransferRouteHref = (locale: Locale, slug: string) =>
  locale === "es" ? `/transfer/${slug}` : `/${locale}/transfer/${slug}`;

const buildTrasladoRootHref = (locale: Locale) =>
  locale === "es" ? "/traslado/punta-cana" : `/${locale}/traslado/punta-cana`;

const parseParagraphs = (value: string) =>
  value
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const parseList = (value: string) =>
  value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

type Props = {
  locale: Locale;
};

export default function PuntaCanaTransferHub({ locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const paragraphs = parseParagraphs(t("puntaCana.transferHub.body"));
  const highlights = parseList(t("puntaCana.transferHub.highlights"));

  const landingLinks = allLandings()
    .filter((landing) => landing.landingSlug.startsWith("punta-cana-international-airport"))
    .slice(0, 10)
    .map((landing) => ({
      name: landing.hotelName,
      slug: landing.landingSlug
    }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("puntaCana.transferHub.faq.1.q"),
        acceptedAnswer: { "@type": "Answer", text: t("puntaCana.transferHub.faq.1.a") }
      },
      {
        "@type": "Question",
        name: t("puntaCana.transferHub.faq.2.q"),
        acceptedAnswer: { "@type": "Answer", text: t("puntaCana.transferHub.faq.2.a") }
      },
      {
        "@type": "Question",
        name: t("puntaCana.transferHub.faq.3.q"),
        acceptedAnswer: { "@type": "Answer", text: t("puntaCana.transferHub.faq.3.a") }
      }
    ]
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:px-6">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {t("puntaCana.transferHub.eyebrow")}
        </p>
        <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
          {t("puntaCana.transferHub.title")}
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          {t("puntaCana.transferHub.subtitle")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={buildTrasladoRootHref(locale)}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30"
          >
            {t("puntaCana.transferHub.cta.primary")}
          </Link>
          <Link
            href={buildToursHubHref(locale)}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            {t("puntaCana.transferHub.cta.secondary")}
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 text-sm leading-relaxed text-slate-600">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            {t("puntaCana.transferHub.highlightsLabel")}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">{t("puntaCana.transferHub.tipTitle")}</p>
            <p className="mt-2">{t("puntaCana.transferHub.tipBody")}</p>
          </div>
        </aside>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            {t("puntaCana.transferHub.topLabel")}
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {t("puntaCana.transferHub.topTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {landingLinks.map((landing) => (
            <Link
              key={landing.slug}
              href={buildTransferRouteHref(locale, landing.slug)}
              className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-1"
            >
              {landing.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {t("puntaCana.transferHub.faqLabel")}
        </p>
        <h2 className="text-2xl font-bold text-slate-900">{t("puntaCana.transferHub.faqTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { q: t("puntaCana.transferHub.faq.1.q"), a: t("puntaCana.transferHub.faq.1.a") },
            { q: t("puntaCana.transferHub.faq.2.q"), a: t("puntaCana.transferHub.faq.2.a") },
            { q: t("puntaCana.transferHub.faq.3.q"), a: t("puntaCana.transferHub.faq.3.a") }
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{item.q}</p>
              <p className="mt-2 text-sm text-slate-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-100 bg-emerald-50/60 p-6 text-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">
              {t("puntaCana.transferHub.bottomLabel")}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {t("puntaCana.transferHub.bottomTitle")}
            </p>
          </div>
          <Link
            href={buildTransfersHubHref(locale)}
            className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm"
          >
            {t("puntaCana.transferHub.bottomCta")}
          </Link>
        </div>
      </section>

      <StructuredData data={faqSchema} />
    </div>
  );
}
