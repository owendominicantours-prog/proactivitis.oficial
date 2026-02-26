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
import { getHomeContentOverrides } from "@/lib/siteContent";
import { getPriceValidUntil, PROACTIVITIS_URL } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";

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

const SOSUA_PARTY_BOAT_LINKS = [
  {
    slug: "party-boat-sosua",
    es: "Sosua Party Boat: precios y opciones VIP",
    en: "Sosua Party Boat: prices and VIP options",
    fr: "Sosua Party Boat : prix et options VIP"
  },
  {
    slug: "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua",
    es: "Barco privado en Sosua desde Puerto Plata",
    en: "Private party boat in Sosua from Puerto Plata",
    fr: "Bateau prive a Sosua depuis Puerto Plata"
  }
] as const;

export default async function PublicHomePage({ locale }: PublicHomePageProps) {
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
  const transferHref = locale === "es" ? "/traslado" : `/${locale}/traslado`;
  const tourHref = (slug: string) => (locale === "es" ? `/tours/${slug}` : `/${locale}/tours/${slug}`);
  const homeOverrides = await getHomeContentOverrides(locale);
  const transferBannerImage =
    homeOverrides.transferBanner?.backgroundImage ??
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg";
  const priceValidUntil = getPriceValidUntil();
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const localizedPath = (path: string) => `${PROACTIVITIS_URL}${locale === "es" ? path : `/${locale}${path}`}`;

  const [publishedTours] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { in: ["published", "seo_only"] } },
      select: { slug: true, title: true, price: true, shortDescription: true },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const transferLandings = allLandings();

  const tourCatalogItems = publishedTours.map((tour, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tour.title,
    url: localizedPath(`/tours/${tour.slug}`)
  }));

  const transferCatalogItems = transferLandings.map((landing, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: landing.heroTitle,
    url: localizedPath(`/transfer/${landing.landingSlug}`)
  }));

  const corePublicPages = [
    { path: "/", name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home" },
    { path: "/tours", name: locale === "es" ? "Tours" : locale === "fr" ? "Excursions" : "Tours" },
    { path: "/traslado", name: locale === "es" ? "Traslados" : locale === "fr" ? "Transferts" : "Transfers" },
    { path: "/prodiscovery", name: "ProDiscovery" },
    { path: "/news", name: locale === "es" ? "Noticias" : locale === "fr" ? "Actualites" : "News" },
    {
      path: locale === "es" ? "/hoteles" : "/hotels",
      name: locale === "es" ? "Hoteles" : locale === "fr" ? "Hotels" : "Hotels"
    },
    { path: "/punta-cana/tours", name: "Punta Cana Tours" },
    { path: "/punta-cana/traslado", name: "Punta Cana Transfers" },
    { path: "/punta-cana/premium-transfer-services", name: "Premium Transfer Services" }
  ];

  const allPublicPageUrls = Array.from(
    new Set([
      ...corePublicPages.map((page) => localizedPath(page.path)),
      ...publishedTours.map((tour) => localizedPath(`/tours/${tour.slug}`)),
      ...transferLandings.map((landing) => localizedPath(`/transfer/${landing.landingSlug}`))
    ])
  );

  const allPublicPageItems = allPublicPageUrls.map((url, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: url.replace(`${PROACTIVITIS_URL}${localePrefix}`, "") || "/",
    url
  }));

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
              priceValidUntil,
              shippingDetails: {
                "@type": "OfferShippingDetails",
                doesNotShip: true,
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "DO"
                },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          }
        }
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                applicableCountry: "DO",
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
              },
              itemOffered: {
                "@type": "Service",
                name: "Tours y Excursiones",
                url: "https://proactivitis.com/tours"
              }
            },
            {
              "@type": "Offer",
              priceValidUntil,
              shippingDetails: {
                "@type": "OfferShippingDetails",
                doesNotShip: true,
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "DO"
                },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          }
        }
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                applicableCountry: "DO",
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
              },
              itemOffered: {
                "@type": "Service",
                name: "Traslados Privados",
                url: "https://proactivitis.com/traslado"
              }
            },
            {
              "@type": "Offer",
              priceValidUntil,
              shippingDetails: {
                "@type": "OfferShippingDetails",
                doesNotShip: true,
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "DO"
                },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          }
        }
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                applicableCountry: "DO",
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
              },
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
        "@type": "WebPage",
        "@id": `${localizedPath("/")}#webpage`,
        url: localizedPath("/"),
        name: locale === "es" ? "Inicio Proactivitis" : locale === "fr" ? "Accueil Proactivitis" : "Proactivitis Home",
        isPartOf: {
          "@id": `${PROACTIVITIS_URL}/#website`
        },
        about: {
          "@id": "https://proactivitis.com/#organization"
        }
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#tour-catalog`,
        name: locale === "es" ? "Catalogo completo de tours" : locale === "fr" ? "Catalogue complet des excursions" : "Complete tours catalog",
        numberOfItems: tourCatalogItems.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: tourCatalogItems
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#transfer-catalog`,
        name: locale === "es" ? "Catalogo completo de traslados" : locale === "fr" ? "Catalogue complet des transferts" : "Complete transfers catalog",
        numberOfItems: transferCatalogItems.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: transferCatalogItems
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#public-pages`,
        name: locale === "es" ? "Paginas publicas Proactivitis" : locale === "fr" ? "Pages publiques Proactivitis" : "Proactivitis public pages",
        numberOfItems: allPublicPageItems.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: allPublicPageItems
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
        <HomeHeroContent locale={locale} overrides={homeOverrides.hero} />
      </HomeHeroCarousel>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <HomeBenefitsContent locale={locale} overrides={homeOverrides.benefits} />
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6">
        <HomeRecommendedHeader locale={locale} overrides={homeOverrides.recommended} />
        <HomeTourSearchSection locale={locale} />
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <FeaturedToursSection locale={locale} />
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {homeOverrides.puntaCana?.subtitle ?? t("puntaCana.links.subtitle")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {homeOverrides.puntaCana?.title ?? t("puntaCana.links.title")}
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
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Sosua Party Boat
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {locale === "es"
              ? "Reserva tu party boat en Sosua al mejor precio"
              : locale === "en"
                ? "Book your Sosua party boat at the best price"
                : "Reservez votre party boat a Sosua au meilleur prix"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SOSUA_PARTY_BOAT_LINKS.map((item) => (
              <Link
                key={item.slug}
                href={tourHref(item.slug)}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
              >
                {locale === "es" ? item.es : locale === "en" ? item.en : item.fr}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {homeOverrides.longform?.eyebrow ?? t("home.longform.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
            {homeOverrides.longform?.title ?? t("home.longform.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{homeOverrides.longform?.body1 ?? t("home.longform.body1")}</p>
            <p>{homeOverrides.longform?.body2 ?? t("home.longform.body2")}</p>
            <p>{homeOverrides.longform?.body3 ?? t("home.longform.body3")}</p>
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
            ).map((item, index) => (
              <div key={item.titleKey} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {homeOverrides.longform?.points?.[index]?.title ?? t(item.titleKey)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {homeOverrides.longform?.points?.[index]?.body ?? t(item.bodyKey)}
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
            backgroundImage: `url('${transferBannerImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-slate-900/55 md:bg-slate-900/65" />
          <div className="relative z-10 w-full space-y-6 px-6 py-10 text-center text-white md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
            {homeOverrides.transferBanner?.label ?? t("home.transferBanner.label")}
          </p>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            {homeOverrides.transferBanner?.title ?? t("home.transferBanner.title")}
          </h2>
          <p className="text-sm text-white/90 md:text-base">
            {homeOverrides.transferBanner?.description ?? t("home.transferBanner.description")}
          </p>
          <HomeTransferTicker locale={locale} />
          <div className="botones-banner justify-center md:justify-start">
            <Link href={transferHref} className="boton-verde">
              {homeOverrides.transferBanner?.cta ?? t("home.transferBanner.cta")}
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
            <HomeAboutContent locale={locale} overrides={homeOverrides.about} />
          </div>
        </div>
      </section>
      <section className="sr-only">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </div>
  );
}
