import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/translations";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { prisma } from "@/lib/prisma";
import PremiumTransferBookingWidget from "@/components/transfers/PremiumTransferBookingWidget";
import StructuredData from "@/components/schema/StructuredData";
import {
  PROACTIVITIS_URL,
  PROACTIVITIS_LOCALBUSINESS,
  PROACTIVITIS_WHATSAPP_LINK,
  SAME_AS_URLS,
  getPriceValidUntil
} from "@/lib/seo";
import { normalizeTextDeep } from "@/lib/text-format";
import {
  premiumTransferMarketLandings,
  type PremiumTransferMarketLanding
} from "@/data/premium-transfer-market-landings";

const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? PROACTIVITIS_WHATSAPP_LINK;
const DOMINICAN_COUNTRY_CODES = ["RD", "DO", "DOMINICAN-REPUBLIC"];

const toAbsoluteImageUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}/transfer/suv.png`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

type Props = {
  locale: Locale;
  variant?: PremiumTransferMarketLanding;
};

type Theme = {
  shell: string;
  heroGlow: string;
  pill: string;
  button: string;
  buttonText: string;
  panel: string;
  panelSoft: string;
  accent: string;
  accentSoft: string;
  border: string;
};

type VariantContext = {
  intentId: string | null;
  areaId: string | null;
  areaLabel: string;
  themeLabel: string;
  strapline: string;
  highlights: string[];
  reasons: string[];
  routeSteps: string[];
  facts: Array<{ label: string; value: string }>;
  trust: string[];
  faqs: Array<{ q: string; a: string }>;
};

const THEMES: Record<string, Theme> = {
  vip: {
    shell: "bg-[#07111f] text-slate-100",
    heroGlow: "from-cyan-400/15 via-sky-300/10 to-amber-300/10",
    pill: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
    button: "bg-cyan-300 hover:bg-cyan-200",
    buttonText: "text-slate-950",
    panel: "border-cyan-200/20 bg-slate-950/55",
    panelSoft: "border-cyan-200/15 bg-slate-900/65",
    accent: "text-amber-100",
    accentSoft: "text-white",
    border: "border-cyan-200/20"
  },
  luxury: {
    shell: "bg-[#140f08] text-stone-100",
    heroGlow: "from-amber-300/15 via-orange-300/10 to-zinc-50/5",
    pill: "border-amber-200/40 bg-amber-200/10 text-amber-50",
    button: "bg-amber-300 hover:bg-amber-200",
    buttonText: "text-stone-950",
    panel: "border-amber-200/20 bg-stone-950/55",
    panelSoft: "border-amber-200/15 bg-stone-900/65",
    accent: "text-amber-100",
    accentSoft: "text-white",
    border: "border-amber-200/20"
  },
  executive: {
    shell: "bg-[#081018] text-slate-100",
    heroGlow: "from-emerald-300/15 via-teal-300/10 to-cyan-300/10",
    pill: "border-emerald-200/40 bg-emerald-200/10 text-emerald-50",
    button: "bg-emerald-300 hover:bg-emerald-200",
    buttonText: "text-slate-950",
    panel: "border-emerald-200/20 bg-slate-950/55",
    panelSoft: "border-emerald-200/15 bg-slate-900/65",
    accent: "text-amber-100",
    accentSoft: "text-white",
    border: "border-emerald-200/20"
  },
  family: {
    shell: "bg-[#11120b] text-lime-50",
    heroGlow: "from-lime-300/15 via-yellow-300/10 to-orange-200/10",
    pill: "border-lime-200/40 bg-lime-200/10 text-lime-50",
    button: "bg-lime-300 hover:bg-lime-200",
    buttonText: "text-lime-950",
    panel: "border-lime-200/20 bg-stone-950/55",
    panelSoft: "border-lime-200/15 bg-stone-900/65",
    accent: "text-amber-100",
    accentSoft: "text-white",
    border: "border-lime-200/20"
  }
};

const DEFAULT_THEME = THEMES.vip;

const getAreaLabel = (areaId: string | null, locale: Locale) => {
  const labels: Record<string, Record<Locale, string>> = {
    bavaro: { es: "Bavaro", en: "Bavaro", fr: "Bavaro" },
    "cap-cana": { es: "Cap Cana", en: "Cap Cana", fr: "Cap Cana" },
    "uvero-alto": { es: "Uvero Alto", en: "Uvero Alto", fr: "Uvero Alto" },
    "arena-gorda": { es: "Arena Gorda", en: "Arena Gorda", fr: "Arena Gorda" },
    "punta-cana-resorts": {
      es: "Resorts de Punta Cana",
      en: "Punta Cana Resorts",
      fr: "Resorts de Punta Cana"
    }
  };
  return labels[areaId ?? ""]?.[locale] ?? (locale === "fr" ? "Punta Cana" : locale === "en" ? "Punta Cana" : "Punta Cana");
};

const getVariantTokens = (variant?: PremiumTransferMarketLanding) => {
  if (!variant) return { intentId: null, areaId: null };
  const parts = variant.slug.split("-");
  const areaIds = ["punta-cana-resorts", "uvero-alto", "arena-gorda", "cap-cana", "bavaro"];
  const areaId = areaIds.find((item) => variant.slug.endsWith(item)) ?? null;
  if (!areaId) return { intentId: variant.slug, areaId: null };
  return {
    areaId,
    intentId: parts.slice(0, parts.length - areaId.split("-").length).join("-")
  };
};

const getThemeKey = (intentId: string | null) => {
  if (!intentId) return "vip";
  if (intentId.includes("luxury") || intentId.includes("cadillac") || intentId.includes("suburban")) return "luxury";
  if (intentId.includes("executive") || intentId.includes("chauffeur")) return "executive";
  if (intentId.includes("family")) return "family";
  return "vip";
};

const getVariantContext = (locale: Locale, variant?: PremiumTransferMarketLanding): VariantContext => {
  const { intentId, areaId } = getVariantTokens(variant);
  const areaLabel = getAreaLabel(areaId, locale);
  const themeKey = getThemeKey(intentId);

  const base = {
    es: {
      strapline: "Servicio premium disenado para viajeros que quieren llegar sin estres, sin esperas y con una experiencia claramente superior.",
      themeLabels: {
        vip: "Ruta VIP",
        luxury: "Traslado de lujo",
        executive: "Chauffeur ejecutivo",
        family: "Luxury family ride"
      },
      highlights: [
        "Recogida puntual con seguimiento de vuelo en tiempo real.",
        "SUV premium con espacio de equipaje y climatizacion real.",
        "Operacion privada de aeropuerto a hotel sin improvisaciones."
      ],
      reasons: [
        "Mas imagen y comodidad que un transfer estandar.",
        "Confirmacion rapida por WhatsApp y soporte operativo.",
        "Cobertura solida para llegadas tardias, familias y grupos premium."
      ],
      route: [
        "Recepcion en PUJ con coordinacion previa.",
        `Salida privada hacia ${areaLabel} con chofer profesional.`,
        "Seguimiento operativo durante el trayecto y asistencia si cambia el vuelo.",
        "Entrega directa en lobby o punto autorizado del resort."
      ],
      facts: [
        { label: "Tipo de servicio", value: "Privado premium" },
        { label: "Cobertura", value: areaLabel },
        { label: "Disponibilidad", value: "24/7 con confirmacion" },
        { label: "Soporte", value: "WhatsApp + seguimiento de vuelo" }
      ],
      trust: [
        "Operacion pensada para viajeros que no quieren negociar al llegar.",
        "Vehiculos premium sujetos a disponibilidad real y coordinacion previa.",
        "Ideal para llegadas nocturnas, escapadas VIP y reservas de alto valor."
      ],
      faqs: [
        {
          q: `Este transfer premium cubre ${areaLabel}?`,
          a: `Si. Esta landing esta enfocada en reservas premium con cobertura para ${areaLabel} y coordinacion previa desde PUJ.`
        },
        {
          q: "Que diferencia hay con un traslado privado normal?",
          a: "La diferencia esta en la categoria del vehiculo, el tipo de atencion, la experiencia de llegada y la operacion mas controlada."
        },
        {
          q: "Puedo reservar ida y vuelta?",
          a: "Si. Puedes solicitar llegada, salida o servicio round trip desde el mismo flujo de reserva."
        }
      ]
    },
    en: {
      strapline: "A premium airport service built for travelers who want a smoother arrival, stronger comfort, and a more polished operation from the start.",
      themeLabels: {
        vip: "VIP route",
        luxury: "Luxury transfer",
        executive: "Executive chauffeur",
        family: "Family premium ride"
      },
      highlights: [
        "On-time pickup with live flight tracking.",
        "Premium SUV comfort, luggage room, and clean climate-controlled ride.",
        "Private airport-to-resort operation with less friction and more control."
      ],
      reasons: [
        "Stronger arrival experience than a standard transfer.",
        "Fast WhatsApp confirmation and direct operational support.",
        "Well suited for late arrivals, premium couples, and high-value bookings."
      ],
      route: [
        "Airport coordination before landing.",
        `Private departure from PUJ to ${areaLabel} with a professional driver.`,
        "Operational monitoring during the route in case flight timing changes.",
        "Direct drop-off at your resort lobby or approved entry point."
      ],
      facts: [
        { label: "Service type", value: "Private premium" },
        { label: "Coverage", value: areaLabel },
        { label: "Availability", value: "24/7 on request" },
        { label: "Support", value: "WhatsApp + flight tracking" }
      ],
      trust: [
        "Built for travelers who do not want to improvise after landing.",
        "Premium SUV assignment is managed against real availability.",
        "Strong fit for premium stays, family arrivals, and executive travel."
      ],
      faqs: [
        {
          q: `Does this premium transfer cover ${areaLabel}?`,
          a: `Yes. This route is tailored to premium arrivals with direct coverage for ${areaLabel} and pre-arrival coordination.`
        },
        {
          q: "What makes it different from a normal private transfer?",
          a: "The difference is vehicle category, arrival experience, attention level, and the overall control of the operation."
        },
        {
          q: "Can I book round trip service?",
          a: "Yes. You can request arrival, departure, or round-trip service from the same booking flow."
        }
      ]
    },
    fr: {
      strapline: "Un service aeroport premium pense pour les voyageurs qui veulent une arrivee plus fluide, plus confortable et mieux controlee.",
      themeLabels: {
        vip: "Route VIP",
        luxury: "Transfert luxe",
        executive: "Chauffeur executive",
        family: "Ride premium famille"
      },
      highlights: [
        "Prise en charge ponctuelle avec suivi de vol.",
        "SUV premium avec espace bagages et climatisation reelle.",
        "Operation privee aeroport-hotel plus fluide et mieux geree."
      ],
      reasons: [
        "Une arrivee plus forte qu un transfert standard.",
        "Confirmation rapide via WhatsApp et support operationnel.",
        "Tres adapte aux arrivees tardives, familles et sejours premium."
      ],
      route: [
        "Coordination avant l arrivee a PUJ.",
        `Depart prive vers ${areaLabel} avec chauffeur professionnel.`,
        "Suivi operationnel pendant le trajet si le vol change.",
        "Depose directe au lobby ou point autorise du resort."
      ],
      facts: [
        { label: "Type de service", value: "Prive premium" },
        { label: "Couverture", value: areaLabel },
        { label: "Disponibilite", value: "24/7 sur demande" },
        { label: "Support", value: "WhatsApp + suivi de vol" }
      ],
      trust: [
        "Concu pour eviter l improvisation apres l atterrissage.",
        "Affectation premium selon disponibilite reelle de flotte.",
        "Ideal pour sejours haut de gamme, familles et voyageurs business."
      ],
      faqs: [
        {
          q: `Ce transfert premium couvre-t-il ${areaLabel} ?`,
          a: `Oui. Cette landing est orientee vers les arrivees premium avec couverture directe pour ${areaLabel} et coordination avant l arrivee.`
        },
        {
          q: "Quelle difference avec un transfert prive classique ?",
          a: "La difference se voit dans la categorie du vehicule, l accueil, le niveau d attention et le controle de l operation."
        },
        {
          q: "Puis-je reserver aller-retour ?",
          a: "Oui. Vous pouvez demander arrivee, depart ou aller-retour depuis le meme parcours de reservation."
        }
      ]
    }
  }[locale];

  const intentOverrides: Record<string, Partial<VariantContext>> = {
    "family-luxury-transfer": {
      highlights:
        locale === "es"
          ? [
              "Espacio para equipaje grande, car seat bajo solicitud y operacion calmada.",
              "Ideal para llegadas con ninos, cochecitos o varios bultos.",
              "Menos friccion al aterrizar y mejor entrada al resort."
            ]
          : locale === "fr"
          ? [
              "Espace pour bagages, siege enfant sur demande et operation calme.",
              "Ideal pour les familles avec enfants, poussette ou plusieurs valises.",
              "Moins de friction a l arrivee et meilleure entree au resort."
            ]
          : [
              "Extra luggage room, child seat on request, and calmer arrival handling.",
              "Ideal for families traveling with kids, strollers, or multiple bags.",
              "Less friction after landing and a cleaner resort arrival."
            ]
    },
    "executive-transfer-service": {
      highlights:
        locale === "es"
          ? [
              "Enfoque ejecutivo para reuniones, huespedes premium y traslados de imagen.",
              "Coordinacion rapida, discreta y mas formal.",
              "Especial para clientes que no quieren una llegada improvisada."
            ]
          : locale === "fr"
          ? [
              "Approche executive pour reunions, invites premium et transferts d image.",
              "Coordination rapide, discrete et plus formelle.",
              "Ideal pour ceux qui ne veulent pas d arrivee improvisee."
            ]
          : [
              "Executive-focused arrival for meetings, premium guests, and polished transport.",
              "Fast, discreet, and more formal coordination.",
              "Best for travelers who do not want a casual arrival experience."
            ]
    }
  };

  const override = intentOverrides[intentId ?? ""] ?? {};

  return {
    intentId,
    areaId,
    areaLabel,
    themeLabel: base.themeLabels[themeKey as keyof typeof base.themeLabels] ?? base.themeLabels.vip,
    strapline: base.strapline,
    highlights: override.highlights ?? base.highlights,
    reasons: base.reasons,
    routeSteps: base.route,
    facts: base.facts,
    trust: base.trust,
    faqs: base.faqs
  };
};

export default async function PremiumTransferLandingPage({ locale, variant }: Props) {
  const content = normalizeTextDeep(await getPremiumTransferContentOverrides(locale));
  const context = getVariantContext(locale, variant);
  const theme = THEMES[getThemeKey(context.intentId)] ?? DEFAULT_THEME;
  const heroTitle = variant?.heroTitle[locale] ?? content.heroTitle;
  const heroSubtitle = variant?.heroSubtitle[locale] ?? content.heroSubtitle;
  const seoTitle = variant?.seoTitle[locale] ?? content.seoTitle;
  const seoDescription = variant?.seoDescription[locale] ?? content.seoDescription;
  const variantKeyword = variant?.keyword[locale];
  const variantBodyTitle = variant?.bodyTitle[locale];
  const variantBodyIntro = variant?.bodyIntro[locale];

  let origin:
    | {
        id: string;
        slug: string;
        name: string;
      }
    | null = null;
  let origins: Array<{ id: string; slug: string; name: string }> = [];
  let locationOptions: Array<{ id: string; slug: string; name: string }> = [];
  let destinations: Array<{ id: string; slug: string; name: string }> = [];

  try {
    origins = await prisma.transferLocation.findMany({
      where: {
        type: "AIRPORT",
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        active: true
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 20
    });

    const allHotelsAndAirports = await prisma.transferLocation.findMany({
      where: {
        active: true,
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        type: { in: ["HOTEL", "AIRPORT"] }
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 500
    });
    locationOptions = allHotelsAndAirports;

    origin = await prisma.transferLocation.findFirst({
      where: {
        type: "AIRPORT",
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        active: true,
        OR: [{ slug: { contains: "punta-cana" } }, { slug: { contains: "puj" } }]
      },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true }
    });
    if (!origin) origin = origins[0] ?? null;

    destinations = await prisma.transferLocation.findMany({
      where: {
        type: "HOTEL",
        countryCode: { in: DOMINICAN_COUNTRY_CODES },
        active: true,
        zone: { slug: { contains: "punta-cana" } }
      },
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
      take: 500
    });
    if (!destinations.length) {
      destinations = await prisma.transferLocation.findMany({
        where: {
          type: "HOTEL",
          countryCode: { in: DOMINICAN_COUNTRY_CODES },
          active: true
        },
        select: { id: true, slug: true, name: true },
        orderBy: { name: "asc" },
        take: 500
      });
    }
  } catch (error) {
    console.warn("premium-transfer: fallback mode without transfer locations", error);
  }

  const originFallback = {
    id: "",
    slug: "puj-airport",
    name: "Punta Cana International Airport (PUJ)"
  };
  const safeOrigin = origin ?? originFallback;
  const safeOrigins = origins.length ? origins : [safeOrigin];
  const safeLocationOptions = locationOptions.length ? locationOptions : [...safeOrigins, ...destinations];
  const canBook = safeLocationOptions.length > 1;

  const gallery = content.galleryImages ?? [];
  const bullets = content.vipBullets ?? [];
  const certifications = content.vipCertifications ?? [];

  const localizedBasePath =
    locale === "es" ? "/punta-cana/premium-transfer-services" : `/${locale}/punta-cana/premium-transfer-services`;
  const canonicalPath = variant ? `${localizedBasePath}/${variant.slug}` : localizedBasePath;
  const canonicalUrl = `${PROACTIVITIS_URL}${canonicalPath}`;
  const priceValidUntil = getPriceValidUntil();
  const homePath = locale === "es" ? "/" : `/${locale}`;
  const puntaCanaPath = locale === "es" ? "/punta-cana/traslado" : `/${locale}/punta-cana/traslado`;

  const relatedByArea = variant
    ? premiumTransferMarketLandings.filter(
        (item) => item.slug !== variant.slug && getVariantTokens(item).areaId === context.areaId
      ).slice(0, 6)
    : premiumTransferMarketLandings.slice(0, 12);

  const relatedByIntent = variant
    ? premiumTransferMarketLandings.filter(
        (item) => item.slug !== variant.slug && getVariantTokens(item).intentId === context.intentId
      ).slice(0, 4)
    : [];

  const primaryImageUrl = toAbsoluteImageUrl(content.heroBackgroundImage || content.heroSpotlightImage);
  const spotlightImageUrl = toAbsoluteImageUrl(content.heroSpotlightImage || content.lifestyleImage || content.heroBackgroundImage);
  const cadillacImageUrl = toAbsoluteImageUrl(content.cadillacImage);
  const suburbanImageUrl = toAbsoluteImageUrl(content.suburbanImage);
  const topHotels = destinations.slice(0, 8);

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${PROACTIVITIS_URL}#organization`,
        name: "Proactivitis",
        url: PROACTIVITIS_URL,
        logo: `${PROACTIVITIS_URL}/LOGO.png`,
        sameAs: SAME_AS_URLS
      },
      {
        ...PROACTIVITIS_LOCALBUSINESS,
        "@id": `${PROACTIVITIS_URL}#localbusiness`,
        parentOrganization: { "@id": `${PROACTIVITIS_URL}#organization` },
        areaServed: {
          "@type": "Place",
          name: "Punta Cana"
        }
      },
      {
        "@type": "WebSite",
        "@id": `${PROACTIVITIS_URL}#website`,
        name: "Proactivitis",
        url: PROACTIVITIS_URL,
        publisher: { "@id": `${PROACTIVITIS_URL}#organization` },
        inLanguage: locale
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        name: seoTitle,
        description: seoDescription,
        url: canonicalUrl,
        inLanguage: locale,
        isPartOf: { "@id": `${PROACTIVITIS_URL}#website` },
        about: { "@id": `${canonicalUrl}#service` },
        primaryImageOfPage: {
          "@id": `${canonicalUrl}#primaryimage`
        },
        breadcrumb: {
          "@id": `${canonicalUrl}#breadcrumb`
        }
      },
      {
        "@type": "ImageObject",
        "@id": `${canonicalUrl}#primaryimage`,
        contentUrl: primaryImageUrl,
        url: primaryImageUrl,
        caption: heroTitle,
        representativeOfPage: true
      },
      {
        "@type": "ImageObject",
        "@id": `${canonicalUrl}#spotlightimage`,
        contentUrl: spotlightImageUrl,
        url: spotlightImageUrl,
        caption: heroSubtitle
      },
      {
        "@type": "Place",
        "@id": `${canonicalUrl}#origin`,
        name: safeOrigin.name
      },
      {
        "@type": "Place",
        "@id": `${canonicalUrl}#destination-area`,
        name: context.areaLabel,
        containedInPlace: {
          "@type": "Place",
          name: "Punta Cana"
        }
      },
      {
        "@type": "Offer",
        "@id": `${canonicalUrl}#offer`,
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
        priceCurrency: "USD",
        priceValidUntil,
        category: "Premium airport transfer",
        eligibleRegion: {
          "@type": "Country",
          name: "Dominican Republic"
        },
        itemOffered: {
          "@id": `${canonicalUrl}#service`
        }
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        name: heroTitle,
        description: heroSubtitle,
        serviceType: "Luxury Airport Transfer",
        provider: { "@id": `${PROACTIVITIS_URL}#localbusiness` },
        availableLanguage: locale === "es" ? ["es", "en"] : locale === "fr" ? ["fr", "en", "es"] : ["en", "es"],
        termsOfService: canonicalUrl,
        hasOfferCatalog: {
          "@id": `${canonicalUrl}#fleet`
        },
        offers: {
          "@id": `${canonicalUrl}#offer`
        },
        serviceOutput: {
          "@type": "Thing",
          name: locale === "es" ? "Traslado premium confirmado" : locale === "fr" ? "Transfert premium confirme" : "Confirmed premium transfer"
        },
        serviceArea: {
          "@type": "Place",
          name: "Punta Cana"
        },
        areaServed: {
          "@id": `${canonicalUrl}#destination-area`
        },
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "https://schema.org/Monday",
            "https://schema.org/Tuesday",
            "https://schema.org/Wednesday",
            "https://schema.org/Thursday",
            "https://schema.org/Friday",
            "https://schema.org/Saturday",
            "https://schema.org/Sunday"
          ],
          opens: "00:00",
          closes: "23:59"
        },
        image: [
          primaryImageUrl,
          spotlightImageUrl,
          cadillacImageUrl,
          suburbanImageUrl
        ],
        isRelatedTo: topHotels.map((hotel) => ({
          "@type": "Place",
          name: hotel.name
        }))
      },
      {
        "@type": "OfferCatalog",
        "@id": `${canonicalUrl}#fleet`,
        name: locale === "es" ? "Flota premium disponible" : locale === "fr" ? "Flotte premium disponible" : "Available premium fleet",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Cadillac Escalade",
            itemOffered: {
              "@type": "Service",
              name: "Cadillac Escalade premium transfer"
            },
            image: cadillacImageUrl
          },
          {
            "@type": "Offer",
            name: "Chevrolet Suburban",
            itemOffered: {
              "@type": "Service",
              name: "Chevrolet Suburban premium transfer"
            },
            image: suburbanImageUrl
          }
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#coverage-list`,
        name: locale === "es" ? "Hoteles conectados" : locale === "fr" ? "Hotels connectes" : "Connected hotels",
        itemListElement: topHotels.map((hotel, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: hotel.name
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home",
            item: `${PROACTIVITIS_URL}${homePath}`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Punta Cana Transfers",
            item: `${PROACTIVITIS_URL}${puntaCanaPath}`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: heroTitle,
            item: canonicalUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: context.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a
          }
        }))
      }
    ]
  };

  return (
    <main className={`min-h-screen ${theme.shell}`}>
      <StructuredData data={graphSchema} />

      <section className={`relative overflow-hidden border-b ${theme.border}`}>
        <div className="absolute inset-0">
          <Image
            src={content.heroBackgroundImage || "/transfer/suv.png"}
            alt={heroTitle || "Premium transfer"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.heroGlow}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),linear-gradient(135deg,rgba(2,6,23,0.9),rgba(2,6,23,0.72),rgba(2,6,23,0.92))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-[1.2fr,0.8fr] md:py-20">
          <div className="space-y-6">
            <div className={`inline-flex rounded-full border px-4 py-1 text-[11px] font-bold uppercase tracking-[0.32em] ${theme.pill}`}>
              {variant ? context.themeLabel : content.heroBadge}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] text-white md:text-6xl">{heroTitle}</h1>
              <p className={`max-w-3xl text-lg leading-relaxed ${theme.accentSoft} md:text-xl`}>{heroSubtitle}</p>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">{context.strapline}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#vip-booking"
                className={`rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.28em] transition ${theme.button} ${theme.buttonText}`}
              >
                {content.ctaPrimaryLabel}
              </a>
              <Link
                href={WHATSAPP_LINK}
                className="rounded-full border border-amber-200/70 bg-slate-950/35 px-6 py-3 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition hover:bg-amber-200/10"
              >
                {content.ctaSecondaryLabel}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {context.facts.map((fact) => (
                <div key={fact.label} className={`rounded-3xl border px-4 py-4 backdrop-blur ${theme.panelSoft}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${theme.accent}`}>{fact.label}</p>
                  <p className="mt-2 text-sm font-medium text-white">{fact.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-[32px] border shadow-[0_40px_100px_rgba(0,0,0,0.4)] ${theme.panel}`}>
            <div className="relative h-[280px] md:h-full md:min-h-[520px]">
              <Image
                src={content.heroSpotlightImage || content.lifestyleImage || "/transfer/sedan.png"}
                alt={heroTitle || "Premium transfer experience"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className={`rounded-3xl border p-4 backdrop-blur ${theme.panelSoft}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${theme.accent}`}>
                    {locale === "es" ? "Keyword comercial" : locale === "fr" ? "Keyword commerciale" : "Commercial keyword"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{variantKeyword ?? seoTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <nav className={`grid gap-3 rounded-[28px] border p-4 md:grid-cols-4 ${theme.panel}`}>
          {[
            { id: "vip-booking", label: locale === "es" ? "Cotizacion" : locale === "fr" ? "Reservation" : "Booking" },
            { id: "experience", label: locale === "es" ? "Experiencia" : locale === "fr" ? "Experience" : "Experience" },
            { id: "coverage", label: locale === "es" ? "Cobertura" : locale === "fr" ? "Couverture" : "Coverage" },
            { id: "faq", label: "FAQ" }
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`rounded-2xl border px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 ${theme.panelSoft}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </section>

      <section id="vip-booking" className="mx-auto max-w-7xl px-4 pb-10">
        {canBook ? (
          <PremiumTransferBookingWidget
            locale={locale}
            origins={safeOrigins}
            destinations={destinations.length ? destinations : safeLocationOptions}
            title={content.bookingTitle || "Book your premium transfer"}
            cadillacImage={content.cadillacImage}
            suburbanImage={content.suburbanImage}
            preferredDestinationHint={context.areaId ?? ""}
          />
        ) : (
          <div className={`rounded-3xl border p-6 text-sm ${theme.panel}`}>
            {locale === "es"
              ? "No hay destinos premium disponibles en este momento. Escribenos por WhatsApp para cotizacion inmediata."
              : locale === "fr"
              ? "Aucune destination premium disponible pour le moment. Ecrivez-nous sur WhatsApp pour un devis immediat."
              : "No premium destinations available right now. Message us on WhatsApp for an instant quote."}
          </div>
        )}
      </section>

      <section id="experience" className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[1.1fr,0.9fr]">
        <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.accent}`}>
            {locale === "es" ? "Por que esta landing vende" : locale === "fr" ? "Pourquoi cette route convertit" : "Why this route converts"}
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            {variantBodyTitle ??
              (locale === "es"
                ? `Premium transfer real para ${context.areaLabel}`
                : locale === "fr"
                ? `Transfert premium reel pour ${context.areaLabel}`
                : `Real premium transfer for ${context.areaLabel}`)}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            {variantBodyIntro ??
              (locale === "es"
                ? `Esta landing esta construida para viajeros que buscan ${variantKeyword ?? "un transfer premium"} con enfoque en puntualidad, imagen, privacidad y cobertura real hacia ${context.areaLabel}.`
                : locale === "fr"
                ? `Cette landing vise les voyageurs qui cherchent ${variantKeyword ?? "un transfert premium"} avec ponctualite, image, intimite et vraie couverture vers ${context.areaLabel}.`
                : `This landing is built for travelers searching for ${variantKeyword ?? "a premium transfer"} with stronger punctuality, privacy, image, and real coverage into ${context.areaLabel}.`)}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {context.highlights.map((item) => (
              <div key={item} className={`rounded-3xl border p-4 text-sm leading-6 ${theme.panelSoft}`}>
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.accent}`}>
            {locale === "es" ? "Ruta operativa" : locale === "fr" ? "Itineraire operationnel" : "Operational route"}
          </p>
          <div className="mt-4 space-y-3">
            {context.routeSteps.map((step, index) => (
              <div key={step} className={`rounded-3xl border p-4 ${theme.panelSoft}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${theme.accent}`}>0{index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-white">{step}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 md:grid-cols-2">
        <article className={`overflow-hidden rounded-[32px] border ${theme.panel}`}>
          <div className="relative h-64">
            <Image src={content.cadillacImage || "/transfer/suv.png"} alt="Cadillac Escalade" fill className="object-cover" />
          </div>
          <div className="p-6">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${theme.accent}`}>Cadillac Escalade</p>
            <h3 className="mt-3 text-2xl font-black text-white">
              {locale === "es" ? "Imagen premium para llegadas de alto nivel" : locale === "fr" ? "Image premium pour arrivees haut niveau" : "Premium image for high-value arrivals"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {locale === "es"
                ? "Pensado para viajeros que valoran presencia, espacio y una llegada mas cuidada al hotel."
                : locale === "fr"
                ? "Pense pour les voyageurs qui valorisent presence, espace et une arrivee plus soignee."
                : "Built for travelers who value presence, room, and a more polished hotel arrival."}
            </p>
          </div>
        </article>

        <article className={`overflow-hidden rounded-[32px] border ${theme.panel}`}>
          <div className="relative h-64">
            <Image src={content.suburbanImage || "/transfer/suv.png"} alt="Chevrolet Suburban" fill className="object-cover" />
          </div>
          <div className="p-6">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${theme.accent}`}>Chevrolet Suburban</p>
            <h3 className="mt-3 text-2xl font-black text-white">
              {locale === "es" ? "Capacidad premium para equipaje, grupos y familias" : locale === "fr" ? "Capacite premium pour bagages, groupes et familles" : "Premium capacity for luggage, groups, and families"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {locale === "es"
                ? "Una de las opciones mas utiles cuando el confort necesita tambien capacidad real de carga."
                : locale === "fr"
                ? "L une des options les plus utiles quand le confort demande aussi une vraie capacite."
                : "One of the strongest fits when comfort also needs real luggage capacity."}
            </p>
          </div>
        </article>
      </section>

      <section id="coverage" className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[0.95fr,1.05fr]">
        <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.accent}`}>
            {locale === "es" ? "Senales de confianza" : locale === "fr" ? "Signaux de confiance" : "Trust signals"}
          </p>
          <div className="mt-4 space-y-3">
            {context.reasons.concat(context.trust).map((item) => (
              <div key={item} className={`rounded-3xl border p-4 text-sm leading-6 ${theme.panelSoft}`}>
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${theme.accent}`}>
            {locale === "es" ? "Hoteles conectados" : locale === "fr" ? "Hotels connectes" : "Connected hotels"}
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            {locale === "es"
              ? `Cobertura hotelera premium en ${context.areaLabel}`
              : locale === "fr"
              ? `Couverture hoteliere premium a ${context.areaLabel}`
              : `Premium hotel coverage in ${context.areaLabel}`}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/90">
            {locale === "es"
              ? "Estas conexiones ayudan a que cada variante responda a una intencion concreta sin perder la capacidad real de cotizacion."
              : locale === "fr"
              ? "Ces connexions permettent a chaque variante de repondre a une intention precise sans perdre la capacite reelle de devis."
              : "These connected routes help each variant match a specific search intent without losing real quoting capability."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(variant ? destinations.slice(0, 16) : destinations.slice(0, 12)).map((hotel) => (
              <Link
                key={hotel.id}
                href={locale === "es" ? `/transfer/${safeOrigin.slug}-to-${hotel.slug}` : `/${locale}/transfer/${safeOrigin.slug}-to-${hotel.slug}`}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 ${theme.panelSoft}`}
              >
                {hotel.name}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[1.05fr,0.95fr]">
        <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.accent}`}>
            {locale === "es" ? "Cobertura visual" : locale === "fr" ? "Galerie" : "Visual coverage"}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.slice(0, 4).map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-32 overflow-hidden rounded-2xl">
                <Image src={image} alt={`${heroTitle} ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
          {bullets.length > 0 ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {bullets.slice(0, 4).map((bullet) => (
                <div key={bullet} className={`rounded-2xl border p-4 text-sm leading-6 ${theme.panelSoft}`}>
                  {bullet}
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${theme.accent}`}>
            {locale === "es" ? "Variantes relacionadas" : locale === "fr" ? "Variantes liees" : "Related variants"}
          </p>
          <div className="mt-4 space-y-5">
            <div>
              <h3 className="text-lg font-black text-white">
                {variant
                  ? locale === "es"
                    ? `Mas rutas premium para ${context.areaLabel}`
                    : locale === "fr"
                    ? `Plus de routes premium pour ${context.areaLabel}`
                    : `More premium routes for ${context.areaLabel}`
                  : locale === "es"
                  ? "Rutas premium destacadas"
                  : locale === "fr"
                  ? "Routes premium en vedette"
                  : "Featured premium routes"}
              </h3>
              <div className="mt-3 grid gap-3">
                {relatedByArea.map((item) => (
                  <Link
                    key={item.slug}
                    href={locale === "es" ? `/punta-cana/premium-transfer-services/${item.slug}` : `/${locale}/punta-cana/premium-transfer-services/${item.slug}`}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 ${theme.panelSoft}`}
                  >
                    {item.keyword[locale]}
                  </Link>
                ))}
              </div>
            </div>

            {relatedByIntent.length > 0 ? (
              <div>
                <h3 className="text-lg font-black text-white">
                  {locale === "es" ? "La misma intencion en otras zonas" : locale === "fr" ? "La meme intention dans d autres zones" : "The same intent in other areas"}
                </h3>
                <div className="mt-3 grid gap-3">
                  {relatedByIntent.map((item) => (
                    <Link
                      key={item.slug}
                      href={locale === "es" ? `/punta-cana/premium-transfer-services/${item.slug}` : `/${locale}/punta-cana/premium-transfer-services/${item.slug}`}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 ${theme.panelSoft}`}
                    >
                      {item.keyword[locale]}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </section>

      {certifications.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-10">
          <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.accent}`}>
              {locale === "es" ? "Capas de confianza" : locale === "fr" ? "Couches de confiance" : "Confidence layers"}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {certifications.map((item) => (
                <div key={item} className={`rounded-2xl border p-4 text-sm leading-6 ${theme.panelSoft}`}>
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      <section id="faq" className="mx-auto max-w-7xl px-4 pb-20">
        <article className={`rounded-[32px] border p-6 md:p-7 ${theme.panel}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.accent}`}>FAQ</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {context.faqs.map((item) => (
              <div key={item.q} className={`rounded-2xl border p-4 ${theme.panelSoft}`}>
                <h3 className="text-sm font-bold text-white">{item.q}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-200">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
