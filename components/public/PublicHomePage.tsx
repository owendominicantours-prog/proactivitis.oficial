import Image from "next/image";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import { HomeAboutContent } from "@/components/public/HomeAboutContent";
import { HomeBenefitsContent } from "@/components/public/HomeBenefitsContent";
import { HomeHeroContent } from "@/components/public/HomeHeroContent";
import { HomeHeroCarousel } from "@/components/public/HomeHeroCarousel";
import { HomeRecommendedHeader } from "@/components/public/HomeRecommendedHeader";
import { Locale, translate } from "@/lib/translations";

type PublicHomePageProps = {
  locale: Locale;
};

export default function PublicHomePage({ locale }: PublicHomePageProps) {
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
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
    <div className="space-y-16 bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      <HomeHeroCarousel>
        <HomeHeroContent locale={locale} />
      </HomeHeroCarousel>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <HomeBenefitsContent locale={locale} />
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6">
        <HomeRecommendedHeader locale={locale} />
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <FeaturedToursSection locale={locale} />
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
