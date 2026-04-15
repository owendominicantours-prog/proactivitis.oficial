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
import { SITE_CONFIG } from "@/lib/site-config";
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
    es: "Sosua Party Boat: precios y opciones destacadas",
    en: "Sosua Party Boat: prices and top options",
    fr: "Sosua Party Boat : prix et meilleures options"
  },
  {
    slug: "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua",
    es: "Barco privado en Sosua desde Puerto Plata",
    en: "Private party boat in Sosua from Puerto Plata",
    fr: "Bateau prive a Sosua depuis Puerto Plata"
  }
] as const;

export default async function PublicHomePage({ locale }: PublicHomePageProps) {
  const isFunjet = SITE_CONFIG.variant === "funjet";
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
  const funjetFeaturedTitle =
    locale === "es"
      ? "Escoge una vibra y empieza por ahi"
      : locale === "fr"
        ? "Choisissez une ambiance et commencez par la"
        : "Pick a vibe and start there";
  const funjetFeaturedCopy =
    locale === "es"
      ? "Abre una experiencia, revisa precio y reserva."
      : locale === "fr"
        ? "Ouvrez une experience, verifiez le prix et reservez."
        : "Open an experience, check the price, and book.";

  const [publishedTours, tourRatingAgg, transferRatingAgg] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { in: ["published", "seo_only"] } },
      select: { id: true, slug: true, title: true, price: true, shortDescription: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.tourReview.groupBy({
      by: ["tourId"],
      where: { status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true }
    }),
    prisma.transferReview.groupBy({
      by: ["transferLandingSlug"],
      where: { status: "APPROVED", transferLandingSlug: { not: null } },
      _avg: { rating: true },
      _count: { rating: true }
    })
  ]);
  const transferLandings = allLandings();
  const uniquePublishedTours = Array.from(
    new Map(publishedTours.map((tour) => [tour.slug, tour])).values()
  );
  const uniqueTransferLandings = Array.from(
    new Map(transferLandings.map((landing) => [landing.landingSlug, landing])).values()
  );
  const tourRatingMap = new Map(
    tourRatingAgg.map((row) => [
      row.tourId,
      {
        rating: Number(row._avg.rating ?? 0),
        count: row._count.rating
      }
    ])
  );
  const transferRatingMap = new Map(
    transferRatingAgg
      .filter((row) => row.transferLandingSlug)
      .map((row) => [
        row.transferLandingSlug as string,
        {
          rating: Number(row._avg.rating ?? 0),
          count: row._count.rating
        }
      ])
  );

  const tourCatalogItems = uniquePublishedTours.map((tour, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tour.title,
    url: localizedPath(`/tours/${tour.slug}`)
  }));

  const transferCatalogItems = uniqueTransferLandings.map((landing, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: landing.heroTitle,
    url: localizedPath(`/transfer/${landing.landingSlug}`)
  }));
  const tourProducts = uniquePublishedTours.map((tour) => {
    const ratingData = tourRatingMap.get(tour.id);
    const ratingValue = Number((ratingData?.rating && ratingData.rating > 0 ? ratingData.rating : 5).toFixed(1));
    const reviewCount = ratingData?.count && ratingData.count > 0 ? ratingData.count : 1;
    return {
      "@type": "Product",
      "@id": `${localizedPath(`/tours/${tour.slug}`)}#product`,
      name: tour.title,
      description:
        tour.shortDescription ||
        (locale === "es"
          ? "Excursion en Republica Dominicana con reserva inmediata."
          : locale === "fr"
            ? "Excursion en Republique dominicaine avec reservation immediate."
            : "Dominican Republic excursion with instant booking."),
      url: localizedPath(`/tours/${tour.slug}`),
      image: `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`,
      brand: {
        "@type": "Brand",
        name: SITE_CONFIG.name
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: tour.price,
        priceValidUntil,
        availability: "https://schema.org/InStock",
        url: localizedPath(`/tours/${tour.slug}`),
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
        }
      }
    };
  });

  const transferProducts = uniqueTransferLandings.map((landing) => {
    const ratingData = transferRatingMap.get(landing.landingSlug);
    const ratingValue = Number((ratingData?.rating && ratingData.rating > 0 ? ratingData.rating : 5).toFixed(1));
    const reviewCount = ratingData?.count && ratingData.count > 0 ? ratingData.count : 1;
    return {
      "@type": "Product",
      "@id": `${localizedPath(`/transfer/${landing.landingSlug}`)}#product`,
      name: landing.heroTitle,
      description: landing.heroSubtitle || landing.metaDescription,
      url: localizedPath(`/transfer/${landing.landingSlug}`),
      image: `${PROACTIVITIS_URL}${landing.heroImage}`,
      brand: {
        "@type": "Brand",
        name: SITE_CONFIG.name
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: Math.round(landing.priceFrom),
        priceValidUntil,
        availability: "https://schema.org/InStock",
        url: localizedPath(`/transfer/${landing.landingSlug}`),
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
        }
      }
    };
  });

  const corePublicPages = [
    { path: "/", name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home" },
    { path: "/tours", name: locale === "es" ? "Tours" : locale === "fr" ? "Excursions" : "Tours" },
    { path: "/traslado", name: locale === "es" ? "Traslados" : locale === "fr" ? "Transferts" : "Transfers" },
    ...(!isFunjet
      ? [
          { path: "/news", name: locale === "es" ? "Noticias" : locale === "fr" ? "Actualites" : "News" },
          {
            path: locale === "es" ? "/hoteles" : "/hotels",
            name: locale === "es" ? "Hoteles" : locale === "fr" ? "Hotels" : "Hotels"
          }
        ]
      : []),
    { path: "/punta-cana/tours", name: "Punta Cana Tours" },
    { path: "/punta-cana/traslado", name: "Punta Cana Transfers" },
    ...(!isFunjet
      ? [
          { path: "/prodiscovery", name: "ProDiscovery" },
          { path: "/punta-cana/premium-transfer-services", name: "Premium Transfer Services" }
        ]
      : [])
  ];

  const allPublicPageUrls = Array.from(
    new Set([
      ...corePublicPages.map((page) => localizedPath(page.path)),
      ...uniquePublishedTours.map((tour) => localizedPath(`/tours/${tour.slug}`)),
      ...uniqueTransferLandings.map((landing) => localizedPath(`/transfer/${landing.landingSlug}`))
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
        "@id": `${PROACTIVITIS_URL}/#organization`,
        name: SITE_CONFIG.name,
        url: `${PROACTIVITIS_URL}/`,
        logo: `${PROACTIVITIS_URL}${SITE_CONFIG.logoSrc}`,
        description: translate(locale, "home.schema.description"),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: isFunjet
            ? locale === "es"
              ? "Servicios Funjet"
              : locale === "fr"
                ? "Services Funjet"
                : "Funjet services"
            : "Servicios Proactivitis",
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
                url: `${PROACTIVITIS_URL}/tours`
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
                url: `${PROACTIVITIS_URL}/traslado`
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
                name: isFunjet
                  ? locale === "es"
                    ? "Asistencia directa para reservas"
                    : locale === "fr"
                      ? "Assistance directe pour reservations"
                      : "Direct booking assistance"
                  : "Portal para Agencias y Suplidores",
                url: isFunjet ? `${PROACTIVITIS_URL}/contact` : `${PROACTIVITIS_URL}/become-a-supplier`
              }
            }
          ]
        }
      },
      {
        "@type": "WebPage",
        "@id": `${localizedPath("/")}#webpage`,
        url: localizedPath("/"),
        name: locale === "es" ? `Inicio ${SITE_CONFIG.name}` : locale === "fr" ? `Accueil ${SITE_CONFIG.name}` : `${SITE_CONFIG.name} Home`,
        isPartOf: {
          "@id": `${PROACTIVITIS_URL}/#website`
        },
        about: {
          "@id": `${PROACTIVITIS_URL}/#organization`
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
        name: locale === "es" ? `Paginas publicas ${SITE_CONFIG.name}` : locale === "fr" ? `Pages publiques ${SITE_CONFIG.name}` : `${SITE_CONFIG.name} public pages`,
        numberOfItems: allPublicPageItems.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: allPublicPageItems
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#product-catalog`,
        name: locale === "es" ? `Catalogo de productos ${SITE_CONFIG.name}` : locale === "fr" ? `Catalogue de produits ${SITE_CONFIG.name}` : `${SITE_CONFIG.name} product catalog`,
        numberOfItems: tourProducts.length + transferProducts.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: [...tourProducts, ...transferProducts].map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: product
        }))
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
            name: isFunjet
              ? locale === "es"
                ? "Como recibo ayuda para reservar?"
                : locale === "fr"
                  ? "Comment obtenir de l aide pour reserver ?"
                  : "How do I get help booking?"
              : translate(locale, "home.schema.faq.question.agencies"),
            acceptedAnswer: {
              "@type": "Answer",
              text: isFunjet
                ? locale === "es"
                  ? "Puedes escribirnos por WhatsApp y te ayudamos a elegir tours, traslados y horarios con confirmacion rapida."
                  : locale === "fr"
                    ? "Vous pouvez nous ecrire sur WhatsApp et nous vous aidons a choisir excursions, transferts et horaires avec confirmation rapide."
                    : "You can message us on WhatsApp and we will help you choose tours, transfers, and schedules with fast confirmation."
                : translate(locale, "home.schema.faq.answer.agencies")
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-slate-50 text-slate-900 overflow-x-hidden">
      <HomeHeroCarousel>
        <HomeHeroContent locale={locale} overrides={homeOverrides.hero} />
      </HomeHeroCarousel>

      {isFunjet ? (
        <section className="border-y border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl grid gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#E9D7FA] bg-[linear-gradient(160deg,#6A0DAD_0%,#8B32D1_100%)] px-6 py-6 text-white shadow-[0_24px_60px_rgba(106,13,173,0.24)]">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                {locale === "es" ? "Reserva directa" : locale === "fr" ? "Reservation directe" : "Direct booking"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {locale === "es" ? "Menos texto. Mas accion." : locale === "fr" ? "Moins de texte. Plus d action." : "Less copy. More action."}
              </h2>
            </div>
            <div className="rounded-[28px] border border-[#E9D7FA] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(106,13,173,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6A0DAD]">01</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {locale === "es" ? "Busca tours" : locale === "fr" ? "Cherchez des tours" : "Browse tours"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {locale === "es" ? "Entra directo al catalogo." : locale === "fr" ? "Entrez directement dans le catalogue." : "Go straight to the catalog."}
              </p>
            </div>
            <div className="rounded-[28px] border border-[#E9D7FA] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(106,13,173,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#6A0DAD]">02</p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {locale === "es" ? "Cotiza traslado" : locale === "fr" ? "Calculez le transfert" : "Quote transfer"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {locale === "es" ? "Ve tu opcion desde el primer click." : locale === "fr" ? "Voyez votre option des le premier clic." : "See your option from the first click."}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="border-y border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
            <HomeBenefitsContent locale={locale} overrides={homeOverrides.benefits} />
          </div>
        </section>
      )}

      <section className="travel-surface">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 sm:px-6">
          <HomeRecommendedHeader locale={locale} overrides={homeOverrides.recommended} />
          <HomeTourSearchSection locale={locale} />
          <div className={`p-8 ${isFunjet ? "rounded-[34px] border border-[#E6D2FB] bg-[linear-gradient(135deg,#ffffff_0%,#f9f0ff_55%,#fff9e1_100%)] shadow-[0_26px_70px_rgba(106,13,173,0.15)]" : "rounded-3xl border border-slate-100 bg-white/90 shadow-sm"}`}>
            <FeaturedToursSection locale={locale} />
          </div>
          <div className={`p-8 ${isFunjet ? "rounded-[34px] border border-[#E6D2FB] bg-white shadow-[0_22px_65px_rgba(106,13,173,0.12)]" : "rounded-3xl border border-slate-100 bg-white/90 shadow-sm"}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
              {isFunjet ? (locale === "es" ? "Rutas favoritas" : locale === "fr" ? "Routes favorites" : "Favorite routes") : homeOverrides.puntaCana?.subtitle ?? t("puntaCana.links.subtitle")}
            </p>
            <h2 className={`mt-2 text-2xl ${isFunjet ? "font-bold text-[#34114A]" : "font-semibold text-slate-900"}`}>
              {isFunjet ? funjetFeaturedTitle : homeOverrides.puntaCana?.title ?? t("puntaCana.links.title")}
            </h2>
            {isFunjet ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6B4D82]">{funjetFeaturedCopy}</p> : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PUNTA_CANA_LINKS.map((item) => (
                <Link
                  key={item.slug}
                  href={tourHref(item.slug)}
                  className={`px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                    isFunjet
                      ? "rounded-[22px] border border-[#F1E3FF] bg-[linear-gradient(180deg,#ffffff_0%,#fbf5ff_100%)] text-[#52206F] hover:border-[#CFAAF1]"
                      : "rounded-2xl border border-slate-100 bg-slate-50 text-slate-700 hover:bg-white"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>
          <div className={`p-8 ${isFunjet ? "rounded-[34px] border border-[#E6D2FB] bg-white shadow-[0_22px_65px_rgba(106,13,173,0.12)]" : "rounded-3xl border border-slate-100 bg-white/90 shadow-sm"}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-[#6A0DAD]" : "text-slate-500"}`}>
              Sosua Party Boat
            </p>
            <h2 className={`mt-2 text-2xl ${isFunjet ? "font-bold text-[#34114A]" : "font-semibold text-slate-900"}`}>
              {isFunjet
                ? locale === "es"
                  ? "Norte de Republica Dominicana en modo party"
                  : locale === "en"
                    ? "North coast in full party mode"
                    : "La cote nord en mode fete"
                : locale === "es"
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
        </div>
      </section>

      {!isFunjet ? (
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-12 sm:px-6">
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
        </div>
      </section>
      ) : null}

      <section className="travel-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
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
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] bg-slate-900">
            <Image
              src={
                isFunjet
                  ? "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/funjet/funjet.png"
                  : "/mini-portada.png"
              }
              alt={isFunjet ? "Funjet travelers" : "Grupo de viajeros felices"}
              width={900}
              height={600}
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-4">
            {isFunjet ? (
              <>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {locale === "es" ? "Hazlo rapido" : locale === "fr" ? "Faites-le vite" : "Make it fast"}
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  {locale === "es" ? "Entra, elige y reserva" : locale === "fr" ? "Entrez, choisissez et reservez" : "Open, choose, and book"}
                </h2>
                <p className="text-sm text-slate-600">
                  {locale === "es" ? "Funjet esta hecho para decidir rapido entre tours y traslados sin leer de mas." : locale === "fr" ? "Funjet est concu pour choisir rapidement entre tours et transferts sans trop lire." : "Funjet is built for quick choices between tours and transfers without extra reading."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href={locale === "es" ? "/tours" : `/${locale}/tours`} className="boton-verde">
                    {locale === "es" ? "Abrir tours" : locale === "fr" ? "Ouvrir les tours" : "Open tours"}
                  </Link>
                  <Link href={locale === "es" ? "/traslado" : `/${locale}/traslado`} className="boton-naranja">
                    {locale === "es" ? "Abrir traslados" : locale === "fr" ? "Ouvrir les transferts" : "Open transfers"}
                  </Link>
                </div>
              </>
            ) : (
              <HomeAboutContent locale={locale} overrides={homeOverrides.about} />
            )}
          </div>
        </div>
      </section>
      <section className="sr-only">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </div>
  );
}
