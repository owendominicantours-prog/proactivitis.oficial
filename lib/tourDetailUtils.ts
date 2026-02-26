import type { Metadata } from "next";
import type { Locale } from "@/lib/translations";
import { translate } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { ensureLeadingCapital } from "@/lib/text-format";

const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";

type TourImageSource = { heroImage?: string | null; gallery?: string | null };

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as unknown as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveTourHeroImage = (tour: TourImageSource) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;
const BRAND_SUFFIX = " | Proactivitis";
const PUNTA_CANA_MARKERS = [
  "punta cana",
  "punta-cana",
  "bavaro",
  "cap cana",
  "cap-cana",
  "uvero alto",
  "uvero-alto",
  "macao",
  "cabeza de toro",
  "cabeza-de-toro"
];
const PUNTA_CANA_KEYWORDS: Record<Locale, string[]> = {
  es: [
    "tours punta cana",
    "excursiones punta cana",
    "actividades punta cana",
    "tours con recogida en hotel",
    "excursiones con traslado",
    "tours privados punta cana"
  ],
  en: [
    "punta cana tours",
    "punta cana excursions",
    "things to do punta cana",
    "tours with hotel pickup",
    "private tours punta cana",
    "punta cana activities"
  ],
  fr: [
    "excursions punta cana",
    "activites punta cana",
    "tours a punta cana",
    "prise en charge hotel punta cana",
    "excursions privees punta cana",
    "choses a faire punta cana"
  ]
};
const TOUR_KEYWORDS_BY_SLUG: Record<string, Partial<Record<Locale, string[]>>> = {
  "party-boat-sosua": {
    es: [
      "sosua party boat",
      "party boat sosua",
      "sosua party boat precios",
      "party boat sosua prices",
      "boat party puerto plata",
      "puerto plata party boat",
      "luxury yacht rental sosua",
      "sosua catamaran",
      "private party boat sosua"
    ],
    en: [
      "sosua party boat",
      "party boat sosua prices",
      "best party boat in sosua",
      "puerto plata boat party",
      "puerto plata party boat",
      "sosua private catamaran",
      "sosua yacht rental",
      "private yacht sosua"
    ],
    fr: [
      "party boat sosua",
      "prix party boat sosua",
      "catamaran sosua",
      "bateau prive sosua",
      "sortie bateau puerto plata",
      "soiree bateau sosua",
      "location yacht sosua"
    ]
  },
  "sunset-catamaran-snorkel": {
    es: ["party boat punta cana", "catamaran punta cana", "snorkel punta cana", "tour en catamaran punta cana"],
    en: ["punta cana party boat", "catamaran punta cana", "snorkeling party boat", "sunset catamaran punta cana"],
    fr: ["party boat punta cana", "catamaran punta cana", "snorkeling punta cana", "croisiere catamaran punta cana"]
  },
  "tour-en-buggy-en-punta-cana": {
    es: ["tour buggy punta cana", "buggy punta cana", "excursion buggy punta cana", "aventura buggy punta cana"],
    en: ["buggy tour punta cana", "punta cana buggy adventure", "off road tour punta cana", "atv buggy punta cana"],
    fr: ["tour buggy punta cana", "excursion buggy punta cana", "aventure buggy punta cana", "atv punta cana"]
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: ["buggy y atv punta cana", "excursion atv punta cana", "tour 4x4 punta cana"],
    en: ["buggy and atv punta cana", "atv excursion punta cana", "4x4 tour punta cana"],
    fr: ["buggy et atv punta cana", "excursion atv punta cana", "tour 4x4 punta cana"]
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: ["isla saona desde punta cana", "tour saona punta cana", "excursion isla saona"],
    en: ["saona island from punta cana", "saona island tour", "saona excursion punta cana"],
    fr: ["ile saona depuis punta cana", "excursion ile saona", "tour saona punta cana"]
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: ["isla saona desde bayahibe", "isla saona la romana", "tour saona bayahibe"],
    en: ["saona island from bayahibe", "saona tour la romana", "saona island day trip bayahibe"],
    fr: ["ile saona depuis bayahibe", "tour saona la romana", "excursion ile saona bayahibe"]
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: ["avistamiento de ballenas samana", "samana desde punta cana", "cayo levantado tour"],
    en: ["samana whale watching from punta cana", "samana day trip", "cayo levantado excursion"],
    fr: ["observation baleines samana", "samana depuis punta cana", "cayo levantado excursion"]
  },
  "cayo-levantado-luxury-beach-day": {
    es: ["samana cayo levantado desde punta cana", "samana day trip punta cana", "el limon y cayo levantado"],
    en: ["samana day trip from punta cana", "cayo levantado tour", "el limon waterfall tour"],
    fr: ["samana depuis punta cana", "cayo levantado tour", "cascade el limon excursion"]
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: ["santo domingo desde punta cana", "excursion santo domingo", "zona colonial tour"],
    en: ["santo domingo day trip from punta cana", "santo domingo tour", "colonial zone tour"],
    fr: ["saint domingue depuis punta cana", "excursion saint domingue", "zone coloniale tour"]
  },
  "parasailing-punta-cana": {
    es: ["parasailing punta cana", "paravelismo punta cana", "parasail en punta cana"],
    en: ["parasailing punta cana", "parasail punta cana", "punta cana parasailing tour"],
    fr: ["parasailing punta cana", "parachute ascensionnel punta cana", "tour parasailing punta cana"]
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: ["buggy bayahibe", "atv la romana", "tour 4x4 bayahibe"],
    en: ["half day atv from bayahibe", "buggy la romana", "4x4 bayahibe tour"],
    fr: ["atv bayahibe", "buggy la romana", "tour 4x4 bayahibe"]
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: ["safari cultural punta cana", "tour cultural republica dominicana", "campo dominicano tour"],
    en: ["dominican cultural safari", "cultural tour from punta cana", "dominican countryside tour"],
    fr: ["safari culturel depuis punta cana", "tour culturel republique dominicaine", "campagne dominicaine tour"]
  },
  "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua": {
    es: ["barco privado sosua", "party boat privado puerto plata", "yate privado sosua"],
    en: ["private party boat sosua", "private boat puerto plata", "sosua private yacht charter"],
    fr: ["bateau prive sosua", "party boat prive puerto plata", "yacht prive sosua"]
  }
};
const META_TITLE_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "transfer-privado-proactivitis": {
    es: "Traslado privado en Punta Cana con chofer verificado",
    en: "Private transfer in Punta Cana with verified driver",
    fr: "Transfert prive a Punta Cana avec chauffeur verifie"
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: "Avistamiento de ballenas en Samana desde Punta Cana",
    en: "Samana whale watching tour from Punta Cana",
    fr: "Observation des baleines a Samana depuis Punta Cana"
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: "Isla Saona desde Punta Cana: tour + entrada",
    en: "Saona Island from Punta Cana: tour + ticket",
    fr: "Ile Saona depuis Punta Cana : tour + billet"
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: "ATV o buggy 4x4 desde Bayahibe y La Romana",
    en: "Half-day ATV or buggy 4x4 from Bayahibe",
    fr: "Demi-journee ATV ou buggy 4x4 depuis Bayahibe"
  },
  "tour-en-buggy-en-punta-cana": {
    es: "Tour en buggy en Punta Cana: aventura off-road",
    en: "Punta Cana buggy tour: off-road adventure",
    fr: "Tour en buggy a Punta Cana : aventure off-road"
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: "Safari cultural en Republica Dominicana desde Punta Cana",
    en: "Dominican cultural safari from Punta Cana",
    fr: "Safari culturel en Republique dominicaine depuis Punta Cana"
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: "Excursion en buggy y ATV en Punta Cana",
    en: "Punta Cana buggy & ATV excursion",
    fr: "Excursion buggy et ATV a Punta Cana"
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: "Isla Saona desde Bayahibe y La Romana",
    en: "Saona Island day trip from Bayahibe",
    fr: "Ile Saona depuis Bayahibe et La Romana"
  },
  "sunset-catamaran-snorkel": {
    es: "Party boat en Punta Cana: catamaran con snorkel",
    en: "Punta Cana party boat: catamaran + snorkel",
    fr: "Party boat a Punta Cana : catamaran + snorkel"
  },
  "parasailing-punta-cana": {
    es: "Parasailing en Punta Cana: vistas aereas del Caribe",
    en: "Punta Cana parasailing: Caribbean aerial views",
    fr: "Parasailing a Punta Cana : vues aeriennes"
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: "Excursion de un dia a Santo Domingo desde Punta Cana",
    en: "Santo Domingo day trip from Punta Cana",
    fr: "Excursion d'une journee a Saint-Domingue depuis Punta Cana"
  },
  "cayo-levantado-luxury-beach-day": {
    es: "Samana y Cayo Levantado desde Punta Cana",
    en: "Samana day trip + Cayo Levantado from Punta Cana",
    fr: "Samana et Cayo Levantado depuis Punta Cana"
  },
  "party-boat-sosua": {
    es: "Sosua Party Boat: precios, privado y VIP",
    en: "Sosua Party Boat: prices, private and VIP",
    fr: "Sosua Party Boat: prix, prive et VIP"
  },
  "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua": {
    es: "Barco privado en Sosua desde Puerto Plata",
    en: "Private party boat in Sosua from Puerto Plata",
    fr: "Bateau prive a Sosua depuis Puerto Plata"
  }
};
const META_DESCRIPTION_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "transfer-privado-proactivitis": {
    es: "Traslado privado en Punta Cana con choferes verificados, precios claros y confirmacion rapida. Reserva ida o ida y vuelta.",
    en: "Private Punta Cana transfer with verified drivers, clear pricing and fast confirmation. Book one-way or round trip.",
    fr: "Transfert prive a Punta Cana avec chauffeurs verifies, prix clairs et confirmation rapide. Aller simple ou aller-retour."
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: "Vive Samana en dia completo: avistamiento de ballenas, Cascada El Limon y Cayo Levantado, con almuerzo y traslados desde Punta Cana.",
    en: "Full-day Samana experience with whale watching, El Limon Waterfall and Cayo Levantado, including lunch and Punta Cana transfers.",
    fr: "Journee complete a Samana avec observation des baleines, cascade El Limon et Cayo Levantado, dejeuner et transferts inclus."
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: "Escapada a Isla Saona desde Punta Cana con entradas incluidas, transporte y tiempo real de playa. Recogida en hotel y reserva inmediata.",
    en: "Saona Island getaway from Punta Cana with included tickets, transport and real beach time. Hotel pickup and instant booking.",
    fr: "Escapade a l ile Saona depuis Punta Cana avec billets inclus, transport et vrai temps de plage. Pickup hotel et reservation rapide."
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: "Aventura 4x4 en ATV o buggy desde Bayahibe/La Romana con rutas off-road y paradas locales. Reserva en minutos.",
    en: "4x4 ATV or buggy adventure from Bayahibe/La Romana with off-road routes and local stops. Book in minutes.",
    fr: "Aventure en ATV/buggy 4x4 depuis Bayahibe/La Romana avec pistes off-road et arrets locaux. Reservez en minutes."
  },
  "tour-en-buggy-en-punta-cana": {
    es: "Ruta en buggy por Punta Cana con barro, caminos off-road y paradas locales. Ideal para quien quiere aventura real, sin perder comodidad.",
    en: "Punta Cana buggy route with mud, off-road tracks and local stops. Built for travelers who want real adventure with easy logistics.",
    fr: "Parcours buggy a Punta Cana avec boue, pistes off-road et arrets locaux. Parfait pour une vraie aventure, avec logistique simple."
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: "Conoce el interior dominicano con un safari cultural desde Punta Cana: pueblos, tradiciones, degustaciones y guia local durante todo el recorrido.",
    en: "Explore the Dominican countryside from Punta Cana with a cultural safari: villages, traditions, tastings and local guidance all day.",
    fr: "Decouvrez la campagne dominicaine depuis Punta Cana avec un safari culturel: villages, traditions, degustations et guide local."
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: "Elige buggy o ATV y recorre Punta Cana por rutas de tierra con paradas locales. Una salida intensa para grupos, parejas o amigos.",
    en: "Choose buggy or ATV and explore Punta Cana on dirt routes with local stops. A high-energy experience for groups, couples and friends.",
    fr: "Choisissez buggy ou ATV et parcourez Punta Cana sur pistes de terre avec arrets locaux. Experience dynamique pour groupes et couples."
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: "Isla Saona desde Bayahibe o La Romana con catamaran, playa y almuerzo frente al mar. Confirmacion rapida y operacion diaria.",
    en: "Saona Island from Bayahibe or La Romana with catamaran, beach time and seafront lunch. Fast confirmation and daily operation.",
    fr: "Ile Saona depuis Bayahibe ou La Romana avec catamaran, plage et dejeuner en bord de mer. Confirmation rapide."
  },
  "sunset-catamaran-snorkel": {
    es: "Catamaran al atardecer en Punta Cana con snorkel, open bar y ambiente de fiesta. Perfecto para celebrar sin complicaciones.",
    en: "Sunset catamaran in Punta Cana with snorkel, open bar and a party vibe. Perfect for celebrations with zero hassle.",
    fr: "Catamaran au coucher du soleil a Punta Cana avec snorkel, open bar et ambiance festive. Ideal pour celebrer facilement."
  },
  "parasailing-punta-cana": {
    es: "Parasailing en Punta Cana con vistas abiertas del Caribe y protocolos de seguridad claros. Una actividad corta, intensa y muy fotografiable.",
    en: "Parasailing in Punta Cana with open Caribbean views and clear safety protocols. Short, thrilling and highly photogenic.",
    fr: "Parasailing a Punta Cana avec vues ouvertes sur les Caraibes et protocoles de securite clairs. Court, intense et memorable."
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: "Recorre Santo Domingo desde Punta Cana en una jornada completa: Zona Colonial, historia viva y visitas guiadas a los puntos mas iconicos.",
    en: "Visit Santo Domingo from Punta Cana in one full day: Colonial Zone, living history and guided stops at the citys key landmarks.",
    fr: "Decouvrez Saint-Domingue depuis Punta Cana en journee complete: Zone Coloniale, histoire vivante et visites guidees des lieux iconiques."
  },
  "cayo-levantado-luxury-beach-day": {
    es: "Dia premium en Samana y Cayo Levantado desde Punta Cana, con parada en Cascada El Limon, tiempo de playa y almuerzo incluido.",
    en: "Premium day trip to Samana and Cayo Levantado from Punta Cana, with El Limon Waterfall, beach time and included lunch.",
    fr: "Journee premium a Samana et Cayo Levantado depuis Punta Cana, avec cascade El Limon, plage et dejeuner inclus."
  },
  "party-boat-sosua": {
    es: "Fiesta en barco en Sosua desde USD 65 con open bar, snorkel y recogida en Puerto Plata. Disponible en formato compartido, privado o VIP.",
    en: "Sosua party boat from USD 65 with open bar, snorkel and Puerto Plata pickup. Available as shared, private or VIP experience.",
    fr: "Party boat a Sosua des USD 65 avec open bar, snorkel et pickup Puerto Plata. Disponible en version partagee, privee ou VIP."
  },
  "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua": {
    es: "Barco privado para fiestas en Sosua con todo incluido, open bar y snorkel. Salida desde Puerto Plata.",
    en: "Private party boat in Sosua with all inclusive service, open bar and snorkel. Departure from Puerto Plata.",
    fr: "Bateau prive pour fete a Sosua avec tout inclus, open bar et snorkel. Depart depuis Puerto Plata."
  }
};

const buildSeoTitle = (baseTitle: string) => {
  const trimmed = ensureLeadingCapital(baseTitle.trim());
  if (!trimmed) return `Proactivitis`;
  if (trimmed.length + BRAND_SUFFIX.length <= MAX_TITLE_LENGTH) {
    return `${trimmed}${BRAND_SUFFIX}`;
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `${trimmed.slice(0, MAX_TITLE_LENGTH - 3).trimEnd()}...`;
  }
  const available = MAX_TITLE_LENGTH - BRAND_SUFFIX.length - 3;
  if (available <= 0) {
    return `${trimmed.slice(0, MAX_TITLE_LENGTH - 3).trimEnd()}...`;
  }
  return `${trimmed.slice(0, available).trimEnd()}...${BRAND_SUFFIX}`;
};

const trimDescription = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length <= MAX_DESCRIPTION_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_DESCRIPTION_LENGTH - 3).trimEnd()}...`;
};

const toAbsoluteUrl = (value: string) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_TOUR_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${PROACTIVITIS_URL}${normalized}`;
};

const dedupeKeywords = (items: string[]) =>
  Array.from(
    new Set(
      items
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  );

const buildTourKeywords = ({
  slug,
  title,
  destination,
  departure,
  locale
}: {
  slug: string;
  title: string;
  destination?: string | null;
  departure?: string | null;
  locale: Locale;
}) => {
  const explicitKeywords = TOUR_KEYWORDS_BY_SLUG[slug]?.[locale] ?? [];
  const baseTokens =
    locale === "es"
      ? ["tour", "excursion", "actividades"]
      : locale === "fr"
        ? ["excursion", "activites", "tour"]
        : ["tour", "excursion", "activities"];
  const place = (destination || departure || "").trim();
  const titleClean = title.toLowerCase();
  const generated = [
    titleClean,
    ...baseTokens.map((token) => (place ? `${token} ${place.toLowerCase()}` : token)),
    place ? `${place.toLowerCase()} tours` : ""
  ];
  return dedupeKeywords([...explicitKeywords, ...generated]).slice(0, 12);
};

const buildLanguageAlternates = (slug: string) => {
  const normalizedSlug = slug.startsWith("/") ? slug : `/tours/${slug}`;
  return {
    es: `/tours/${slug}`,
    en: `/en/tours/${slug}`,
    fr: `/fr/tours/${slug}`
  };
};

export async function generateTourMetadata(
  { params }: { params: Promise<{ slug?: string }> },
  locale: Locale
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) {
    return {
      title: translate(locale, "tour.metadata.titleFallback"),
      description: translate(locale, "tour.metadata.descriptionFallback")
    };
  }

  if (slug === HIDDEN_TRANSFER_SLUG) {
    return {
      title: translate(locale, "tour.metadata.unavailableTitle")
    };
  }

  const tour = await prisma.tour.findFirst({
    where: { slug },
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      heroImage: true,
      gallery: true,
      country: { select: { name: true, slug: true } },
      destination: { select: { name: true, slug: true } },
      departureDestination: { select: { name: true, slug: true } },
      translations: {
        where: { locale },
        select: {
          title: true,
          shortDescription: true,
          description: true
        }
      }
    }
  });

  if (!tour) {
    return {
      title: translate(locale, "tour.metadata.titleFallback"),
      description: translate(locale, "tour.metadata.descriptionFallback")
    };
  }

  const translation = tour.translations?.[0];
  const resolvedTitle = META_TITLE_OVERRIDES[slug]?.[locale] ?? translation?.title ?? tour.title;
  const resolvedDescription =
    META_DESCRIPTION_OVERRIDES[slug]?.[locale] ??
    translation?.shortDescription ??
    translation?.description ??
    tour.shortDescription ??
    translate(locale, "tour.metadata.descriptionFallback");
  const haystack = [
    tour.title,
    translation?.title,
    tour.destination?.name,
    tour.destination?.slug,
    tour.departureDestination?.name,
    tour.departureDestination?.slug
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isPuntaCanaTour = PUNTA_CANA_MARKERS.some((marker) => haystack.includes(marker));
  const keywordSource = buildTourKeywords({
    slug,
    title: resolvedTitle,
    destination: tour.destination?.name,
    departure: tour.departureDestination?.name,
    locale
  });
  const keywords = dedupeKeywords([
    ...keywordSource,
    ...(isPuntaCanaTour ? PUNTA_CANA_KEYWORDS[locale] : [])
  ]);
  const title = buildSeoTitle(resolvedTitle);
  const description = trimDescription(resolvedDescription);
  const heroImage = toAbsoluteUrl(resolveTourHeroImage(tour));
  const galleryImages = parseGallery(tour.gallery)
    .map((image) => toAbsoluteUrl(image))
    .filter((image) => image && image !== heroImage);
  const ogImages = [heroImage, ...galleryImages].slice(0, 5);
  const heroImageType = heroImage.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const canonicalSlug = buildLanguageAlternates(slug)[locale];
  const canonicalUrl = `${PROACTIVITIS_URL}${canonicalSlug}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: buildLanguageAlternates(slug).es,
        en: buildLanguageAlternates(slug).en,
        fr: buildLanguageAlternates(slug).fr,
        "x-default": buildLanguageAlternates(slug).es
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: ogImages.map((url, index) => ({
        url,
        width: 1200,
        height: 630,
        type: index === 0 ? heroImageType : undefined,
        alt: title
      })),
      siteName: "Proactivitis",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage]
    }
  };
}
