import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import { Locale, translate } from "@/lib/translations";
import StructuredData from "@/components/schema/StructuredData";
import { ensureLeadingCapital } from "@/lib/text-format";
import HotelPickupNavigator from "@/components/public/HotelPickupNavigator";

const RECENT_TOURS_LIMIT = 6;
const BASE_URL = "https://proactivitis.com";

type SearchParams = {
  bookingCode?: string;
};

type RecogidaPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
};

type PickupTarget = {
  slug: string;
  name: string;
  countryId: string;
  destinationId?: string | null;
  microZoneId?: string | null;
};

type TourWithDeparture = Prisma.TourGetPayload<{
  include: {
    departureDestination: { select: { name: true; slug: true; country: { select: { slug: true } } } };
  };
}>;

type TransferCard = {
  title: string;
  body: string;
  cta: string;
  href: string;
};

type TransferSectionCopy = {
  eyebrow: string;
  title: string;
  body: string;
  cards: [TransferCard, TransferCard, TransferCard];
};

type HotelNavigatorItem = {
  slug: string;
  name: string;
  zoneName: string;
  href: string;
};

type BenefitCard = {
  title: string;
  body: string;
};

type PickupFaq = {
  question: string;
  answer: string;
};

const transferCopyByLocale: Record<Locale, TransferSectionCopy> = {
  es: {
    eyebrow: "Traslados recomendados",
    title: "Coordina tu transporte desde {hotel}",
    body: "Reserva traslado privado, premium o combinaciones con tours desde un solo panel. Confirmacion rapida y soporte 24/7.",
    cards: [
      {
        title: "Traslado privado aeropuerto -> hotel",
        body: "Servicio directo, chofer verificado y tarifa clara para llegar sin demoras.",
        cta: "Ver traslados privados",
        href: "/traslado"
      },
      {
        title: "Premium transfer VIP",
        body: "Cadillac Escalade y Suburban para una llegada ejecutiva con seguimiento de vuelo.",
        cta: "Ver servicio premium",
        href: "/punta-cana/premium-transfer-services"
      },
      {
        title: "Excursiones con recogida en tu hotel",
        body: "Combina tours con pickup confirmado en lobby para optimizar tiempo y presupuesto.",
        cta: "Ver landing de recogida",
        href: "/excursiones-con-recogida"
      }
    ]
  },
  en: {
    eyebrow: "Recommended transfers",
    title: "Arrange transportation from {hotel}",
    body: "Book private transfer, VIP options, or transfer + tour bundles from one place with fast confirmation.",
    cards: [
      {
        title: "Private airport to hotel transfer",
        body: "Direct service, vetted driver, and clear pricing for a smooth arrival.",
        cta: "View private transfers",
        href: "/traslado"
      },
      {
        title: "Premium VIP transfer",
        body: "Cadillac Escalade and Suburban service with flight tracking and executive comfort.",
        cta: "View premium service",
        href: "/punta-cana/premium-transfer-services"
      },
      {
        title: "Hotel pickup excursions",
        body: "Bundle tours with lobby pickup to save time and keep logistics simple.",
        cta: "View hotel pickup page",
        href: "/excursions-with-hotel-pickup"
      }
    ]
  },
  fr: {
    eyebrow: "Transferts recommandes",
    title: "Organisez vos transferts depuis {hotel}",
    body: "Reservez transfert prive, service VIP ou packs transfert + excursions avec confirmation rapide.",
    cards: [
      {
        title: "Transfert prive aeroport -> hotel",
        body: "Service direct, chauffeur verifie et tarif clair pour arriver sans stress.",
        cta: "Voir les transferts prives",
        href: "/traslado"
      },
      {
        title: "Transfert premium VIP",
        body: "Cadillac Escalade et Suburban avec suivi de vol et confort haut de gamme.",
        cta: "Voir le service premium",
        href: "/punta-cana/premium-transfer-services"
      },
      {
        title: "Excursions avec pickup hotel",
        body: "Combinez vos excursions avec pickup au lobby pour une logistique simple.",
        cta: "Voir la page pickup hotel",
        href: "/excursions-avec-pickup-hotel"
      }
    ]
  }
};

const buildCanonical = (slug: string, locale: Locale) =>
  locale === "es" ? `${BASE_URL}/recogida/${slug}` : `${BASE_URL}/${locale}/recogida/${slug}`;

const pickupBasePathByLocale: Record<Locale, string> = {
  es: "/excursiones-con-recogida",
  en: "/excursions-with-hotel-pickup",
  fr: "/excursions-avec-pickup-hotel"
};

const buildPickupCanonical = (slug: string, locale: Locale) =>
  `${BASE_URL}${pickupBasePathByLocale[locale]}/${slug}`;

const buildPickupBenefits = (hotel: string, locale: Locale): BenefitCard[] => {
  if (locale === "en") {
    return [
      {
        title: "Hotel-specific logistics",
        body: `The page is built around ${hotel}, so the traveler understands pickup context before booking the excursion.`
      },
      {
        title: "Cleaner conversion path",
        body: "Instead of sending the visitor to a generic tours page, this landing narrows the route to experiences that make sense from that hotel."
      },
      {
        title: "Stronger purchase intent",
        body: "Searches with hotel pickup language usually come from travelers already close to booking and trying to reduce friction."
      }
    ];
  }

  if (locale === "fr") {
    return [
      {
        title: "Logistique liee a l hotel",
        body: `La page est construite autour de ${hotel}, donc le voyageur comprend mieux le contexte du pickup avant de reserver.`
      },
      {
        title: "Parcours plus propre",
        body: "Au lieu d envoyer vers une page tours generique, cette landing resserre le parcours sur les experiences coherentes depuis cet hotel."
      },
      {
        title: "Intention d achat plus forte",
        body: "Les recherches avec pickup hotel viennent souvent de voyageurs deja proches de la reservation."
      }
    ];
  }

  return [
    {
      title: "Logistica aterrizada al hotel",
      body: `La pagina esta armada alrededor de ${hotel}, asi que el viajero entiende mejor el pickup antes de reservar.`
    },
    {
      title: "Ruta de conversion mas limpia",
      body: "En vez de mandar al usuario a una pagina generica de tours, esta landing cierra el recorrido a experiencias que si tienen sentido desde ese hotel."
    },
    {
      title: "Intencion de compra mas fuerte",
      body: "Las busquedas con lenguaje de recogida por hotel suelen venir de viajeros mucho mas cerca de reservar."
    }
  ];
};

const buildPickupFaq = (hotel: string, locale: Locale): PickupFaq[] => {
  if (locale === "en") {
    return [
      {
        question: `Do these excursions include pickup from ${hotel}?`,
        answer: `Yes. The page is oriented to tours that can operate with pickup context from ${hotel}, and the exact meeting point is confirmed after booking.`
      },
      {
        question: "Can I still book if I am staying in a nearby resort?",
        answer: "Usually yes. If your hotel is in the same operational area, the team can confirm the closest pickup point or the correct lobby."
      },
      {
        question: "Are these tours only for Punta Cana hotels?",
        answer: "This line is built around active resorts and hotels in the Punta Cana and Bavaro operating area with real pickup demand."
      },
      {
        question: "What is the fastest way to confirm availability?",
        answer: "Open the excursion card, choose the experience that fits your trip, and complete the booking flow or contact support for confirmation."
      }
    ];
  }

  if (locale === "fr") {
    return [
      {
        question: `Ces excursions incluent-elles le pickup depuis ${hotel} ?`,
        answer: `Oui. La page est orientee vers des tours qui peuvent operer avec pickup depuis ${hotel}, avec point exact confirme apres reservation.`
      },
      {
        question: "Puis-je reserver si je loge dans un resort voisin ?",
        answer: "En general oui. Si votre hotel est dans la meme zone operationnelle, l equipe confirme le lobby ou point de pickup adapte."
      },
      {
        question: "Ces excursions sont-elles seulement pour les hotels de Punta Cana ?",
        answer: "Cette ligne est construite autour d hotels et resorts actifs de la zone Punta Cana et Bavaro avec vraie demande pickup."
      },
      {
        question: "Quelle est la facon la plus rapide de confirmer la disponibilite ?",
        answer: "Ouvrez la fiche excursion, choisissez l experience adaptee a votre voyage et terminez la reservation ou demandez confirmation a l equipe."
      }
    ];
  }

  return [
    {
      question: `Estas excursiones incluyen recogida desde ${hotel}?`,
      answer: `Si. La pagina esta orientada a tours que pueden operar con contexto de pickup desde ${hotel}, y el punto exacto se confirma despues de reservar.`
    },
    {
      question: "Puedo reservar si estoy en un resort cercano?",
      answer: "Normalmente si. Si tu hotel esta en la misma zona operativa, el equipo puede confirmar el lobby correcto o el punto mas cercano."
    },
    {
      question: "Estas excursiones son solo para hoteles de Punta Cana?",
      answer: "Esta linea esta construida alrededor de hoteles y resorts activos de Punta Cana y Bavaro con demanda real de recogida."
    },
    {
      question: "Cual es la forma mas rapida de confirmar disponibilidad?",
      answer: "Abre la ficha de la excursion, elige la experiencia que encaja con tu viaje y completa la reserva o confirma con soporte."
    }
  ];
};

export async function buildRecogidaMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const pickupTarget = await resolvePickupTarget(slug);
  if (!pickupTarget) {
    return {
      title: ensureLeadingCapital(translate(locale, "recogida.meta.fallbackTitle")),
      description: translate(locale, "recogida.meta.fallbackDescription")
    };
  }

  return {
    title: ensureLeadingCapital(translate(locale, "recogida.meta.title", { hotel: pickupTarget.name })),
    description: translate(locale, "recogida.meta.description", { hotel: pickupTarget.name }),
    alternates: {
      canonical: buildCanonical(pickupTarget.slug, locale),
      languages: {
        es: `/recogida/${pickupTarget.slug}`,
        en: `/en/recogida/${pickupTarget.slug}`,
        fr: `/fr/recogida/${pickupTarget.slug}`,
        "x-default": `/recogida/${pickupTarget.slug}`
      }
    }
  };
}

export async function buildRecogidaPickupMetadata(slug: string, locale: Locale): Promise<Metadata> {
  const pickupTarget = await resolvePickupTarget(slug);
  if (!pickupTarget) {
    return {
      title: ensureLeadingCapital(translate(locale, "recogida.pickup.meta.fallbackTitle")),
      description: translate(locale, "recogida.pickup.meta.fallbackDescription")
    };
  }

  return {
    title: ensureLeadingCapital(translate(locale, "recogida.pickup.meta.title", { hotel: pickupTarget.name })),
    description: translate(locale, "recogida.pickup.meta.description", { hotel: pickupTarget.name }),
    robots: {
      index: true,
      follow: true
    },
    alternates: {
      canonical: buildPickupCanonical(pickupTarget.slug, locale),
      languages: {
        es: `${pickupBasePathByLocale.es}/${pickupTarget.slug}`,
        en: `${pickupBasePathByLocale.en}/${pickupTarget.slug}`,
        fr: `${pickupBasePathByLocale.fr}/${pickupTarget.slug}`,
        "x-default": `${pickupBasePathByLocale.es}/${pickupTarget.slug}`
      }
    },
    openGraph: {
      title: ensureLeadingCapital(translate(locale, "recogida.pickup.meta.title", { hotel: pickupTarget.name })),
      description: translate(locale, "recogida.pickup.meta.description", { hotel: pickupTarget.name }),
      url: buildPickupCanonical(pickupTarget.slug, locale),
      type: "website",
      siteName: "Proactivitis",
      locale: locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US",
      images: [{ url: `${BASE_URL}/fototours/fototour.jpeg`, alt: pickupTarget.name }]
    },
    twitter: {
      card: "summary_large_image",
      title: ensureLeadingCapital(translate(locale, "recogida.pickup.meta.title", { hotel: pickupTarget.name })),
      description: translate(locale, "recogida.pickup.meta.description", { hotel: pickupTarget.name }),
      images: [`${BASE_URL}/fototours/fototour.jpeg`]
    },
    keywords:
      locale === "en"
        ? [
            `${pickupTarget.name} excursions`,
            `${pickupTarget.name} tours`,
            `${pickupTarget.name} hotel pickup tours`,
            "punta cana excursions with hotel pickup",
            "things to do from hotel"
          ]
        : locale === "fr"
          ? [
              `excursions ${pickupTarget.name}`,
              `pickup hotel ${pickupTarget.name}`,
              "excursions punta cana pickup hotel",
              "tours depuis hotel punta cana",
              "activites avec pickup hotel"
            ]
          : [
              `excursiones ${pickupTarget.name}`,
              `tours con recogida en ${pickupTarget.name}`,
              "excursiones punta cana con recogida en hotel",
              "cosas que hacer desde hotel punta cana",
              "tours con pickup hotel"
            ]
  };
}


const buildTourUrl = (
  tour: { slug: string },
  locationSlug: string,
  locale: Locale,
  bookingCode?: string
) => {
  const params = new URLSearchParams({
    hotelSlug: locationSlug
  });
  if (bookingCode) {
    params.set("bookingCode", bookingCode);
  }
  const basePath =
    locale === "es"
      ? `/tours/${tour.slug}/recogida/${locationSlug}`
      : `/${locale}/tours/${tour.slug}/recogida/${locationSlug}`;
  return `${basePath}?${params.toString()}`;
};

const resolvePickupTarget = async (slug: string): Promise<PickupTarget | null> => {
  const db = prisma as any;
  const location = await db.location.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      countryId: true,
      destinationId: true,
      microZoneId: true
    }
  });

  if (location) {
    return location;
  }

  const transferLocation = await db.transferLocation.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      countryCode: true
    }
  });

  if (!transferLocation) return null;

  const mappedLocation = await db.location.findFirst({
    where: {
      OR: [{ slug: transferLocation.slug }, { name: transferLocation.name }]
    },
    select: {
      destinationId: true,
      microZoneId: true
    }
  });

  return {
    slug: transferLocation.slug,
    name: transferLocation.name,
    countryId: transferLocation.countryCode,
    destinationId: mappedLocation?.destinationId ?? null,
    microZoneId: mappedLocation?.microZoneId ?? null
  };
};

export async function RecogidaPage({
  params,
  searchParams,
  locale
}: RecogidaPageProps & { locale: Locale }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const bookingCode = resolvedSearchParams?.bookingCode;
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
  const transferCopy = transferCopyByLocale[locale];
  const localPath = (path: string) => (locale === "es" ? path : `/${locale}${path}`);
  const db = prisma as any;

  let pickupTarget: PickupTarget | null = null;
  try {
    pickupTarget = await resolvePickupTarget(resolvedParams.slug);
  } catch (error) {
    console.error("Error cargando pickup target para slug", { slug: resolvedParams.slug, error });
    throw error;
  }

  if (!pickupTarget) {
    console.error("Pickup target no encontrado", { slug: resolvedParams.slug });
    notFound();
  }

  const baseCountryCondition = { countryId: pickupTarget.countryId };

  const allHotels = await db.transferLocation.findMany({
    where: { type: "HOTEL", active: true, countryCode: pickupTarget.countryId },
    select: {
      slug: true,
      name: true,
      zone: { select: { name: true } }
    },
    orderBy: [{ zone: { name: "asc" } }, { name: "asc" }]
  });

  const buildTourInclude = {
    departureDestination: { select: { name: true, slug: true, country: { select: { slug: true } } } }
  } as const;

  const uniqueTours = (items: TourWithDeparture[]) => {
    const seen = new Set<string>();
    return items.filter((tour) => {
      if (seen.has(tour.id)) return false;
      seen.add(tour.id);
      return true;
    });
  };

  let microZoneTours: TourWithDeparture[] = [];
  let destinationTours: TourWithDeparture[] = [];
  let countryFallbackTours: TourWithDeparture[] = [];

  try {
    if (pickupTarget.microZoneId) {
      microZoneTours = await db.tour.findMany({
        where: {
          status: "published",
          countryId: pickupTarget.countryId,
          microZoneId: pickupTarget.microZoneId
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: RECENT_TOURS_LIMIT,
        include: buildTourInclude
      });
    }

    if (pickupTarget.destinationId) {
      destinationTours = await db.tour.findMany({
        where: {
          status: "published",
          countryId: pickupTarget.countryId,
          destinationId: pickupTarget.destinationId
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: RECENT_TOURS_LIMIT + 3,
        include: buildTourInclude
      });
    }

    countryFallbackTours = await db.tour.findMany({
      where: {
        status: "published",
        countryId: pickupTarget.countryId
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: RECENT_TOURS_LIMIT + 4,
      include: buildTourInclude
    });
  } catch (error) {
    console.error("Error cargando tours pickup por hotel", {
      slug: resolvedParams.slug,
      pickupTarget,
      error
    });
  }

  const primaryTours = uniqueTours([
    ...microZoneTours,
    ...destinationTours.filter((tour) => !microZoneTours.some((item) => item.id === tour.id))
  ]).slice(0, RECENT_TOURS_LIMIT);

  const secondaryTours = uniqueTours(
    countryFallbackTours.filter((tour) => !primaryTours.some((item) => item.id === tour.id))
  ).slice(0, 3);

  const displayTours = primaryTours.length ? primaryTours : countryFallbackTours.slice(0, RECENT_TOURS_LIMIT);
  const displayMode = primaryTours.length
    ? pickupTarget.microZoneId
      ? "microzone"
      : "destination"
    : "country";

  const canonicalUrl = buildPickupCanonical(pickupTarget.slug, locale);
  const localizedHome = locale === "es" ? "/" : `/${locale}`;
  const localizedRecogidaBase = locale === "es" ? "/excursiones-con-recogida" : pickupBasePathByLocale[locale];
  const navigatorHotels: HotelNavigatorItem[] = allHotels.map((hotel: { slug: string; name: string; zone: { name: string } }) => ({
    slug: hotel.slug,
    name: hotel.name,
    zoneName: hotel.zone.name,
    href: `${localizedRecogidaBase}/${hotel.slug}`
  }));
  const currentHotelZone =
    allHotels.find((hotel: { slug: string; zone: { name: string } }) => hotel.slug === pickupTarget.slug)?.zone.name ??
    allHotels[0]?.zone.name ??
    "Punta Cana";
  const relatedHotels = navigatorHotels
    .filter((hotel) => hotel.slug !== pickupTarget.slug)
    .sort((a, b) => {
      const score = (item: HotelNavigatorItem) => {
        let value = 0;
        if (item.zoneName === currentHotelZone) value += 2;
        if (item.name.toLowerCase().includes("resort")) value += 1;
        return value;
      };
      return score(b) - score(a);
    })
    .slice(0, 6);
  const pickupBenefits = buildPickupBenefits(pickupTarget.name, locale);
  const pickupFaq = buildPickupFaq(pickupTarget.name, locale);
  const toursSectionTitle =
    locale === "es"
      ? displayMode === "microzone"
        ? `Tours con mejor encaje para ${pickupTarget.name}`
        : displayMode === "destination"
          ? `Tours con recogida desde la zona de ${pickupTarget.name}`
          : `Tours disponibles cerca de ${pickupTarget.name}`
      : locale === "fr"
        ? displayMode === "microzone"
          ? `Tours avec meilleur encaje pour ${pickupTarget.name}`
          : displayMode === "destination"
            ? `Tours avec pickup depuis la zone de ${pickupTarget.name}`
            : `Tours disponibles pres de ${pickupTarget.name}`
        : displayMode === "microzone"
          ? `Best-fit tours for ${pickupTarget.name}`
          : displayMode === "destination"
            ? `Tours with pickup from the ${pickupTarget.name} area`
            : `Available tours near ${pickupTarget.name}`;
  const toursSectionBody =
    locale === "es"
      ? displayMode === "country"
        ? "No encontramos suficiente inventario hyper-especifico para ese hotel, asi que mostramos opciones cercanas dentro del mismo mercado operativo."
        : "Estas cards priorizan experiencias con mejor encaje operativo para ese hotel y su zona inmediata."
      : locale === "fr"
        ? displayMode === "country"
          ? "Nous n avons pas trouve assez d inventaire hyper specifique pour cet hotel, donc nous montrons des options proches dans le meme marche operationnel."
          : "Ces cards priorisent les experiences les plus coherentes pour cet hotel et sa zone immediate."
        : displayMode === "country"
          ? "There was not enough hyper-specific inventory for that hotel, so these cards fall back to nearby options in the same operating market."
          : "These cards prioritize the excursions that operationally fit that hotel and its immediate area better.";
  const destinationAreaLabel = pickupTarget.microZoneId
    ? currentHotelZone
    : pickupTarget.destinationId
      ? currentHotelZone
      : locale === "fr"
        ? "Punta Cana"
        : locale === "en"
          ? "Punta Cana"
          : "Punta Cana";

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#webpage`,
    name: t("recogida.meta.title", { hotel: pickupTarget.name }),
    description: t("recogida.meta.description", { hotel: pickupTarget.name }),
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      name: "Proactivitis",
      url: BASE_URL
    },
    about: {
      "@id": `${canonicalUrl}#hotel`
    },
    mainEntity: {
      "@id": `${canonicalUrl}#tour-list`
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Proactivitis",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    image: `${BASE_URL}/fototours/fototour.jpeg`
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Proactivitis",
    publisher: {
      "@id": `${BASE_URL}/#organization`
    },
    inLanguage: locale
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@id": `${canonicalUrl}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Proactivitis", item: `${BASE_URL}${localizedHome}` },
      { "@type": "ListItem", position: 2, name: t("recogida.hero.eyebrow"), item: `${BASE_URL}${localizedRecogidaBase}` },
      { "@type": "ListItem", position: 3, name: pickupTarget.name, item: canonicalUrl }
    ]
  };

  const hotelPlaceSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${canonicalUrl}#hotel`,
    name: pickupTarget.name,
    address: {
      "@type": "PostalAddress",
      addressCountry: pickupTarget.countryId,
      addressLocality: destinationAreaLabel
    }
  };

  const toursItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonicalUrl}#tour-list`,
    name: t("recogida.tours.title"),
    itemListElement: displayTours.slice(0, 6).map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}${buildTourUrl(tour, pickupTarget.slug, locale, bookingCode)}`,
      item: {
        "@type": "TouristTrip",
        name: tour.title,
        description: tour.shortDescription ?? t("recogida.tours.cardFallback")
      }
    }))
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    mainEntity: pickupFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <StructuredData data={webPageSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelPlaceSchema} />
      <StructuredData data={toursItemListSchema} />
      <StructuredData data={faqSchema} />
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[1.08fr,0.92fr]">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">{t("recogida.hero.eyebrow")}</p>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] text-slate-950 md:text-5xl">
                {t("recogida.hero.title", { hotel: pickupTarget.name })}
              </h1>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-lg text-emerald-600">{"\u2713"}</span>
                {t("recogida.hero.confirmed", { hotel: pickupTarget.name })}
              </p>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">{t("recogida.hero.body")}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{t("recogida.hotel.label")}</p>
                <p className="mt-2 text-lg font-bold text-slate-950">{pickupTarget.name}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {locale === "es" ? "Zona operativa" : locale === "fr" ? "Zone operationnelle" : "Operating area"}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">{currentHotelZone}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {locale === "es" ? "Tours mostrados" : locale === "fr" ? "Tours affiches" : "Tours shown"}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">{displayTours.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-900 bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t("recogida.booking.label")}</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">{t("recogida.booking.codeLabel")}</p>
                <p className="mt-2 text-lg font-semibold text-white">{bookingCode ?? t("recogida.booking.fallback")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-200">
                {t("recogida.booking.note")}
              </div>
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  {locale === "es" ? "Promesa de esta landing" : locale === "fr" ? "Promesse de cette landing" : "Landing promise"}
                </p>
                <p className="mt-2 text-sm leading-7 text-emerald-50">
                  {locale === "es"
                    ? "Menos ruido, mejores tours para ese hotel y una ruta mas corta desde busqueda hasta reserva."
                    : locale === "fr"
                      ? "Moins de bruit, meilleurs tours pour cet hotel et un parcours plus court entre la recherche et la reservation."
                      : "Less noise, better tours for that hotel, and a shorter path from search to booking."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              {locale === "es" ? "Filtro de hoteles" : locale === "fr" ? "Filtre hotels" : "Hotel filter"}
            </p>
            <h2 className="text-2xl font-bold text-slate-950">
              {locale === "es"
                ? "Cambia de hotel sin salir de la linea de recogida"
                : locale === "fr"
                  ? "Changez d hotel sans quitter cette ligne pickup"
                  : "Switch hotels without leaving the pickup line"}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {locale === "es"
                ? "Busca por nombre del resort o filtra por zona para encontrar la landing correcta mas rapido. Esto mejora UX y tambien deja la arquitectura por hotel mucho mas clara."
                : locale === "fr"
                  ? "Recherchez par nom de resort ou filtrez par zone pour trouver la bonne landing plus vite. Cela ameliore l UX et clarifie mieux l architecture par hotel."
                  : "Search by resort name or filter by area to reach the right landing faster. It improves UX and also creates a clearer hotel-based architecture."}
            </p>
          </div>
          <div className="mt-6">
            <HotelPickupNavigator hotels={navigatorHotels} locale={locale} currentSlug={pickupTarget.slug} />
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-300">{transferCopy.eyebrow}</p>
            <h2 className="text-2xl font-semibold text-white">
              {transferCopy.title.replace("{hotel}", pickupTarget.name)}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-200">{transferCopy.body}</p>
          </div>
          <div className="relative mt-5 grid gap-4 md:grid-cols-3">
            {transferCopy.cards.map((card) => (
              <article
                key={card.title}
                className="group flex h-full flex-col rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300/60 hover:bg-white/15"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                  VIP
                </div>
                <h3 className="text-base font-semibold text-white">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-slate-200">{card.body}</p>
                <Link
                  href={localPath(card.href)}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-300"
                >
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              {locale === "es" ? "Por que esta landing existe" : locale === "fr" ? "Pourquoi cette landing existe" : "Why this landing exists"}
            </p>
            <h2 className="text-2xl font-bold text-slate-950">
              {locale === "es"
                ? "Excursiones con sentido desde este hotel"
                : locale === "fr"
                  ? "Des excursions coherentes depuis cet hotel"
                  : "Excursions that make sense from this hotel"}
            </h2>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {pickupBenefits.map((item) => (
              <article key={item.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {locale === "es" ? "Ventaja" : locale === "fr" ? "Avantage" : "Advantage"}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t("recogida.tours.eyebrow")}</p>
          <h2 className="text-3xl font-semibold text-slate-900">{toursSectionTitle}</h2>
          <p className="text-sm leading-7 text-slate-600">{toursSectionBody}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayTours.map((tour) => (
            <article key={tour.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
              <div className="relative h-52 bg-slate-200">
                <Image
                  src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900">
                    {locale === "es" ? "Pickup hotel" : locale === "fr" ? "Pickup hotel" : "Hotel pickup"}
                  </span>
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                    ${tour.price.toFixed(0)} USD
                  </span>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {pickupTarget.name}
                    </span>
                    {tour.duration ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {String(tour.duration)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="line-clamp-2 text-lg font-bold leading-7 text-slate-950">{tour.title}</h3>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    {tour.departureDestination?.name ?? tour.location}
                  </p>
                </div>
                <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                  {tour.shortDescription ?? t("recogida.tours.cardFallback")}
                </p>
                <div className="grid gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">
                      {locale === "es" ? "Desde" : locale === "fr" ? "Des" : "From"}
                    </span>
                    <span className="text-base font-black text-emerald-700">${tour.price.toFixed(0)} USD</span>
                  </div>
                  <Link
                    href={buildTourUrl(tour, pickupTarget.slug, locale, bookingCode)}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
                  >
                    {t("recogida.tours.cardCta", { tour: tour.title, hotel: pickupTarget.name })}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {secondaryTours.length ? (
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                {locale === "es" ? "Mas opciones en el mercado" : locale === "fr" ? "Plus d options dans le marche" : "More options in the market"}
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                {locale === "es"
                  ? "Excursiones adicionales si quieres comparar"
                  : locale === "fr"
                    ? "Excursions additionnelles si vous voulez comparer"
                    : "Additional excursions if you want to compare"}
              </h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {secondaryTours.map((tour) => (
                <Link
                  key={tour.id}
                  href={buildTourUrl(tour, pickupTarget.slug, locale, bookingCode)}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {tour.departureDestination?.name ?? tour.location}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{tour.title}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                    {tour.shortDescription ?? t("recogida.tours.cardFallback")}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              {locale === "es" ? "Mas hoteles conectados" : locale === "fr" ? "Plus d hotels connectes" : "More connected hotels"}
            </p>
            <h2 className="text-2xl font-bold text-slate-950">
              {locale === "es"
                ? "Otras landings de recogida en la misma linea"
                : locale === "fr"
                  ? "Autres landings pickup dans la meme ligne"
                  : "Other pickup landings in the same line"}
            </h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relatedHotels.map((hotel) => (
              <Link
                key={hotel.slug}
                href={hotel.href}
                className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{hotel.zoneName}</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{hotel.name}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {locale === "es"
                    ? "Explora tours que encajan mejor con la operacion de ese hotel."
                    : locale === "fr"
                      ? "Explorez les tours qui collent mieux a l operation de cet hotel."
                      : "Explore tours that fit the pickup operation of that hotel better."}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">FAQ</p>
            <h2 className="text-2xl font-bold text-slate-950">
              {locale === "es"
                ? "Preguntas frecuentes sobre excursiones con recogida por hotel"
                : locale === "fr"
                  ? "Questions frequentes sur les excursions avec pickup hotel"
                  : "Frequently asked questions about hotel pickup excursions"}
            </h2>
          </div>
          <div className="mt-5 grid gap-4">
            {pickupFaq.map((item) => (
              <article key={item.question} className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export async function buildRecogidaHubMetadata(locale: Locale): Promise<Metadata> {
  const basePath = pickupBasePathByLocale[locale];
  const title =
    locale === "en"
      ? "Excursions with Hotel Pickup in Punta Cana | Proactivitis"
      : locale === "fr"
        ? "Excursions avec pickup hotel a Punta Cana | Proactivitis"
        : "Excursiones con recogida en hotel en Punta Cana | Proactivitis";
  const description =
    locale === "en"
      ? "Find excursions with hotel pickup in Punta Cana, filter resorts by area, and open the right landing before booking your tour."
      : locale === "fr"
        ? "Trouvez des excursions avec pickup hotel a Punta Cana, filtrez les resorts par zone et ouvrez la bonne landing avant de reserver."
        : "Encuentra excursiones con recogida en hotel en Punta Cana, filtra resorts por zona y abre la landing correcta antes de reservar.";

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true
    },
    alternates: {
      canonical: `${BASE_URL}${basePath}`,
      languages: {
        es: pickupBasePathByLocale.es,
        en: pickupBasePathByLocale.en,
        fr: pickupBasePathByLocale.fr,
        "x-default": pickupBasePathByLocale.es
      }
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${basePath}`,
      siteName: "Proactivitis",
      type: "website",
      locale: locale === "es" ? "es_DO" : locale === "fr" ? "fr_FR" : "en_US",
      images: [{ url: `${BASE_URL}/fototours/fototour.jpeg`, alt: "Excursions with hotel pickup" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/fototours/fototour.jpeg`]
    }
  };
}

export async function RecogidaHubPage({ locale }: { locale: Locale }) {
  const db = prisma as any;
  const hotels = await db.transferLocation.findMany({
    where: { type: "HOTEL", active: true, countryCode: "RD" },
    select: {
      slug: true,
      name: true,
      zone: { select: { name: true } }
    },
    orderBy: [{ zone: { name: "asc" } }, { name: "asc" }]
  });

  const basePath = pickupBasePathByLocale[locale];
  const hotelsForNavigator: HotelNavigatorItem[] = hotels.map((hotel: { slug: string; name: string; zone: { name: string } }) => ({
    slug: hotel.slug,
    name: hotel.name,
    zoneName: hotel.zone.name,
    href: `${basePath}/${hotel.slug}`
  }));

  const title =
    locale === "en"
      ? "Excursions with Hotel Pickup in Punta Cana"
      : locale === "fr"
        ? "Excursions avec pickup hotel a Punta Cana"
        : "Excursiones con recogida en hotel en Punta Cana";
  const body =
    locale === "en"
      ? "Use this hotel-first directory to find the right excursion landing by resort, area, and pickup context before booking."
      : locale === "fr"
        ? "Utilisez ce repertoire par hotel pour trouver la bonne landing excursion par resort, zone et contexte de pickup avant de reserver."
        : "Usa este directorio por hotel para encontrar la landing correcta de excursion segun resort, zona y contexto de recogida antes de reservar.";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "Proactivitis",
        url: BASE_URL,
        logo: `${BASE_URL}/icon.png`
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: "Proactivitis",
        url: BASE_URL,
        publisher: { "@id": `${BASE_URL}/#organization` }
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE_URL}${basePath}#webpage`,
        url: `${BASE_URL}${basePath}`,
        name: title,
        description: body,
        isPartOf: { "@id": `${BASE_URL}/#website` }
      },
      {
        "@type": "ItemList",
        "@id": `${BASE_URL}${basePath}#hotel-list`,
        name: title,
        itemListElement: hotelsForNavigator.slice(0, 24).map((hotel, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${BASE_URL}${hotel.href}`,
          name: hotel.name
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <StructuredData data={collectionSchema} />
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            {locale === "es" ? "Linea hotel pickup" : locale === "fr" ? "Ligne hotel pickup" : "Hotel pickup line"}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[1.02] text-slate-950 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{body}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {locale === "es" ? "Hoteles activos" : locale === "fr" ? "Hotels actifs" : "Active hotels"}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">{hotelsForNavigator.length}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {locale === "es" ? "Zonas" : locale === "fr" ? "Zones" : "Areas"}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">{new Set(hotelsForNavigator.map((hotel) => hotel.zoneName)).size}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {locale === "es" ? "Objetivo" : locale === "fr" ? "Objectif" : "Goal"}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">
                {locale === "es" ? "Reserva mas limpia" : locale === "fr" ? "Reservation plus propre" : "Cleaner booking"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              {locale === "es" ? "Buscador de hoteles" : locale === "fr" ? "Recherche hotels" : "Hotel finder"}
            </p>
            <h2 className="text-2xl font-bold text-slate-950">
              {locale === "es"
                ? "Filtra por resort y abre la landing correcta"
                : locale === "fr"
                  ? "Filtrez par resort et ouvrez la bonne landing"
                  : "Filter by resort and open the right landing"}
            </h2>
          </div>
          <div className="mt-6">
            <HotelPickupNavigator hotels={hotelsForNavigator} locale={locale} currentSlug="" />
          </div>
        </section>
      </main>
    </div>
  );
}

