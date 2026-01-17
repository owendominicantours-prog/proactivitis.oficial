import Image from "next/image";
import Link from "next/link";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import { HomeAboutContent } from "@/components/public/HomeAboutContent";
import { HomeBenefitsContent } from "@/components/public/HomeBenefitsContent";
import { HomeHeroContent } from "@/components/public/HomeHeroContent";
import { HomeHeroCarousel } from "@/components/public/HomeHeroCarousel";
import { HomeRecommendedHeader } from "@/components/public/HomeRecommendedHeader";
import HomeTourSearchSection from "@/components/public/HomeTourSearchSection";
import HomeTransferTicker from "@/components/public/HomeTransferTicker";
import { Locale, translate } from "@/lib/translations";

type PublicHomePageProps = {
  locale: Locale;
};

const PUNTA_CANA_LINKS = [
  { slug: "tour-en-buggy-en-punta-cana", labelKey: "puntaCana.links.item.1" },
  { slug: "excursion-en-buggy-y-atv-en-punta-cana", labelKey: "puntaCana.links.item.2" },
  { slug: "tour-isla-saona-desde-bayhibe-la-romana", labelKey: "puntaCana.links.item.3" },
  { slug: "tour-y-entrada-para-de-isla-saona-desde-punta-cana", labelKey: "puntaCana.links.item.4" },
  { slug: "sunset-catamaran-snorkel", labelKey: "puntaCana.links.item.5" },
  { slug: "parasailing-punta-cana", labelKey: "puntaCana.links.item.6" },
  { slug: "cayo-levantado-luxury-beach-day", labelKey: "puntaCana.links.item.7" },
  { slug: "excursion-de-un-dia-a-santo-domingo-desde-punta-cana", labelKey: "puntaCana.links.item.8" },
  { slug: "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana", labelKey: "puntaCana.links.item.9" },
  { slug: "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana", labelKey: "puntaCana.links.item.10" }
] as const;

export default function PublicHomePage({ locale }: PublicHomePageProps) {
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
  const transferHref = locale === "es" ? "/traslado" : `/${locale}/traslado`;
  const tourHref = (slug: string) => (locale === "es" ? `/tours/${slug}` : `/${locale}/tours/${slug}`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineBusiness",
        "@id": "https://proactivitis.com/#organization",
        name: "Proactivitis",
        url: "https://proactivitis.com/",
        logo: "https://proactivitis.com/logo.png",
        description: translate(locale, "home.schema.description"),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Servicios Proactivitis",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Tours y Excursiones",
                url: "https://proactivitis.com/tours"
              }
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Traslados Privados",
                url: "https://proactivitis.com/traslado"
              }
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Portal para Agencias y Suplidores",
                url: "https://proactivitis.com/become-a-supplier"
              }
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: translate(locale, "home.schema.faq.question.booking"),
            acceptedAnswer: {
              "@type": "Answer",
              text: translate(locale, "home.schema.faq.answer.booking")
            }
          },
          {
            "@type": "Question",
            name: translate(locale, "home.schema.faq.question.agencies"),
            acceptedAnswer: {
              "@type": "Answer",
              text: translate(locale, "home.schema.faq.answer.agencies")
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="space-y-16 bg-gradient-to-b from-[#F8FAFC] via-[#F8FAFC] to-emerald-50/40 text-slate-900 overflow-x-hidden">
      <HomeHeroCarousel>
        <HomeHeroContent locale={locale} />
      </HomeHeroCarousel>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <HomeBenefitsContent locale={locale} />
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6">
        <HomeRecommendedHeader locale={locale} />
        <HomeTourSearchSection locale={locale} />
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <FeaturedToursSection locale={locale} />
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("puntaCana.links.subtitle")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {t("puntaCana.links.title")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PUNTA_CANA_LINKS.map((item) => (
              <Link
                key={item.slug}
                href={tourHref(item.slug)}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("home.longform.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
            {t("home.longform.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{t("home.longform.body1")}</p>
            <p>{t("home.longform.body2")}</p>
            <p>{t("home.longform.body3")}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(
              [
                {
                  titleKey: "home.longform.points.1.title",
                  bodyKey: "home.longform.points.1.body"
                },
                {
                  titleKey: "home.longform.points.2.title",
                  bodyKey: "home.longform.points.2.body"
                },
                {
                  titleKey: "home.longform.points.3.title",
                  bodyKey: "home.longform.points.3.body"
                }
              ] as const
            ).map((item) => (
              <div key={item.titleKey} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {t(item.titleKey)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {t(item.bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div
          className="relative flex min-h-[280px] items-center overflow-hidden rounded-3xl border border-slate-100 shadow-sm"
          style={{
            backgroundImage:
              "url('https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-slate-900/55 md:bg-slate-900/65" />
          <div className="relative z-10 w-full space-y-6 px-6 py-10 text-center text-white md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
            {t("home.transferBanner.label")}
          </p>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            {t("home.transferBanner.title")}
          </h2>
          <p className="text-sm text-white/90 md:text-base">
            {t("home.transferBanner.description")}
          </p>
          <HomeTransferTicker locale={locale} />
          <div className="botones-banner justify-center md:justify-start">
            <Link href={transferHref} className="boton-verde">
              {t("home.transferBanner.cta")}
            </Link>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] bg-slate-900">
            <Image
              src="/mini-portada.png"
              alt="Grupo de viajeros felices"
              width={900}
              height={600}
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-4">
            <HomeAboutContent locale={locale} />
          </div>
        </div>
      </section>
      <section className="sr-only">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </div>
  );
}
