import Image from "next/image";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import { HomeAboutContent } from "@/components/public/HomeAboutContent";
import { HomeBenefitsContent } from "@/components/public/HomeBenefitsContent";
import { HomeHeroContent } from "@/components/public/HomeHeroContent";
import { HomeRecommendedHeader } from "@/components/public/HomeRecommendedHeader";
import { Locale, translate } from "@/lib/translations";

type PublicHomePageProps = {
  locale: Locale;
};

export default function PublicHomePage({ locale }: PublicHomePageProps) {
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
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(4, 21, 45, 0.85), rgba(4, 21, 45, 0.35)), url('/mejorbanner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="h-[420px] w-full" />
        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-0">
          <div className="max-w-4xl">
            <HomeHeroContent locale={locale} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <HomeBenefitsContent locale={locale} />
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6">
        <HomeRecommendedHeader locale={locale} />
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <FeaturedToursSection locale={locale} />
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
