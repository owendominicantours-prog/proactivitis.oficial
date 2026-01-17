import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { Locale, translate } from "@/lib/translations";

const buildToursHubHref = (locale: Locale) =>
  locale === "es" ? "/punta-cana/tours" : `/${locale}/punta-cana/tours`;

const buildTransfersHubHref = (locale: Locale) =>
  locale === "es" ? "/punta-cana/traslado" : `/${locale}/punta-cana/traslado`;

const buildToursFilterHref = (locale: Locale) =>
  locale === "es" ? "/tours?destination=punta-cana" : `/${locale}/tours?destination=punta-cana`;

const buildTourHref = (locale: Locale, slug: string) =>
  locale === "es" ? `/tours/${slug}` : `/${locale}/tours/${slug}`;

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

export default async function PuntaCanaToursHub({ locale }: Props) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const paragraphs = parseParagraphs(t("puntaCana.toursHub.body"));
  const highlights = parseList(t("puntaCana.toursHub.highlights"));

  const tours = await prisma.tour.findMany({
    where: {
      status: "published",
      departureDestination: { is: { slug: "punta-cana" } }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8,
    select: {
      slug: true,
      title: true,
      shortDescription: true,
      heroImage: true,
      translations: {
        where: { locale },
        select: {
          title: true,
          shortDescription: true
        }
      }
    }
  });

  const tourCards = tours.map((tour) => {
    const translation = tour.translations[0];
    return {
      slug: tour.slug,
      title: translation?.title ?? tour.title,
      description: translation?.shortDescription ?? tour.shortDescription,
      image: tour.heroImage ?? "/mini-portada.png"
    };
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("puntaCana.toursHub.faq.1.q"),
        acceptedAnswer: { "@type": "Answer", text: t("puntaCana.toursHub.faq.1.a") }
      },
      {
        "@type": "Question",
        name: t("puntaCana.toursHub.faq.2.q"),
        acceptedAnswer: { "@type": "Answer", text: t("puntaCana.toursHub.faq.2.a") }
      },
      {
        "@type": "Question",
        name: t("puntaCana.toursHub.faq.3.q"),
        acceptedAnswer: { "@type": "Answer", text: t("puntaCana.toursHub.faq.3.a") }
      },
      {
        "@type": "Question",
        name: t("puntaCana.toursHub.faq.4.q"),
        acceptedAnswer: { "@type": "Answer", text: t("puntaCana.toursHub.faq.4.a") }
      }
    ]
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:px-6">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {t("puntaCana.toursHub.eyebrow")}
        </p>
        <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
          {t("puntaCana.toursHub.title")}
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          {t("puntaCana.toursHub.subtitle")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={buildToursFilterHref(locale)}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30"
          >
            {t("puntaCana.toursHub.cta.primary")}
          </Link>
          <Link
            href={buildTransfersHubHref(locale)}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            {t("puntaCana.toursHub.cta.secondary")}
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
            {t("puntaCana.toursHub.highlightsLabel")}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
            <p className="font-semibold">{t("puntaCana.toursHub.tipTitle")}</p>
            <p className="mt-2 text-emerald-800">{t("puntaCana.toursHub.tipBody")}</p>
          </div>
        </aside>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            {t("puntaCana.toursHub.topLabel")}
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {t("puntaCana.toursHub.topTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tourCards.map((tour) => (
            <Link
              key={tour.slug}
              href={buildTourHref(locale, tour.slug)}
              className="group rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-20 w-24 flex-none rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${tour.image})` }}
                  role="img"
                  aria-label={tour.title}
                />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{tour.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    {tour.description ?? t("puntaCana.toursHub.topFallback")}
                  </p>
                  <span className="text-xs font-semibold text-brand">
                    {t("puntaCana.toursHub.topCta")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          {t("puntaCana.toursHub.faqLabel")}
        </p>
        <h2 className="text-2xl font-bold text-slate-900">{t("puntaCana.toursHub.faqTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { q: t("puntaCana.toursHub.faq.1.q"), a: t("puntaCana.toursHub.faq.1.a") },
            { q: t("puntaCana.toursHub.faq.2.q"), a: t("puntaCana.toursHub.faq.2.a") },
            { q: t("puntaCana.toursHub.faq.3.q"), a: t("puntaCana.toursHub.faq.3.a") },
            { q: t("puntaCana.toursHub.faq.4.q"), a: t("puntaCana.toursHub.faq.4.a") }
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
              {t("puntaCana.toursHub.bottomLabel")}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {t("puntaCana.toursHub.bottomTitle")}
            </p>
          </div>
          <Link
            href={buildToursHubHref(locale)}
            className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm"
          >
            {t("puntaCana.toursHub.bottomCta")}
          </Link>
        </div>
      </section>

      <StructuredData data={faqSchema} />
    </div>
  );
}
