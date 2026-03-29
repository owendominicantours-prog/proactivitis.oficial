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
        name: "Proactivitis"
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
        name: "Proactivitis"
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
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#product-catalog`,
        name: locale === "es" ? "Catalogo de productos Proactivitis" : locale === "fr" ? "Catalogue de produits Proactivitis" : "Proactivitis product catalog",
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

  const stats = [
    {
      value: `${uniquePublishedTours.length}+`,
      label:
        locale === "es"
          ? "experiencias publicadas"
          : locale === "fr"
            ? "experiences publiees"
            : "published experiences"
    },
    {
      value: `${uniqueTransferLandings.length}+`,
      label:
        locale === "es"
          ? "rutas de traslado"
          : locale === "fr"
            ? "routes de transfert"
            : "transfer routes"
    },
    {
      value: "USD",
      label:
        locale === "es"
          ? "precios claros y directos"
          : locale === "fr"
            ? "prix clairs en USD"
            : "clear USD pricing"
    },
    {
      value: "B2B",
      label:
        locale === "es"
          ? "agencias y suppliers conectados"
          : locale === "fr"
            ? "agences et suppliers connectes"
            : "agencies and suppliers connected"
    }
  ];

  const marketplaceHighlights = [
    {
      title:
        locale === "es"
          ? "Reserva tours y traslados desde una sola plataforma"
          : locale === "fr"
            ? "Reservez excursions et transferts depuis une seule plateforme"
            : "Book tours and transfers from one platform",
      body:
        locale === "es"
          ? "El usuario no tiene que saltar entre formularios distintos. Puede descubrir experiencias, cotizar traslados y avanzar a la reserva con una lógica más clara."
          : locale === "fr"
            ? "Le voyageur n'a pas besoin de passer d'un formulaire a l'autre. Il peut decouvrir, comparer et reserver avec plus de clarte."
            : "Travelers can discover experiences, quote transfers, and continue to booking without jumping between disconnected flows."
    },
    {
      title:
        locale === "es"
          ? "Operación real para agencias y proveedores"
          : locale === "fr"
            ? "Operation reelle pour agences et fournisseurs"
            : "Real operating stack for agencies and suppliers",
      body:
        locale === "es"
          ? "No es solo una vitrina. Proactivitis ya integra reservas, AgencyPro, paneles operativos y control comercial para crecer con estructura."
          : locale === "fr"
            ? "Ce n'est pas seulement une vitrine. Proactivitis integre deja reservations, AgencyPro et controles operationnels."
            : "This is not just a brochure site. Proactivitis already runs bookings, AgencyPro, supplier tools, and agency workflows."
    },
    {
      title:
        locale === "es"
          ? "Diseñado para vender mejor, no solo para informar"
          : locale === "fr"
            ? "Concu pour mieux vendre, pas seulement pour informer"
            : "Built to sell better, not just to inform",
      body:
        locale === "es"
          ? "La home ahora debe llevar al usuario rápido a buscar, comparar y reservar. Todo lo demás debe reforzar confianza y decisión."
          : locale === "fr"
            ? "La page d'accueil doit mener rapidement le voyageur a chercher, comparer et reserver."
            : "The homepage should move users quickly into search, comparison, and reservation while reinforcing trust."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 overflow-x-hidden">
      <HomeHeroCarousel>
        <HomeHeroContent locale={locale} overrides={homeOverrides.hero} />
      </HomeHeroCarousel>

      <section className="-mt-10 relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-4 md:p-6">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4">
                <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
                <p className="mt-1 text-sm text-slate-600">{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="travel-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
              <HomeRecommendedHeader locale={locale} overrides={homeOverrides.recommended} />
              <div className="mt-5">
                <HomeTourSearchSection locale={locale} />
              </div>
            </div>
            <div className="rounded-[32px] border border-slate-100 bg-[linear-gradient(135deg,#0f172a,#1e293b)] p-8 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                {locale === "es" ? "Marketplace de viajes" : locale === "fr" ? "Marketplace de voyage" : "Travel marketplace"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight">
                {locale === "es"
                  ? "Busca, cotiza y reserva con una navegación más clara"
                  : locale === "fr"
                    ? "Cherchez, comparez et reservez avec une navigation plus claire"
                    : "Search, quote, and book with a clearer booking flow"}
              </h2>
              <div className="mt-5 space-y-4">
                {marketplaceHighlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-200">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
          <HomeBenefitsContent locale={locale} overrides={homeOverrides.benefits} />
        </div>
      </section>

      <section className="travel-surface">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {locale === "es" ? "Descubre primero" : locale === "fr" ? "Decouvrez d'abord" : "Discover first"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {locale === "es"
                    ? "Experiencias destacadas con intención real de reserva"
                    : locale === "fr"
                      ? "Experiences vedettes avec intention reelle de reservation"
                      : "Featured experiences built for real booking intent"}
                </h2>
              </div>
              <Link href={locale === "es" ? "/tours" : `/${locale}/tours`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                {locale === "es" ? "Ver todos los tours" : locale === "fr" ? "Voir toutes les excursions" : "Browse all tours"}
              </Link>
            </div>
            <div className="mt-6">
            <FeaturedToursSection locale={locale} />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
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
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
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
        </div>
      </section>

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
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {locale === "es" ? "Canal profesional" : locale === "fr" ? "Canal professionnel" : "Professional channel"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {locale === "es"
                  ? "También operamos con agencias y proveedores"
                  : locale === "fr"
                    ? "Nous operons aussi avec agences et fournisseurs"
                    : "We also operate with agencies and suppliers"}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {locale === "es"
                  ? "Si buscas una plataforma que además de vender opere con estructura B2B, AgencyPro, reservas directas y control operativo ya están integrados."
                  : locale === "fr"
                    ? "Si vous cherchez une plateforme qui combine ventes, B2B, AgencyPro et controle operationnel, elle existe deja."
                    : "If you need more than a brochure site, Proactivitis already supports AgencyPro, direct bookings, supplier workflows, and B2B operations."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={locale === "es" ? "/agency-partners" : `/${locale}/agency-partners`}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  {locale === "es" ? "Programa para agencias" : locale === "fr" ? "Programme agences" : "Agency program"}
                </Link>
                <Link
                  href={locale === "es" ? "/become-a-supplier" : `/${locale}/become-a-supplier`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {locale === "es" ? "Ser supplier" : locale === "fr" ? "Devenir supplier" : "Become a supplier"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="sr-only">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </div>
  );
}
