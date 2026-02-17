import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import { prisma } from "@/lib/prisma";
import { formatReviewCountValue } from "@/lib/reviewCounts";
import { buildReviewBreakdown, getApprovedTourReviews, getTourReviewSummary } from "@/lib/tourReviews";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";
import StructuredData from "@/components/schema/StructuredData";
import { PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL, SAME_AS_URLS, getPriceValidUntil } from "@/lib/seo";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { Prisma } from "@prisma/client";
import GalleryLightbox from "@/components/shared/GalleryLightbox";
import TourGalleryCollage from "@/components/tours/TourGalleryCollage";
import TourReviewForm from "@/components/public/TourReviewForm";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import { translateText } from "@/lib/translationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";

type TourFaqItem = { question: string; answer: string };

const PUNTA_CANA_TOP_TOURS = new Set([
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana",
  "cayo-levantado-luxury-beach-day",
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana",
  "excursion-en-buggy-y-atv-en-punta-cana",
  "parasailing-punta-cana",
  "sunset-catamaran-snorkel",
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana",
  "tour-en-buggy-en-punta-cana",
  "tour-isla-saona-desde-bayhibe-la-romana",
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana",
  "transfer-privado-proactivitis"
]);

const NORTH_COAST_PARTY_BOAT_TOURS = new Set([
  "party-boat-sosua",
  "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua"
]);

const TOUR_H1_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "tour-en-buggy-en-punta-cana": {
    es: "Tour en buggy en Punta Cana: barro, cueva y aventura",
    en: "Punta Cana buggy tour: mud, cave and adventure",
    fr: "Tour en buggy a Punta Cana : boue, grotte et aventure"
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: "Buggy y ATV en Punta Cana: off-road y cenote",
    en: "Buggy and ATV in Punta Cana: off-road and cenote",
    fr: "Buggy et ATV a Punta Cana : off-road et cenote"
  },
  "transfer-privado-proactivitis": {
    es: "Traslado privado en Punta Cana con chofer verificado",
    en: "Private transfer in Punta Cana with verified driver",
    fr: "Transfert prive a Punta Cana avec chauffeur verifie"
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: "Isla Saona desde Bayahibe: playa y catamaran",
    en: "Saona Island from Bayahibe: beach and catamaran",
    fr: "Ile Saona depuis Bayahibe : plage et catamaran"
  },
  "cayo-levantado-luxury-beach-day": {
    es: "Samana y Cayo Levantado desde Punta Cana",
    en: "Samana and Cayo Levantado from Punta Cana",
    fr: "Samana et Cayo Levantado depuis Punta Cana"
  },
  "sunset-catamaran-snorkel": {
    es: "Party boat en Punta Cana con snorkel y open bar",
    en: "Punta Cana party boat with snorkel and open bar",
    fr: "Party boat a Punta Cana avec snorkel et open bar"
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: "Ballenas en Samana + Cayo Levantado desde Punta Cana",
    en: "Whale watching in Samana + Cayo Levantado",
    fr: "Observation des baleines a Samana + Cayo Levantado"
  },
  "parasailing-punta-cana": {
    es: "Parasailing en Punta Cana: vistas del Caribe",
    en: "Punta Cana parasailing: Caribbean views",
    fr: "Parasailing a Punta Cana : vues caraibes"
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: "Isla Saona desde Punta Cana con entradas incluidas",
    en: "Saona Island from Punta Cana with tickets",
    fr: "Ile Saona depuis Punta Cana avec billets"
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: "Safari cultural desde Punta Cana: campo y degustaciones",
    en: "Cultural safari from Punta Cana: countryside and tastings",
    fr: "Safari culturel depuis Punta Cana : campagne et degustations"
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: "Santo Domingo desde Punta Cana: excursion de un dia",
    en: "Santo Domingo day trip from Punta Cana",
    fr: "Excursion a Saint-Domingue depuis Punta Cana"
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: "ATV o buggy 4x4 desde Bayahibe y La Romana",
    en: "Half-day ATV or buggy 4x4 from Bayahibe",
    fr: "Demi-journee ATV ou buggy 4x4 depuis Bayahibe"
  },
  "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua": {
    es: "Barco privado en Sosua desde Puerto Plata",
    en: "Private party boat in Sosua from Puerto Plata",
    fr: "Bateau prive a Sosua depuis Puerto Plata"
  },
  "party-boat-sosua": {
    es: "Sosua Party Boat: snorkel, open bar y opcion privada",
    en: "Sosua Party Boat: snorkel, open bar, private option",
    fr: "Sosua Party Boat : snorkel, open bar, option privee"
  }
};

const TOUR_FAQ_OVERRIDES: Record<string, Partial<Record<Locale, TourFaqItem[]>>> = {
  "tour-en-buggy-en-punta-cana": {
    es: [
      {
        question: "Que incluye el tour en buggy en Punta Cana?",
        answer: "Incluye buggy, guia, rutas off-road y paradas para fotos. El precio final se muestra antes de reservar."
      },
      {
        question: "Hay parada en cueva o cenote?",
        answer: "La ruta suele incluir una parada en cueva o cenote y una casa tipica con cafe y cacao."
      },
      {
        question: "Necesito licencia para conducir?",
        answer: "Se requiere licencia vigente y ser mayor de edad. El briefing de seguridad es obligatorio."
      }
    ],
    en: [
      {
        question: "What is included in the Punta Cana buggy tour?",
        answer: "Buggy, guide, off-road routes and photo stops. The final price is shown before booking."
      },
      {
        question: "Is there a cave or cenote stop?",
        answer: "Most routes include a cave or cenote stop plus a local house visit with coffee and cacao."
      },
      {
        question: "Do I need a drivers license?",
        answer: "A valid license and adult age are required. The safety briefing is mandatory."
      }
    ],
    fr: [
      {
        question: "Que comprend le tour en buggy a Punta Cana?",
        answer: "Buggy, guide, pistes off-road et arrets photo. Le prix final est affiche avant la reservation."
      },
      {
        question: "Y a-t-il un arret grotte ou cenote?",
        answer: "La plupart des parcours incluent une grotte ou un cenote et une maison locale avec cafe et cacao."
      },
      {
        question: "Faut-il un permis de conduire?",
        answer: "Un permis valide et etre adulte sont requis. Le briefing de securite est obligatoire."
      }
    ]
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: [
      {
        question: "Puedo elegir buggy o ATV?",
        answer: "Si, eliges el tipo de vehiculo al reservar y confirmamos disponibilidad."
      },
      {
        question: "Cuanto dura la excursion?",
        answer: "La actividad dura aproximadamente {durationLabel}, incluyendo las paradas."
      },
      {
        question: "Hay recogida en hotel?",
        answer: "La mayoria de salidas incluye pickup en Punta Cana/Bavaro con punto confirmado."
      }
    ],
    en: [
      {
        question: "Can I choose buggy or ATV?",
        answer: "Yes, you select the vehicle type when booking and we confirm availability."
      },
      {
        question: "How long is the excursion?",
        answer: "The activity lasts about {durationLabel}, including stops."
      },
      {
        question: "Is hotel pickup included?",
        answer: "Most departures include pickup in Punta Cana/Bavaro with a confirmed meeting point."
      }
    ],
    fr: [
      {
        question: "Puis-je choisir buggy ou ATV?",
        answer: "Oui, vous choisissez le type de vehicule a la reservation et nous confirmons."
      },
      {
        question: "Quelle est la duree de l excursion?",
        answer: "L activite dure environ {durationLabel}, pauses incluses."
      },
      {
        question: "La prise en charge hotel est incluse?",
        answer: "La plupart des departs incluent la prise en charge a Punta Cana/Bavaro."
      }
    ]
  },
  "transfer-privado-proactivitis": {
    es: [
      {
        question: "Es traslado privado o compartido?",
        answer: "Es privado para tu grupo, con chofer verificado y vehiculo exclusivo."
      },
      {
        question: "Incluye seguimiento de vuelo?",
        answer: "Si, monitoreamos la hora de llegada y ajustamos la espera cuando es necesario."
      },
      {
        question: "Puedo reservar ida y vuelta?",
        answer: "Si, elige la opcion round trip en el checkout para asegurar ambos trayectos."
      }
    ],
    en: [
      {
        question: "Is it private or shared?",
        answer: "It is private for your group with a verified driver and dedicated vehicle."
      },
      {
        question: "Do you track flights?",
        answer: "Yes, we monitor arrival time and adjust the wait when needed."
      },
      {
        question: "Can I book round trip?",
        answer: "Yes, select round trip at checkout to secure both rides."
      }
    ],
    fr: [
      {
        question: "C est un transfert prive ou partage?",
        answer: "C est un transfert prive pour votre groupe avec chauffeur verifie."
      },
      {
        question: "Suivez-vous les vols?",
        answer: "Oui, nous suivons l heure d arrivee et ajustons l attente si besoin."
      },
      {
        question: "Puis-je reserver aller-retour?",
        answer: "Oui, choisissez aller-retour au checkout pour les deux trajets."
      }
    ]
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: [
      {
        question: "Desde donde sale el tour a Isla Saona?",
        answer: "Sale desde Bayahibe/La Romana con lancha o catamaran segun el horario."
      },
      {
        question: "Incluye almuerzo y bebidas?",
        answer: "Si, incluye almuerzo tipico y bebidas segun el operador."
      },
      {
        question: "Hay tiempo libre en la playa?",
        answer: "Si, hay tiempo de playa para banarse y descansar."
      }
    ],
    en: [
      {
        question: "Where does the Saona tour depart from?",
        answer: "It departs from Bayahibe/La Romana by speedboat or catamaran depending on schedule."
      },
      {
        question: "Is lunch and drinks included?",
        answer: "Yes, lunch and drinks are included depending on the operator."
      },
      {
        question: "Is there free beach time?",
        answer: "Yes, you have beach time to swim and relax."
      }
    ],
    fr: [
      {
        question: "D ou part le tour Ile Saona?",
        answer: "Depart de Bayahibe/La Romana en bateau rapide ou catamaran selon l horaire."
      },
      {
        question: "Dejeuner et boissons inclus?",
        answer: "Oui, dejeuner et boissons inclus selon l operateur."
      },
      {
        question: "Y a-t-il du temps libre a la plage?",
        answer: "Oui, temps libre pour nager et se detendre."
      }
    ]
  },
  "cayo-levantado-luxury-beach-day": {
    es: [
      {
        question: "Que incluye el dia en Samana y Cayo Levantado?",
        answer: "Incluye traslados, playa, almuerzo y paradas clave del itinerario."
      },
      {
        question: "Cuanto dura el viaje desde Punta Cana?",
        answer: "Es un tour de dia completo con salida temprano y regreso en la tarde."
      },
      {
        question: "Es apto para familias?",
        answer: "Si, es una excursion tranquila con ritmo moderado."
      }
    ],
    en: [
      {
        question: "What is included in the Samana and Cayo Levantado day?",
        answer: "Transfers, beach time, lunch and key stops are included."
      },
      {
        question: "How long is the trip from Punta Cana?",
        answer: "It is a full-day tour with early departure and afternoon return."
      },
      {
        question: "Is it family friendly?",
        answer: "Yes, it is a relaxed excursion with a moderate pace."
      }
    ],
    fr: [
      {
        question: "Que comprend la journee Samana et Cayo Levantado?",
        answer: "Transferts, plage, dejeuner et arrets principaux sont inclus."
      },
      {
        question: "Combien de temps dure le trajet depuis Punta Cana?",
        answer: "C est une excursion a la journee avec depart tot et retour l apres-midi."
      },
      {
        question: "C est adapte aux familles?",
        answer: "Oui, excursion tranquille avec rythme modere."
      }
    ]
  },
  "sunset-catamaran-snorkel": {
    es: [
      {
        question: "Es party boat con snorkel?",
        answer: "Si, catamaran con musica, open bar y parada de snorkel."
      },
      {
        question: "Hay recogida en hotel?",
        answer: "Confirmamos pickup en Punta Cana/Bavaro despues de reservar."
      },
      {
        question: "Que llevar?",
        answer: "Traje de bano, toalla, protector solar y efectivo opcional."
      }
    ],
    en: [
      {
        question: "Is it a party boat with snorkel?",
        answer: "Yes, catamaran with music, open bar and a snorkel stop."
      },
      {
        question: "Is hotel pickup included?",
        answer: "Pickup in Punta Cana/Bavaro is confirmed after booking."
      },
      {
        question: "What should I bring?",
        answer: "Swimsuit, towel, sunscreen and optional cash."
      }
    ],
    fr: [
      {
        question: "C est un party boat avec snorkel?",
        answer: "Oui, catamaran avec musique, open bar et arret snorkel."
      },
      {
        question: "La prise en charge hotel est incluse?",
        answer: "La prise en charge a Punta Cana/Bavaro est confirmee apres reservation."
      },
      {
        question: "Que faut-il apporter?",
        answer: "Maillot, serviette, creme solaire et cash optionnel."
      }
    ]
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: [
      {
        question: "En que temporada se ven las ballenas?",
        answer: "La temporada mas fuerte suele ser de enero a marzo."
      },
      {
        question: "Incluye Cascada El Limon?",
        answer: "Si, incluye visita a la cascada y Cayo Levantado."
      },
      {
        question: "Es un tour largo?",
        answer: "Si, es un dia completo con transporte desde Punta Cana."
      }
    ],
    en: [
      {
        question: "What is the whale season in Samana?",
        answer: "Peak season is usually from January to March."
      },
      {
        question: "Is El Limon Waterfall included?",
        answer: "Yes, it includes the waterfall and Cayo Levantado."
      },
      {
        question: "Is it a long tour?",
        answer: "Yes, it is a full-day tour with transport from Punta Cana."
      }
    ],
    fr: [
      {
        question: "Quelle est la saison des baleines a Samana?",
        answer: "La haute saison est generalement de janvier a mars."
      },
      {
        question: "La cascade El Limon est-elle incluse?",
        answer: "Oui, la cascade et Cayo Levantado sont inclus."
      },
      {
        question: "C est une longue excursion?",
        answer: "Oui, journee complete avec transport depuis Punta Cana."
      }
    ]
  },
  "parasailing-punta-cana": {
    es: [
      {
        question: "Cuanto dura el vuelo?",
        answer: "El vuelo dura entre 10 y 12 minutos en el aire."
      },
      {
        question: "Es seguro?",
        answer: "Equipo certificado, briefing y despegue desde lancha."
      },
      {
        question: "Pueden volar dos personas?",
        answer: "Si, vuelos dobles o triples segun peso."
      }
    ],
    en: [
      {
        question: "How long is the flight?",
        answer: "The flight lasts about 10-12 minutes in the air."
      },
      {
        question: "Is it safe?",
        answer: "Certified gear, safety briefing and boat takeoff."
      },
      {
        question: "Can two people fly?",
        answer: "Yes, double or triple flights depending on weight."
      }
    ],
    fr: [
      {
        question: "Combien de temps dure le vol?",
        answer: "Le vol dure environ 10-12 minutes."
      },
      {
        question: "Est-ce securise?",
        answer: "Equipement certifie, briefing et decollage depuis le bateau."
      },
      {
        question: "Peut-on voler a deux?",
        answer: "Oui, vols doubles ou triples selon le poids."
      }
    ]
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: [
      {
        question: "Incluye entrada y transporte?",
        answer: "Si, incluye ticket, transporte y tiempo de playa."
      },
      {
        question: "Que tipo de barco se usa?",
        answer: "Lancha rapida y catamaran segun el itinerario."
      },
      {
        question: "Hay pickup en hoteles?",
        answer: "Si, pickup en Punta Cana/Bavaro confirmado despues de reservar."
      }
    ],
    en: [
      {
        question: "Does it include ticket and transport?",
        answer: "Yes, ticket, transport and beach time are included."
      },
      {
        question: "What kind of boat is used?",
        answer: "Speedboat and catamaran depending on the itinerary."
      },
      {
        question: "Is hotel pickup included?",
        answer: "Yes, pickup in Punta Cana/Bavaro is confirmed after booking."
      }
    ],
    fr: [
      {
        question: "Billet et transport inclus?",
        answer: "Oui, billet, transport et temps de plage inclus."
      },
      {
        question: "Quel type de bateau est utilise?",
        answer: "Bateau rapide et catamaran selon l itineraire."
      },
      {
        question: "La prise en charge hotel est incluse?",
        answer: "Oui, prise en charge a Punta Cana/Bavaro apres reservation."
      }
    ]
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: [
      {
        question: "Que lugares se visitan en el safari cultural?",
        answer: "Campos, pueblos, casa tipica y degustaciones locales."
      },
      {
        question: "Incluye guia local?",
        answer: "Si, guia y transporte incluidos."
      },
      {
        question: "Es recomendable para familias?",
        answer: "Si, es un tour cultural y tranquilo."
      }
    ],
    en: [
      {
        question: "What places are visited on the cultural safari?",
        answer: "Countryside, villages, a local house and tastings."
      },
      {
        question: "Is a local guide included?",
        answer: "Yes, guide and transport are included."
      },
      {
        question: "Is it family friendly?",
        answer: "Yes, it is a relaxed cultural tour."
      }
    ],
    fr: [
      {
        question: "Quels lieux sont visites pendant le safari culturel?",
        answer: "Campagne, villages, maison locale et degustations."
      },
      {
        question: "Un guide local est-il inclus?",
        answer: "Oui, guide et transport inclus."
      },
      {
        question: "C est adapte aux familles?",
        answer: "Oui, c est un tour culturel tranquille."
      }
    ]
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: [
      {
        question: "Que incluye la visita a Santo Domingo?",
        answer: "Zona Colonial, paradas historicas y guia local."
      },
      {
        question: "Incluye almuerzo?",
        answer: "Si, almuerzo tipico incluido."
      },
      {
        question: "Cuanto dura el viaje?",
        answer: "Es un tour de dia completo con salida temprano."
      }
    ],
    en: [
      {
        question: "What is included in the Santo Domingo visit?",
        answer: "Colonial Zone, key stops and a local guide."
      },
      {
        question: "Is lunch included?",
        answer: "Yes, a local lunch is included."
      },
      {
        question: "How long is the trip?",
        answer: "It is a full-day tour with early departure."
      }
    ],
    fr: [
      {
        question: "Que comprend la visite de Saint-Domingue?",
        answer: "Zone Coloniale, arrets principaux et guide local."
      },
      {
        question: "Le dejeuner est-il inclus?",
        answer: "Oui, dejeuner local inclus."
      },
      {
        question: "Quelle est la duree du voyage?",
        answer: "Excursion a la journee avec depart tot."
      }
    ]
  },
  "party-boat-sosua": {
    es: [
      {
        question: "Cuanto cuesta el Sosua Party Boat?",
        answer: "Las salidas compartidas empiezan desde USD 65 por persona. Tambien hay opciones privadas y VIP para grupos."
      },
      {
        question: "El tour incluye open bar y snorkel?",
        answer: "Si, incluye open bar, musica a bordo, parada de snorkel y tiempo para disfrutar la bahia de Sosua."
      },
      {
        question: "Hay pickup desde Puerto Plata, Amber Cove o Taino Bay?",
        answer: "Si, coordinamos recogida en Puerto Plata y zonas de cruceros segun horario y disponibilidad."
      }
    ],
    en: [
      {
        question: "How much is the Sosua Party Boat?",
        answer: "Shared departures start from USD 65 per person. Private and VIP options are also available for groups."
      },
      {
        question: "Does it include open bar and snorkeling?",
        answer: "Yes, it includes open bar, onboard music, a snorkeling stop, and swim time in Sosua Bay."
      },
      {
        question: "Is pickup available from Puerto Plata, Amber Cove, or Taino Bay?",
        answer: "Yes, we coordinate pickup from Puerto Plata and cruise-port areas based on schedule and availability."
      }
    ],
    fr: [
      {
        question: "Combien coute le Sosua Party Boat?",
        answer: "Les departs partages commencent a USD 65 par personne. Des options privees et VIP sont aussi disponibles."
      },
      {
        question: "Le tour inclut-il open bar et snorkeling?",
        answer: "Oui, open bar, musique a bord, arret snorkeling et temps de baignade dans la baie de Sosua sont inclus."
      },
      {
        question: "Pickup possible depuis Puerto Plata, Amber Cove ou Taino Bay?",
        answer: "Oui, nous coordonnons la prise en charge depuis Puerto Plata et les zones de croisiere selon horaire et disponibilite."
      }
    ]
  }
};

const resolveTourH1 = (slug: string, locale: Locale, fallback: string) =>
  TOUR_H1_OVERRIDES[slug]?.[locale] ?? fallback;

const localeLabel = (locale: Locale, esLabel: string, enLabel: string, frLabel: string) => {
  if (locale === "en") return enLabel;
  if (locale === "fr") return frLabel;
  return esLabel;
};

type IntentLink = {
  href: string;
  title: string;
  description: string;
};

const buildCommercialIntentLinks = (locale: Locale, slug: string): IntentLink[] => {
  const prefix = locale === "es" ? "" : `/${locale}`;
  const links: IntentLink[] = [
    {
      href: `${prefix}/tours`,
      title: localeLabel(
        locale,
        "Mejores tours en Punta Cana",
        "Best Punta Cana tours",
        "Meilleurs tours a Punta Cana"
      ),
      description: localeLabel(
        locale,
        "Comparar excursiones por precio, duracion y categoria.",
        "Compare excursions by price, duration, and category.",
        "Comparer les excursions par prix, duree et categorie."
      )
    },
    {
      href: `${prefix}/punta-cana/tours`,
      title: localeLabel(
        locale,
        "Excursiones en Punta Cana con pickup",
        "Punta Cana excursions with hotel pickup",
        "Excursions a Punta Cana avec pickup hotel"
      ),
      description: localeLabel(
        locale,
        "Rutas populares como Saona, buggy, party boat y mas.",
        "Top routes like Saona, buggy, party boat, and more.",
        "Itineraires populaires: Saona, buggy, party boat et plus."
      )
    },
    {
      href: `${prefix}/traslado`,
      title: localeLabel(
        locale,
        "Traslado aeropuerto Punta Cana",
        "Punta Cana airport transfers",
        "Transferts aeroport Punta Cana"
      ),
      description: localeLabel(
        locale,
        "Transfer privado PUJ a hoteles con precio fijo.",
        "Private PUJ-to-hotel transfer with fixed rates.",
        "Transfert prive PUJ vers hotel avec tarif fixe."
      )
    },
    {
      href: `${prefix}/${locale === "es" ? "hoteles" : "hotels"}`,
      title: localeLabel(
        locale,
        "Hoteles en Punta Cana",
        "Punta Cana hotels",
        "Hotels a Punta Cana"
      ),
      description: localeLabel(
        locale,
        "Cotiza resorts todo incluido con soporte personalizado.",
        locale === "en"
          ? "Request all-inclusive resort quotes with personalized support."
          : "Demandez un devis resort tout inclus avec support personnalise.",
        "Demandez un devis resort tout inclus avec support personnalise."
      )
    }
  ];

  if (slug.includes("sosua") || slug.includes("puerto-plata")) {
    links.push({
      href: `${prefix}/sosua/party-boat`,
      title: localeLabel(locale, "Sosua Party Boat", "Sosua party boat", "Party boat a Sosua"),
      description: localeLabel(
        locale,
        "Versiones privada, VIP y grupos en Puerto Plata.",
        "Private, VIP, and group options in Puerto Plata.",
        "Options privees, VIP et groupes a Puerto Plata."
      )
    });
  }

  return links;
};

const TOUR_SCHEMA_KEYWORDS: Record<Locale, string[]> = {
  es: [
    "tours punta cana",
    "excursiones punta cana",
    "actividades punta cana",
    "tours con recogida en hotel",
    "traslados punta cana"
  ],
  en: [
    "punta cana tours",
    "punta cana excursions",
    "things to do punta cana",
    "tours with hotel pickup",
    "punta cana transfers"
  ],
  fr: [
    "excursions punta cana",
    "activites punta cana",
    "choses a faire punta cana",
    "prise en charge hotel punta cana",
    "transferts punta cana"
  ]
};

const NORTH_COAST_SCHEMA_KEYWORDS: Record<Locale, string[]> = {
  es: [
    "sosua party boat",
    "party boat sosua prices",
    "puerto plata party boat",
    "barco privado sosua",
    "catamaran sosua"
  ],
  en: [
    "sosua party boat",
    "party boat sosua prices",
    "puerto plata party boat",
    "private party boat sosua",
    "sosua catamaran"
  ],
  fr: [
    "party boat sosua",
    "prix party boat sosua",
    "party boat puerto plata",
    "bateau prive sosua",
    "catamaran sosua"
  ]
};

export type TourDetailSearchParams = {
  hotelSlug?: string;
  bookingCode?: string;
};

type TourDetailProps = {
  params: Promise<{
    slug?: string;
  }>;
  searchParams?: Promise<TourDetailSearchParams>;
  locale: Locale;
};

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null | Prisma.JsonValue): T[] => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined) as T[];
  }
  if (!value) return [];
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T[];
    } catch {
      return [];
    }
  }
  return [];
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as unknown as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveTourHeroImage = (tour: { heroImage?: string | null; gallery?: string | null }) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};

type CanonicalDurationUnit = "minute" | "hour" | "day" | "week" | "month";

const DURATION_UNIT_SYNONYMS = new Map<string, CanonicalDurationUnit>([
  ["min", "minute"],
  ["mins", "minute"],
  ["minute", "minute"],
  ["minutes", "minute"],
  ["minuto", "minute"],
  ["minutos", "minute"],
  ["heure", "hour"],
  ["heures", "hour"],
  ["hour", "hour"],
  ["hours", "hour"],
  ["hora", "hour"],
  ["horas", "hour"],
  ["jour", "day"],
  ["jours", "day"],
  ["day", "day"],
  ["days", "day"],
  ["dia", "day"],
  ["d\u00eda", "day"],
  ["dias", "day"],
  ["d\u00edas", "day"],
  ["week", "week"],
  ["weeks", "week"],
  ["semana", "week"],
  ["semanas", "week"],
  ["month", "month"],
  ["months", "month"],
  ["mes", "month"],
  ["meses", "month"]
]);

const DURATION_UNIT_LABELS: Record<Locale, Record<CanonicalDurationUnit, string>> = {
  es: {
    minute: "minutos",
    hour: "horas",
    day: "d\u00edas",
    week: "semanas",
    month: "meses"
  },
  en: {
    minute: "minutes",
    hour: "hours",
    day: "days",
    week: "weeks",
    month: "months"
  },
  fr: {
    minute: "minutes",
    hour: "heures",
    day: "jours",
    week: "semaines",
    month: "mois"
  }
};

const normalizeDurationUnit = (unit: string, locale: Locale) => {
  const key = DURATION_UNIT_SYNONYMS.get(unit.trim().toLowerCase());
  if (!key) return unit.trim();
  return DURATION_UNIT_LABELS[locale][key] ?? unit.trim();
};

const parseDuration = (value?: string | null) => {
  if (!value) return { value: "4", unit: "hour" };
  try {
    const parsed = JSON.parse(value) as { value?: string; unit?: string };
    if (parsed?.value && parsed?.unit) {
      return { value: parsed.value.trim(), unit: parsed.unit.trim() };
    }
  } catch {
    // fall back to plain string
  }
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(\D+)$/);
  if (match) {
    return { value: match[1], unit: match[2].trim() };
  }
  return { value: trimmed || "4", unit: "hour" };
};

const fetchTourTranslations = async (tourId: string) => {
  try {
    return await prisma.tourTranslation.findMany({
      where: { tourId }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return [];
    }
    throw error;
  }
};

const formatTimeSlot = (slot: PersistedTimeSlot) => {
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

const normalizePickupTimes = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const times = value.filter((item): item is string => typeof item === "string");
  return times.length ? times : null;
};

const itineraryMock: ItineraryStop[] = [
  {
    time: "09:00",
    title: "Pick-up",
    description: "Recogida en el lobby de tu hotel para arrancar con energia."
  },
  {
    time: "Ruta Safari",
    title: "Ruta Safari",
    description: "Recorrido por senderos de selva con paradas para fotos."
  },
  {
    time: "Cultura Local",
    title: "Cultura Local",
    description: "Degustacion de cafe, cacao y tabaco en casa tipica."
  },
  {
    time: "Cenote / Playa",
    title: "Cenote / Playa",
    description: "Parada para nadar y refrescarse en un entorno natural."
  },
  {
    time: "Regreso",
    title: "Regreso",
    description: "Traslado de vuelta al punto de origen."
  }
];

const buildTourTrustBadges = (locale: Locale, languages: string[], categories: string[]) => {
  const languageLabel = languages.length
    ? languages.join(" / ")
    : translate(locale, "tour.badges.languagesFallback");
  const categoryLabel = categories.length
    ? categories[0]
    : translate(locale, "tour.badges.categoryFallback");
  return [
    translate(locale, "tour.badges.guides", { languages: languageLabel }),
    translate(locale, "tour.badges.category", { category: categoryLabel }),
    translate(locale, "tour.badges.support")
  ];
};

const buildTourFaq = (
  locale: Locale,
  slug: string,
  tourTitle: string,
  durationLabel: string,
  displayTime: string,
  priceLabel: string
) => {
  const overrides = TOUR_FAQ_OVERRIDES[slug]?.[locale];
  if (overrides?.length) {
    return overrides.map((item) => ({
      question: item.question.replace("{durationLabel}", durationLabel),
      answer: item.answer.replace("{durationLabel}", durationLabel)
    }));
  }
  return [
    {
      question: translate(locale, "tour.faq.question.reserve", { tourTitle }),
      answer: translate(locale, "tour.faq.answer.reserve", { priceLabel })
    },
    {
      question: translate(locale, "tour.faq.question.includes"),
      answer: translate(locale, "tour.faq.answer.includes", { priceLabel, duration: durationLabel })
    },
    {
      question: translate(locale, "tour.faq.question.flight"),
      answer: translate(locale, "tour.faq.answer.flight", { displayTime })
    }
  ];
};

export default async function TourDetailPage({ params, searchParams, locale }: TourDetailProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hotelSlugFromQuery = resolvedSearchParams?.hotelSlug;
  const bookingCodeFromQuery = resolvedSearchParams?.bookingCode;
  const originHotel =
    hotelSlugFromQuery !== undefined
      ? await prisma.location.findUnique({
          where: { slug: hotelSlugFromQuery }
        })
      : null;
  if (!slug) notFound();
  if (slug === HIDDEN_TRANSFER_SLUG) notFound();
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string } | null)?.id ?? null;
  const preference = sessionUserId
    ? await prisma.customerPreference.findUnique({
        where: { userId: sessionUserId },
        select: { discountEligible: true, discountRedeemedAt: true, completedAt: true }
      })
    : null;
  const discountPercent =
    preference?.completedAt && preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;

  const tour = await prisma.tour.findFirst({
    where: { slug },
    select: {
      id: true,
      slug: true,
      status: true,
      title: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      heroImage: true,
      gallery: true,
      highlights: true,
      includes: true,
      includesList: true,
      notIncludedList: true,
      category: true,
      destinationId: true,
      departureDestinationId: true,
      language: true,
      location: true,
      timeOptions: true,
      duration: true,
      adminNote: true,
      price: true,
      capacity: true,
      platformSharePercent: true,
      options: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          pricePerPerson: true,
          basePrice: true,
          baseCapacity: true,
          extraPricePerPerson: true,
          pickupTimes: true,
          isDefault: true,
          active: true
        }
      },
      SupplierProfile: {
        select: {
          company: true,
          stripeAccountId: true,
          User: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!tour) {
    const fallback = await prisma.tour.findUnique({ where: { id: slug } });
    if (fallback?.slug) redirect(`/tours/${fallback.slug}`);
    notFound();
  }

  if (tour.status !== "published") notFound();

  const relatedConditions: Prisma.TourWhereInput[] = [];
  if (tour.destinationId) {
    relatedConditions.push({ destinationId: tour.destinationId });
  }
  if (tour.departureDestinationId) {
    relatedConditions.push({ departureDestinationId: tour.departureDestinationId });
  }
  const relatedTours = await prisma.tour.findMany({
    where: {
      status: "published",
      id: { not: tour.id },
      ...(relatedConditions.length ? { OR: relatedConditions } : {})
    },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      heroImage: true,
      gallery: true,
      translations: {
        where: { locale },
        select: { title: true }
      }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 6
  });

  const translations = await fetchTourTranslations(tour.id);

  // --- Logica de datos ---
  const rawGallery = parseGallery(tour.gallery);
  const rawHighlights = parseJsonArray<string>(tour.highlights);
  const includesFromString = tour.includes ? tour.includes.split(";").map((i) => i.trim()).filter(Boolean) : [];
  const includesList = parseJsonArray<string>(tour.includesList);
  const notIncludedList = parseJsonArray<string>(tour.notIncludedList);
  const fallbackIncludes = [
    translate(locale, "tour.fallback.include.transfer"),
    translate(locale, "tour.fallback.include.guide"),
    translate(locale, "tour.fallback.include.lunch")
  ];
  const fallbackExcludes = [
    translate(locale, "tour.fallback.exclude.tips"),
    translate(locale, "tour.fallback.exclude.drinks"),
    translate(locale, "tour.fallback.exclude.photos")
  ];
  const categories = (tour.category ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  const languages = (tour.language ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const durationValue = parseDuration(tour.duration);
  const displayTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "09:00 AM";
  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const heroImage = resolveTourHeroImage(tour);
  const gallery = [heroImage, ...rawGallery.filter((img) => img && img !== heroImage)];
  const translation = translations.find((entry) => entry.locale === locale);
  const translationIncludes = (translation?.includesList as string[] | undefined) ?? [];
  const translationNotIncluded = (translation?.notIncludedList as string[] | undefined) ?? [];
  const translationHighlights = (translation?.highlights as string[] | undefined) ?? [];
  const translationItineraryStops = (translation?.itineraryStops as string[] | undefined) ?? [];
  const includes = translationIncludes.length
    ? translationIncludes
    : includesList.length
      ? includesList
      : includesFromString.length
        ? includesFromString
        : fallbackIncludes;
  const excludes = translationNotIncluded.length
    ? translationNotIncluded
    : notIncludedList.length
      ? notIncludedList
      : fallbackExcludes;
  const highlights = translationHighlights.length ? translationHighlights : rawHighlights;
  const hasBaseItinerary = itinerarySource.length > 0;
  const hasTranslationItinerary = translationItineraryStops.length > 0;
  const visualTimeline =
    hasTranslationItinerary && hasBaseItinerary
      ? itinerarySource.map((stop, index) => ({
          ...stop,
          title: translationItineraryStops[index] ?? stop.title,
          description: stop.description
        }))
      : hasTranslationItinerary
        ? translationItineraryStops.map((title) => ({
            time: "",
            title,
            description: ""
          }))
        : hasBaseItinerary
          ? itinerarySource
          : [];
  const hasVisualTimeline = visualTimeline.length > 0;
  const localizedTitle = translation?.title ?? tour.title;
  const heroTitle = resolveTourH1(tour.slug, locale, localizedTitle);
  const localizedSubtitle = translation?.subtitle ?? tour.subtitle ?? "";
  const localizedShortDescription = translation?.shortDescription ?? tour.shortDescription;
  const localizedDescription = translation?.description ?? tour.description;
  const durationUnitSource = translation?.durationUnit ?? durationValue.unit;
  const durationUnit = normalizeDurationUnit(durationUnitSource, locale);
  const durationLabel = `${durationValue.value} ${durationUnit}`;
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const shortDescriptionText = localizedShortDescription ?? localizedDescription;
  const needsReadMore = Boolean(shortDescriptionText && shortDescriptionText.length > 220);
  const shortTeaser =
    shortDescriptionText && shortDescriptionText.length > 220
      ? `${shortDescriptionText.slice(0, 220).trim()}...`
      : shortDescriptionText ?? "Explora esta aventura guiada por expertos locales.";
  const longDescriptionParagraphs = localizedDescription
    ? localizedDescription
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
  const trustBadges = buildTourTrustBadges(locale, languages, categories);
  const faqList = buildTourFaq(locale, tour.slug, heroTitle, durationLabel, displayTime, priceLabel);
  const relatedTourCards = relatedTours.map((item) => {
    const localizedRelatedTitle = item.translations?.[0]?.title ?? item.title;
    const relatedImage = resolveTourHeroImage(item);
    const relatedHref = locale === "es" ? `/tours/${item.slug}` : `/${locale}/tours/${item.slug}`;
    return {
      id: item.id,
      href: relatedHref,
      title: localizedRelatedTitle,
      price: `$${item.price.toFixed(0)} USD`,
      image: relatedImage.startsWith("http") ? relatedImage : `${PROACTIVITIS_URL}${relatedImage}`
    };
  });
  const isSosuaPartyBoatTour =
    tour.slug === "party-boat-sosua" ||
    tour.slug === "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua";
  const commercialIntentLinks = buildCommercialIntentLinks(locale, tour.slug);

  const approvedReviews = await getApprovedTourReviews(tour.id);
  const reviewLocale =
    locale === "en" ? "en-US" : locale === "fr" ? "fr-FR" : "es-ES";
  const translatedReviews = await Promise.all(
    approvedReviews.map(async (review) => {
      if (locale === review.locale) {
        return review;
      }
      const sourceLocale =
        review.locale === "en" || review.locale === "fr" ? review.locale : "auto";
      const translatedTitle = review.title
        ? await translateText(review.title, locale, sourceLocale)
        : review.title;
      const translatedBody = await translateText(review.body, locale, sourceLocale);
      return { ...review, title: translatedTitle, body: translatedBody };
    })
  );
  const reviewSummaryData = await getTourReviewSummary(tour.id);
  const detailReviewCount = reviewSummaryData.count;
  const ratingValue = reviewSummaryData.count > 0 ? reviewSummaryData.average : 0;
  const detailReviewLabel = formatReviewCountValue(detailReviewCount);
  const reviewSummary = detailReviewCount
    ? translate(locale, "tour.section.reviews.summary", {
        rating: ratingValue.toFixed(1),
        count: detailReviewCount
      })
    : translate(locale, "tour.section.reviews.empty");
  const heroPriceLabel = translate(locale, "tour.hero.priceLabel");
  const heroRatingLabel = translate(locale, "tour.hero.ratingLabel");
  const heroReviewsLabel = translate(locale, "tour.hero.reviewsCount", { count: detailReviewCount });
  const heroReserveCta = translate(locale, "tour.hero.cta.reserve");
  const heroGalleryCta = translate(locale, "tour.hero.cta.gallery");

  const heroNavTabs: { labelKey: TranslationKey; href: string }[] = [
    { labelKey: "tour.nav.overview", href: "#overview" },
    { labelKey: "tour.nav.includes", href: "#includes" },
    { labelKey: "tour.nav.itinerary", href: "#itinerary" },
    { labelKey: "tour.nav.reviews", href: "#reviews" },
    { labelKey: "tour.nav.faq", href: "#faq" }
  ];

  const languagesValue = languages.length ? languages.join(", ") : translate(locale, "tour.quickInfo.languages.pending");
  const languagesDetail = languages.length
    ? translate(locale, "tour.quickInfo.languages.detailAvailable", { count: languages.length })
    : translate(locale, "tour.quickInfo.languages.detailPending");
  const reviewBreakdown = buildReviewBreakdown(approvedReviews).map((item) => ({
    labelKey: `tour.reviews.breakdown.${item.rating}` as TranslationKey,
    percent: item.percent
  }));
  const reviewHighlights = translatedReviews.map((review) => ({
    id: review.id,
    name: review.customerName,
    date: new Date(review.createdAt).toLocaleDateString(reviewLocale),
    quote: review.body,
    rating: review.rating
  }));


  const quickInfo = [
    {
      label: translate(locale, "tour.quickInfo.duration.label"),
      value: durationLabel,
      detail: translate(locale, "tour.quickInfo.duration.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    },
    {
      label: translate(locale, "tour.quickInfo.departure.label"),
      value: displayTime,
      detail: translate(locale, "tour.quickInfo.departure.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16Zm0 9V7" />
          <path d="M12 12h4" />
        </svg>
      )
    },
    {
      label: translate(locale, "tour.quickInfo.languages.label"),
      value: languagesValue,
      detail: languagesDetail,
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M8 4c0 2.21-1.343 4-3 4M18 4c0 2.21 1.343 4 3 4" />
        </svg>
      )
    },
    {
      label: translate(locale, "tour.quickInfo.capacity.label"),
      value: `${tour.capacity ?? "15"} pers.`,
      detail: translate(locale, "tour.quickInfo.capacity.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <path d="M2 21c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" />
        </svg>
      )
    }
  ];

  const heroImageAbsolute = heroImage
    ? heroImage.startsWith("http")
      ? heroImage
      : `${PROACTIVITIS_URL}${heroImage}`
    : `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;
  const galleryImagesAbsolute = gallery
    .map((image) => (image.startsWith("http") ? image : `${PROACTIVITIS_URL}${image}`))
    .filter((image) => image && image !== heroImageAbsolute);
  const schemaImages = [heroImageAbsolute, ...galleryImagesAbsolute].slice(0, 5);
  const tourUrl = `${PROACTIVITIS_URL}${locale === "es" ? "" : `/${locale}`}/tours/${tour.slug}`;
  const toursHubUrl = `${PROACTIVITIS_URL}${locale === "es" ? "/tours" : `/${locale}/tours`}`;
  const priceValidUntil = getPriceValidUntil();
  const touristTypeFallback = categories.find((category) =>
    ["Family", "Adventure", "Couples"].includes(category)
  );
  const schemaKeywords = PUNTA_CANA_TOP_TOURS.has(tour.slug)
    ? TOUR_SCHEMA_KEYWORDS[locale]
    : NORTH_COAST_PARTY_BOAT_TOURS.has(tour.slug)
      ? NORTH_COAST_SCHEMA_KEYWORDS[locale]
      : undefined;
  const aggregateRating =
    detailReviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(ratingValue.toFixed(1)),
          reviewCount: detailReviewCount,
          bestRating: "5"
        }
      : undefined;
  const reviewSchema =
    detailReviewCount > 0
      ? translatedReviews.slice(0, 5).map((review) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: review.customerName
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: "5"
          },
          reviewBody: review.body,
          name: review.title ?? heroTitle,
          datePublished: new Date(review.createdAt).toISOString()
        }))
      : undefined;
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${tourUrl}#product`,
    name: heroTitle,
    description: localizedDescription ?? shortTeaser,
    image: schemaImages,
    url: tourUrl,
    mainEntityOfPage: tourUrl,
    brand: {
      "@type": "Brand",
      name: "Proactivitis"
    },
    category: touristTypeFallback ?? "Tour",
    offers: {
      "@type": "Offer",
      url: tourUrl,
      price: tour.price,
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      seller: PROACTIVITIS_LOCALBUSINESS,
      eligibleRegion: {
        "@type": "Country",
        name: "Dominican Republic"
      },
      itemCondition: "https://schema.org/NewCondition"
    },
    sameAs: SAME_AS_URLS,
    ...(schemaKeywords ? { keywords: schemaKeywords.join(", ") } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviewSchema ? { review: reviewSchema } : {})
  };

  const touristTripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "@id": `${tourUrl}#trip`,
    name: heroTitle,
    description: localizedDescription ?? shortTeaser,
    image: schemaImages,
    url: tourUrl,
    inLanguage: locale,
    touristType: categories.length ? categories : [touristTypeFallback ?? "General"],
    provider: PROACTIVITIS_LOCALBUSINESS,
    offers: {
      "@type": "Offer",
      url: tourUrl,
      price: tour.price,
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: localeLabel(locale, "Inicio", "Home", "Accueil"),
        item: `${PROACTIVITIS_URL}${locale === "es" ? "/" : `/${locale}`}`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: localeLabel(locale, "Tours", "Tours", "Excursions"),
        item: toursHubUrl
      },
      {
        "@type": "ListItem",
        position: 3,
        name: heroTitle,
        item: tourUrl
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const bookingWidgetProps = {
    tourId: tour.id,
    basePrice: tour.price,
    timeSlots,
    options: tour.options?.map((option) => ({
      ...option,
      pickupTimes: normalizePickupTimes(option.pickupTimes)
    })) ?? [],
    supplierHasStripeAccount: Boolean(tour.SupplierProfile?.stripeAccountId),
    platformSharePercent: tour.platformSharePercent ?? 20,
    tourTitle: localizedTitle,
    tourImage: heroImage,
    hotelSlug: hotelSlugFromQuery ?? undefined,
    bookingCode: bookingCodeFromQuery ?? undefined,
    originHotelName: originHotel?.name ?? undefined,
    discountPercent
  };
  const relatedToursSchema = relatedTourCards.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": `${tourUrl}#related-tours`,
        name: localeLabel(locale, "Tours relacionados", "Related tours", "Excursions associees"),
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: relatedTourCards.length,
        itemListElement: relatedTourCards.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          url: `${PROACTIVITIS_URL}${item.href}`
        }))
      }
    : null;

  const BookingPanel = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl ${className}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {translate(locale, "tour.booking.panel.label")}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">
        {translate(locale, "tour.booking.panel.title")}
      </h3>
      <div className="mt-4">
        <TourBookingWidget {...bookingWidgetProps} />
      </div>
      <div className="mt-6 rounded-[16px] border border-[#F1F5F9] bg-slate-50/60 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">
          {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? translate(locale, "tour.booking.panel.providerFallback")}
        </p>
        <p>{translate(locale, "tour.booking.panel.supplier")}</p>
      </div>
    </div>
  );

  return (
  <div className="min-h-screen bg-[#FDFDFD] text-slate-950 pb-24 overflow-x-hidden">
      <StructuredData data={tourSchema} />
      <StructuredData data={touristTripSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />
      {relatedToursSchema ? <StructuredData data={relatedToursSchema} /> : null}

      <section className="mx-auto max-w-[1240px] px-4 pt-8 sm:pt-10">
        <div className="grid gap-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-16">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              <svg
                aria-hidden
                className="h-3 w-3 text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 12.5 7 12.5s7-7.25 7-12.5c0-3.866-3.134-7-7-7zm0 4a3 3 0 100-6 3 3 0 000 6z"
                />
                <circle cx="12" cy="8.4" r="2.4" />
              </svg>
              <span>{tour.location ?? "Punta Cana"}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">{heroTitle}</h1>
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{heroPriceLabel}</p>
                  <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{heroRatingLabel}</p>
                  <div className="flex items-center gap-2">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-amber-500"
                      fill="currentColor"
                    >
                      <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
                    </svg>
                    <p className="text-xl font-black">
                      {detailReviewCount ? ratingValue.toFixed(1) : "0.0"}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{heroReviewsLabel}</p>
                </div>
              </div>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                  {trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              <div className="flex flex-wrap gap-3">
                    <Link
                      href="#booking"
                      className="rounded-3xl bg-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
                    >
                      {heroReserveCta}
                    </Link>
                    <GalleryLightbox
                      images={gallery}
                      buttonLabel={heroGalleryCta}
                  buttonClassName="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                />
              </div>
            </div>
          </div>
          <TourGalleryCollage images={gallery} title={heroTitle} fallbackImage={heroImage} />
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-[1240px] px-4">
        <nav className="sticky top-16 z-10 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur lg:top-8">
          <div className="flex gap-3 overflow-x-auto py-1 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            {heroNavTabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {translate(locale, tab.labelKey)}
              </a>
            ))}
          </div>
        </nav>
      </section>

      <section id="overview" className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "tour.section.overview.label")}
          </p>
          <p className="text-lg text-slate-800 line-clamp-3">{shortDescriptionText ?? shortTeaser}</p>
          {highlights.length ? (
            <ul className="space-y-2 text-sm font-semibold text-slate-700">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden className="text-lg text-emerald-600">*</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {longDescriptionParagraphs.length ? (
        <section className="mx-auto mt-6 max-w-[1240px] px-4">
          <div className="space-y-3 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {translate(locale, "tour.section.description.label")}
            </p>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {longDescriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="key-info" className="mx-auto mt-6 max-w-[1240px] px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickInfo.map((item) => (
            <div
              key={item.label}
              className="rounded-[16px] border border-slate-100 bg-white/80 px-5 py-4 text-center shadow-md"
            >
              <span className="mb-2 inline-block text-2xl">{item.icon}</span>
              <p className="text-[10px] font-semibold text-slate-500 tracking-[0.2em]">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="booking" className="mx-auto mt-6 max-w-[1240px] px-4 lg:hidden">
        <div className="md:hidden mb-3">
          <p className="text-sm font-semibold text-gray-900">
            {translate(locale, "tour.booking.mobile.title")}
          </p>
          <p className="text-xs text-gray-600">{translate(locale, "tour.booking.mobile.description")}</p>
        </div>
        <div className="md:hidden ring-1 ring-black/10 shadow-md">
          <BookingPanel />
        </div>
      </section>

      <main className="mx-auto mt-10 grid max-w-[1240px] gap-10 px-4 lg:grid-cols-[1fr,420px]">
        <div className="space-y-10">
          <section id="includes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {translate(locale, "tour.section.coverage.label")}
                </p>
                <h2 className="text-[20px] font-semibold text-slate-900">
                  {translate(locale, "tour.section.coverage.heading")}
                  <span className="sr-only"> {localizedTitle}</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500">{translate(locale, "tour.section.coverage.note")}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {translate(locale, "tour.section.coverage.includes")}
                </p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-emerald-600">
                  {includes.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span aria-hidden className="text-lg text-emerald-500">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {translate(locale, "tour.section.coverage.excludes")}
                </p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-rose-500">
                  {excludes.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span aria-hidden className="text-lg text-rose-500">x</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="itinerary" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {translate(locale, "tour.section.itinerary.label")}
                </p>
                <h2 className="text-[20px] font-semibold text-slate-900">
                  {translate(locale, "tour.section.itinerary.heading")}
                  <span className="sr-only"> {localizedTitle}</span>
                </h2>
              </div>
            </div>
          <div className="space-y-4">
            {hasVisualTimeline ? (
              visualTimeline.map((stop, index) => (
                <div key={`${stop.title}-${index}`} className="flex gap-4 rounded-[16px] border border-[#F1F5F9] bg-white/70 px-4 py-3">
                  <div className="flex flex-col items-center text-sm text-slate-500">
                    <span className="h-3 w-3 rounded-full bg-indigo-600" />
                    {index !== visualTimeline.length - 1 && <span className="mt-2 h-6 w-px bg-slate-200" />}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-700">
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{stop.time}</p>
                    <p className="text-base font-semibold text-slate-900">{stop.title}</p>
                    <p>{stop.description ?? translate(locale, "tour.section.itinerary.detailPending")}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                {translate(locale, "tour.section.itinerary.detailPending")}
              </div>
            )}
          </div>
          </section>

          <section id="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {translate(locale, "tour.section.reviews.label")}
                </p>
                <h2 className="text-[20px] font-semibold text-slate-900">
                  {translate(locale, "tour.section.reviews.heading")}
                  <span className="sr-only"> {localizedTitle}</span>
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{reviewSummary}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-semibold text-slate-900">
                    {detailReviewCount ? ratingValue.toFixed(1) : "0.0"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {translate(locale, "tour.section.reviews.ratingOutOf")}
                  </p>
                </div>
                {detailReviewCount ? (
                  <div className="space-y-3 text-sm text-slate-700">
                    {reviewBreakdown.map((item) => (
                      <div key={item.labelKey} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-slate-500">{translate(locale, item.labelKey)}</span>
                        <div className="relative flex-1 overflow-hidden rounded-full bg-slate-100">
                          <span
                            className="block h-2 rounded-full bg-emerald-500"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs font-semibold text-slate-500">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">{translate(locale, "tour.section.reviews.empty")}</p>
                )}
              </div>
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                {reviewHighlights.length ? (
                  reviewHighlights.map((review) => (
                    <div key={review.id} className="rounded-[16px] border border-[#F1F5F9] bg-white p-4 shadow">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                          {review.name
                            .split(" ")
                            .map((chunk) => chunk[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                          <p className="text-xs text-slate-500">{review.date}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{review.quote}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">{translate(locale, "tour.section.reviews.empty")}</p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <TourReviewForm tourId={tour.id} locale={locale} />
            </div>
            {isSosuaPartyBoatTour && reviewHighlights.length ? (
              <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                  {localeLabel(locale, "Resenas verificadas", "Verified reviews", "Avis verifies")}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">
                  {localeLabel(
                    locale,
                    "Lo que dicen clientes reales de Sosua Party Boat",
                    "What real travelers say about Sosua Party Boat",
                    "Ce que disent les vrais voyageurs sur Sosua Party Boat"
                  )}
                </h3>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {reviewHighlights.slice(0, 3).map((item) => (
                    <article key={item.id} className="rounded-xl border border-emerald-100 bg-white p-3">
                      <p className="text-sm text-slate-700">"{item.quote}"</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        {item.name}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section id="faq" className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {translate(locale, "tour.section.faq.label")}
              </p>
              <h2 className="text-[20px] font-semibold text-slate-900">
                {translate(locale, "tour.section.faq.heading")}
                <span className="sr-only"> {localizedTitle}</span>
              </h2>
            </div>
            <div className="space-y-4 text-sm text-slate-700">
              {faqList.map((item) => (
                <article key={item.question} className="rounded-[16px] border border-[#F1F5F9] bg-white/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.question}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {localeLabel(locale, "Planifica mejor", "Plan better", "Planifiez mieux")}
              </p>
              <h2 className="text-[20px] font-semibold text-slate-900">
                {localeLabel(
                  locale,
                  "Enlaces utiles para reservar",
                  "Useful booking links",
                  "Liens utiles pour reserver"
                )}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {commercialIntentLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[16px] border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {relatedTourCards.length ? (
            <section className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {localeLabel(locale, "Mas tours", "More tours", "Plus d excursions")}
                </p>
                <h2 className="text-[20px] font-semibold text-slate-900">
                  {localeLabel(locale, "Tours relacionados", "Related tours", "Excursions associees")}
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedTourCards.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-44 w-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm font-bold text-indigo-600">{item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-10 space-y-6">
            <BookingPanel />
          </div>
        </aside>
      </main>

      <ReserveFloatingButton
        targetId="booking"
        priceLabel={priceLabel}
        label={translate(locale, "tour.booking.floating.label")}
        buttonLabel={translate(locale, "tour.booking.floating.button")}
      />
    </div>
  );
}
