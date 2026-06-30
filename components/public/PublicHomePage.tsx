import Image from "next/image";
import Link from "next/link";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import { HomeAboutContent } from "@/components/public/HomeAboutContent";
import { HomeHeroContent } from "@/components/public/HomeHeroContent";
import { HomeHeroCarousel } from "@/components/public/HomeHeroCarousel";
import { HomeRecommendedHeader } from "@/components/public/HomeRecommendedHeader";
import HomeTourSearchSection from "@/components/public/HomeTourSearchSection";
import HomeTransferTicker from "@/components/public/HomeTransferTicker";
import { Locale, translate } from "@/lib/translations";
import { getHomeContentOverrides } from "@/lib/siteContent";
import { getPriceValidUntil, PROACTIVITIS_URL } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  CalendarCheck,
  Car,
  Compass,
  CreditCard,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type PublicHomePageProps = {
  locale: Locale;
};

const PUNTA_CANA_LINKS = [
  { slug: "tour-en-buggy-en-punta-cana", labelKey: "puntaCana.links.item.1" },
  {
    slug: "excursion-en-buggy-y-atv-en-punta-cana",
    labelKey: "puntaCana.links.item.2",
  },
  {
    slug: "tour-isla-saona-desde-bayhibe-la-romana",
    labelKey: "puntaCana.links.item.3",
  },
  {
    slug: "tour-y-entrada-para-de-isla-saona-desde-punta-cana",
    labelKey: "puntaCana.links.item.4",
  },
  { slug: "sunset-catamaran-snorkel", labelKey: "puntaCana.links.item.5" },
  { slug: "parasailing-punta-cana", labelKey: "puntaCana.links.item.6" },
  {
    slug: "cayo-levantado-luxury-beach-day",
    labelKey: "puntaCana.links.item.7",
  },
  {
    slug: "excursion-de-un-dia-a-santo-domingo-desde-punta-cana",
    labelKey: "puntaCana.links.item.8",
  },
  {
    slug: "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana",
    labelKey: "puntaCana.links.item.9",
  },
  {
    slug: "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana",
    labelKey: "puntaCana.links.item.10",
  },
] as const;

const SOSUA_PARTY_BOAT_LINKS = [
  {
    slug: "party-boat-sosua",
    es: "Sosua Party Boat: precios y opciones VIP",
    en: "Sosua Party Boat: prices and VIP options",
    fr: "Sosua Party Boat : prix et options VIP",
  },
  {
    slug: "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua",
    es: "Barco privado en Sosua desde Puerto Plata",
    en: "Private party boat in Sosua from Puerto Plata",
    fr: "Bateau prive a Sosua depuis Puerto Plata",
  },
] as const;

export default async function PublicHomePage({ locale }: PublicHomePageProps) {
  const t = (
    key: Parameters<typeof translate>[1],
    replacements?: Record<string, string>,
  ) => translate(locale, key, replacements);
  const transferHref = locale === "es" ? "/traslado" : `/${locale}/traslado`;
  const tourHref = (slug: string) =>
    locale === "es" ? `/tours/${slug}` : `/${locale}/tours/${slug}`;
  const homeOverrides = await getHomeContentOverrides(locale);
  const transferBannerImage =
    homeOverrides.transferBanner?.backgroundImage ??
    "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg";
  const priceValidUntil = getPriceValidUntil();
  const localePrefix = locale === "es" ? "" : `/${locale}`;
  const localePath = (path: string) => `${localePrefix}${path}`;
  const localizedPath = (path: string) =>
    `${PROACTIVITIS_URL}${locale === "es" ? path : `/${locale}${path}`}`;
  const tripStartCards = [
    {
      icon: Compass,
      href: localePath("/tours"),
      label:
        locale === "es"
          ? "Tours y experiencias"
          : locale === "fr"
            ? "Tours et experiences"
            : "Tours and experiences",
      title:
        locale === "es"
          ? "Encuentra actividades reales"
          : locale === "fr"
            ? "Trouvez des activites reelles"
            : "Find real activities",
      body:
        locale === "es"
          ? "Saona, buggy, catamarán, safari y experiencias con recogida coordinada."
          : locale === "fr"
            ? "Saona, buggy, catamaran, safari et experiences avec pickup coordonne."
            : "Saona, buggy, catamaran, safari, and experiences with coordinated pickup.",
    },
    {
      icon: Car,
      href: transferHref,
      label:
        locale === "es"
          ? "Traslado privado"
          : locale === "fr"
            ? "Transfert prive"
            : "Private transfer",
      title:
        locale === "es"
          ? "Llega sin negociar en el aeropuerto"
          : locale === "fr"
            ? "Arrivez sans negocier a l aeroport"
            : "Arrive without airport negotiation",
      body:
        locale === "es"
          ? "Busca hotel, aeropuerto o zona y ve el precio antes de reservar."
          : locale === "fr"
            ? "Cherchez hotel, aeroport ou zone et voyez le prix avant de reserver."
            : "Search hotel, airport, or area and see the price before booking.",
    },
    {
      icon: MapPinned,
      href: localePath("/destinos"),
      label:
        locale === "es"
          ? "Zonas populares"
          : locale === "fr"
            ? "Zones populaires"
            : "Popular areas",
      title:
        locale === "es"
          ? "Planifica por zona"
          : locale === "fr"
            ? "Planifiez par zone"
            : "Plan by area",
      body:
        locale === "es"
          ? "Explora Punta Cana, Bávaro, Cap Cana, Macao, Bayahibe y más."
          : locale === "fr"
            ? "Explorez Punta Cana, Bavaro, Cap Cana, Macao, Bayahibe et plus."
            : "Explore Punta Cana, Bavaro, Cap Cana, Macao, Bayahibe, and more.",
    },
  ];
  const trustNotes = [
    {
      icon: ShieldCheck,
      text:
        locale === "es"
          ? "Proveedores verificados"
          : locale === "fr"
            ? "Prestataires verifies"
            : "Verified providers",
    },
    {
      icon: MessageCircle,
      text:
        locale === "es"
          ? "Soporte humano por WhatsApp"
          : locale === "fr"
            ? "Support humain par WhatsApp"
            : "Human WhatsApp support",
    },
    {
      icon: CreditCard,
      text:
        locale === "es"
          ? "Pago protegido"
          : locale === "fr"
            ? "Paiement protege"
            : "Protected payment",
    },
  ];
  const steps = [
    {
      icon: Search,
      title:
        locale === "es"
          ? "Busca lo que quieres vivir"
          : locale === "fr"
            ? "Cherchez ce que vous voulez vivre"
            : "Search what you want to experience",
      body:
        locale === "es"
          ? "Tours, traslados o zonas populares con precios y detalles claros."
          : locale === "fr"
            ? "Tours, transferts ou zones populaires avec prix et details clairs."
            : "Tours, transfers, or popular areas with clear prices and details.",
    },
    {
      icon: CalendarCheck,
      title:
        locale === "es"
          ? "Reserva sin fricción"
          : locale === "fr"
            ? "Reservez sans friction"
            : "Book without friction",
      body:
        locale === "es"
          ? "Elige fecha, pasajeros y preferencias desde una experiencia simple."
          : locale === "fr"
            ? "Choisissez date, passagers et preferences dans une experience simple."
            : "Choose date, passengers, and preferences in a simple flow.",
    },
    {
      icon: Sparkles,
      title:
        locale === "es"
          ? "Viaja con apoyo local"
          : locale === "fr"
            ? "Voyagez avec support local"
            : "Travel with local support",
      body:
        locale === "es"
          ? "Confirmación, asistencia y coordinación humana cuando la necesitas."
          : locale === "fr"
            ? "Confirmation, assistance et coordination humaine quand vous en avez besoin."
            : "Confirmation, assistance, and human coordination when you need it.",
    },
  ];

  const [publishedTours, tourRatingAgg] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { in: ["published", "seo_only"] } },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        shortDescription: true,
        heroImage: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tourReview.groupBy({
      by: ["tourId"],
      where: { status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);
  const uniquePublishedTours = Array.from(
    new Map(publishedTours.map((tour) => [tour.slug, tour])).values(),
  );
  const tourRatingMap = new Map(
    tourRatingAgg.map((row) => [
      row.tourId,
      {
        rating: Number(row._avg.rating ?? 0),
        count: row._count.rating,
      },
    ]),
  );
  const featuredTourOrder = new Map<string, number>(PUNTA_CANA_LINKS.map((item, index) => [item.slug, index]));
  const featuredTours = uniquePublishedTours
    .filter((tour) => featuredTourOrder.has(tour.slug))
    .sort((a, b) => (featuredTourOrder.get(a.slug) ?? 999) - (featuredTourOrder.get(b.slug) ?? 999))
    .slice(0, 8);
  const homeCarouselTours = featuredTours.length ? featuredTours : uniquePublishedTours.slice(0, 8);
  const featuredTourProducts = homeCarouselTours.map((tour) => {
    const ratingData = tourRatingMap.get(tour.id);
    const hasRealRating = Boolean(ratingData?.count && ratingData.count > 0 && ratingData.rating > 0);
    const image = tour.heroImage?.startsWith("http")
      ? tour.heroImage
      : `${PROACTIVITIS_URL}${tour.heroImage || "/fototours/fotosimple.jpg"}`;
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
      image,
      brand: {
        "@type": "Brand",
        name: "Proactivitis",
      },
      ...(hasRealRating
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: Number(ratingData!.rating.toFixed(1)),
              reviewCount: ratingData!.count,
            },
          }
        : {}),
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: tour.price,
        priceValidUntil,
        availability: "https://schema.org/InStock",
        url: localizedPath(`/tours/${tour.slug}`),
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: "USD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "DO",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 1,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 1,
              unitCode: "DAY",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          url: `${PROACTIVITIS_URL}/legal/refund-policy`,
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 1,
          applicableCountry: "DO",
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    };
  });

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineBusiness",
        "@id": `${PROACTIVITIS_URL}/#organization`,
        name: "Proactivitis",
        url: `${PROACTIVITIS_URL}/`,
        logo: `${PROACTIVITIS_URL}/logo.png`,
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
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: 0,
                  currency: "USD",
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "DO",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                },
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                url: `${PROACTIVITIS_URL}/legal/refund-policy`,
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 1,
                applicableCountry: "DO",
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
              },
              itemOffered: {
                "@type": "Service",
                name: "Tours y Excursiones",
                url: `${PROACTIVITIS_URL}/tours`,
              },
            },
            {
              "@type": "Offer",
              priceValidUntil,
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: 0,
                  currency: "USD",
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "DO",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                },
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                url: `${PROACTIVITIS_URL}/legal/refund-policy`,
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 1,
                applicableCountry: "DO",
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
              },
              itemOffered: {
                "@type": "Service",
                name: "Traslados Privados",
                url: `${PROACTIVITIS_URL}/traslado`,
              },
            },
            {
              "@type": "Offer",
              priceValidUntil,
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: 0,
                  currency: "USD",
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "DO",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                },
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                url: `${PROACTIVITIS_URL}/legal/refund-policy`,
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 1,
                applicableCountry: "DO",
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
              },
              itemOffered: {
                "@type": "Service",
                name: "Rent a Car",
                url: `${PROACTIVITIS_URL}/rent-a-car`,
              },
            },
          ],
        },
      },
      {
        "@type": "WebPage",
        "@id": `${localizedPath("/")}#webpage`,
        url: localizedPath("/"),
        name:
          locale === "es"
            ? "Inicio Proactivitis"
            : locale === "fr"
              ? "Accueil Proactivitis"
              : "Proactivitis Home",
        isPartOf: {
          "@id": `${PROACTIVITIS_URL}/#website`,
        },
        about: {
          "@id": `${PROACTIVITIS_URL}/#organization`,
        },
        mainEntity: {
          "@id": `${localizedPath("/")}#featured-tour-carousel`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${localizedPath("/")}#featured-tour-carousel`,
        name:
          locale === "es"
            ? "Tours destacados de Proactivitis"
            : locale === "fr"
              ? "Excursions vedettes Proactivitis"
              : "Featured Proactivitis tours",
        numberOfItems: featuredTourProducts.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: featuredTourProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: product,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: translate(locale, "home.schema.faq.question.booking"),
            acceptedAnswer: {
              "@type": "Answer",
              text: translate(locale, "home.schema.faq.answer.booking"),
            },
          },
          {
            "@type": "Question",
            name: translate(locale, "home.schema.faq.question.agencies"),
            acceptedAnswer: {
              "@type": "Answer",
              text: translate(locale, "home.schema.faq.answer.agencies"),
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-slate-50 text-slate-900 overflow-x-hidden">
      <HomeHeroCarousel>
        <HomeHeroContent locale={locale} overrides={homeOverrides.hero} />
      </HomeHeroCarousel>

      <section className="relative z-10 -mt-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
          <div className="grid gap-px bg-slate-200/70 md:grid-cols-3">
            {tripStartCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex min-h-[190px] flex-col justify-between bg-white p-6 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 transition group-hover:-translate-y-0.5 group-hover:bg-sky-600 group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                      {card.label}
                    </span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <h2 className="text-xl font-black leading-tight text-slate-950">
                      {card.title}
                    </h2>
                    <p className="text-sm font-medium leading-6 text-slate-600">
                      {card.body}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
            {trustNotes.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.text}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200"
                >
                  <Icon className="h-4 w-4 text-emerald-600" aria-hidden />
                  {item.text}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="travel-surface">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-12 sm:px-6">
          <HomeRecommendedHeader
            locale={locale}
            overrides={homeOverrides.recommended}
          />
          <HomeTourSearchSection locale={locale} />
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
            <FeaturedToursSection locale={locale} />
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {homeOverrides.puntaCana?.subtitle ??
                t("puntaCana.links.subtitle")}
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
                  {locale === "es"
                    ? item.es
                    : locale === "en"
                      ? item.en
                      : item.fr}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.6fr] lg:items-stretch">
            <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-7 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-sky-300">
                {locale === "es"
                  ? "Cómo funciona"
                  : locale === "fr"
                    ? "Comment ça marche"
                    : "How it works"}
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight">
                {locale === "es"
                  ? "Menos dudas. Más viaje."
                  : locale === "fr"
                    ? "Moins de doute. Plus de voyage."
                    : "Less doubt. More travel."}
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-white/75">
                {locale === "es"
                  ? "Decide rápido: vive una experiencia, coordina tu traslado o explora por zona."
                  : locale === "fr"
                    ? "Decidez vite: vivez une experience, coordonnez votre transfert ou explorez par zone."
                    : "Decide quickly: book an experience, coordinate your transfer, or explore by area."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-black leading-tight text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                      {step.body}
                    </p>
                  </article>
                );
              })}
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
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-slate-900/55 md:bg-slate-900/65" />
            <div className="relative z-10 w-full space-y-6 px-6 py-10 text-center text-white md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                {homeOverrides.transferBanner?.label ??
                  t("home.transferBanner.label")}
              </p>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                {homeOverrides.transferBanner?.title ??
                  t("home.transferBanner.title")}
              </h2>
              <p className="text-sm text-white/90 md:text-base">
                {homeOverrides.transferBanner?.description ??
                  t("home.transferBanner.description")}
              </p>
              <HomeTransferTicker locale={locale} />
              <div className="botones-banner justify-center md:justify-start">
                <Link href={transferHref} className="boton-verde">
                  {homeOverrides.transferBanner?.cta ??
                    t("home.transferBanner.cta")}
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
          </div>
        </div>
      </section>
      <section className="sr-only">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </section>
    </div>
  );
}
