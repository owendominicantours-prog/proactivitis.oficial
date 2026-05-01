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
import { ensureLeadingCapital } from "@/lib/text-format";
import { getActiveOfferPriceMapForTours } from "@/lib/offerPricing";
import { formatDurationDisplay } from "@/lib/formatDuration";
import { normalizeTourLocation, normalizeTourLanguages } from "@/lib/tour-display";

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

const LEGACY_TOUR_SLUG_REDIRECTS: Record<string, string> = {
  "transfer-privado-proactivitis": "/punta-cana/premium-transfer-services",
  "saona-island-full-day-tour": "/tours/tour-y-entrada-para-de-isla-saona-desde-punta-cana",
  "atv-horseback-parasailing-combo": "/tours/excursion-en-buggy-y-atv-en-punta-cana",
  "sunset-sup-cocktails": "/tours/sunset-catamaran-snorkel",
  "zip-line-adventure-punta-cana": "/tours",
  "party-boat-punta-cana": "/thingtodo/tours/party-boat-punta-cana-guia-completa",
  "samana-cayo-levantado-waterfall-full-day":
    "/tours/avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana",
  "cenote-y-cuevas-adventure": "/tours/excursion-en-buggy-y-atv-en-punta-cana",
  "kayak-snorkel-en-isla-saona": "/tours/tour-y-entrada-para-de-isla-saona-desde-punta-cana",
  "katamaran-fiesta-punta-cana": "/tours/sunset-catamaran-snorkel",
  "isla-catalina-snorkeling": "/tours",
  "horseback-riding-punta-cana": "/tours",
  "ocean-world-dolphin-encounter": "/tours",
  "punta-cana-city-tour-y-cultura": "/tours",
  "sunrise-yoga-wellness-retreat": "/tours",
  "punta-cana-night-show-dinner": "/tours"
};

const toLocalizedPath = (path: string, locale: Locale) => (locale === "es" ? path : `/${locale}${path}`);

const NORTH_COAST_PARTY_BOAT_TOURS = new Set([
  "party-boat-sosua",
  "barco-privado-para-fiestas-con-todo-incluido-desde-puerto-plata-sosua"
]);

const COCO_BONGO_COMPARISON_TOURS = new Set([
  "coco-bongo-punta-cana-show-disco-skip-the-line",
  "coco-bongo-punta-cana"
]);

const SCAPE_PARK_TOURS = new Set([
  "scape-park-punta-cana",
  "scape-park-full-admission-punta-cana",
  "scape-park-sunshine-cruise-punta-cana",
  "scape-park-buggies-punta-cana",
  "juanillo-vip-scape-park-punta-cana"
]);

const TOUR_KEYWORDS_BY_SLUG: Record<string, Partial<Record<Locale, string[]>>> = {
  "private-buggy-tour-cenote-swim-dominican-lunch": {
    es: [
      "buggy privado punta cana",
      "tour buggy privado punta cana",
      "buggy cenote punta cana",
      "buggy con almuerzo dominicano",
      "excursion privada buggy punta cana"
    ],
    en: [
      "private buggy punta cana",
      "private buggy tour punta cana",
      "buggy cenote punta cana",
      "buggy tour with dominican lunch",
      "private off road tour punta cana"
    ],
    fr: [
      "buggy prive punta cana",
      "tour prive buggy punta cana",
      "buggy cenote punta cana",
      "buggy avec dejeuner dominicain",
      "excursion buggy privee punta cana"
    ]
  }
};

const TOUR_H1_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "tour-en-buggy-en-punta-cana": {
    es: "Buggy Punta Cana: tour off-road con playa, cueva y barro",
    en: "Punta Cana buggy tour: off-road, beach, cave and mud",
    fr: "Buggy a Punta Cana : tour off-road avec plage, grotte et boue"
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
    es: "Sosua Party Boat: snorkel, open bar y opción privada",
    en: "Sosua Party Boat: snorkel, open bar, private option",
    fr: "Sosua Party Boat : snorkel, open bar, option privee"
  },
  "scape-park-full-admission-punta-cana": {
    es: "Scape Park Full Admission en Punta Cana",
    en: "Scape Park Full Admission in Punta Cana",
    fr: "Scape Park Full Admission a Punta Cana"
  },
  "scape-park-sunshine-cruise-punta-cana": {
    es: "Scape Park + Sunshine Cruise en Punta Cana",
    en: "Scape Park + Sunshine Cruise in Punta Cana",
    fr: "Scape Park + Sunshine Cruise a Punta Cana"
  },
  "scape-park-buggies-punta-cana": {
    es: "Scape Park + Buggies en Punta Cana",
    en: "Scape Park + Buggies in Punta Cana",
    fr: "Scape Park + Buggies a Punta Cana"
  },
  "juanillo-vip-scape-park-punta-cana": {
    es: "Juanillo VIP by Scape Park en Punta Cana",
    en: "Juanillo VIP by Scape Park in Punta Cana",
    fr: "Juanillo VIP by Scape Park a Punta Cana"
  },
  "private-buggy-tour-cenote-swim-dominican-lunch": {
    es: "Buggy privado en Punta Cana con cenote y almuerzo dominicano",
    en: "Private buggy tour in Punta Cana with cenote swim and Dominican lunch",
    fr: "Tour prive en buggy a Punta Cana avec cenote et dejeuner dominicain"
  },
};

const TOUR_FAQ_OVERRIDES: Record<string, Partial<Record<Locale, TourFaqItem[]>>> = {
  "tour-en-buggy-en-punta-cana": {
    es: [
      {
        question: "¿Qué incluye el tour en buggy en Punta Cana?",
        answer: "Incluye buggy, guía local, ruta off-road y paradas para foto. Antes de pagar ves el total final, sin cargos sorpresa."
      },
      {
        question: "Hay parada en cueva o cenote?",
        answer: "Sí. Normalmente hacemos parada en cueva o cenote y en casa típica para probar café y cacao dominicano."
      },
      {
        question: "Necesito licencia para conducir?",
        answer: "Sí, necesitas licencia vigente y ser mayor de edad para conducir. Antes de salir damos briefing de seguridad obligatorio."
      }
    ],
    en: [
      {
        question: "What is included in the Punta Cana buggy tour?",
        answer: "It includes buggy, local guide, off-road route and photo stops. You see the full final price before payment."
      },
      {
        question: "Is there a cave or cenote stop?",
        answer: "Yes. Most routes include a cave or cenote stop plus a local house visit for Dominican coffee and cacao tasting."
      },
      {
        question: "Do I need a drivers license?",
        answer: "Yes, a valid drivers license and adult age are required to drive. A mandatory safety briefing happens before departure."
      }
    ],
    fr: [
      {
        question: "Que comprend le tour en buggy a Punta Cana?",
        answer: "Le tour comprend buggy, guide local, piste off-road et arrets photo. Le prix final est affiche avant paiement."
      },
      {
        question: "Y a-t-il un arret grotte ou cenote?",
        answer: "Oui. La plupart des parcours incluent un arret grotte ou cenote et une maison locale avec degustation cafe-cacao."
      },
      {
        question: "Faut-il un permis de conduire?",
        answer: "Oui, permis valide et majorite sont requis pour conduire. Le briefing securite est obligatoire avant de partir."
      }
    ]
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: [
      {
        question: "Puedo elegir buggy o ATV?",
        answer: "Sí. Puedes elegir buggy o ATV al reservar, y te confirmamos disponibilidad real para ese horario."
      },
      {
        question: "¿Cuánto dura la excursión?",
        answer: "La actividad dura aproximadamente {durationLabel}, incluyendo las paradas."
      },
      {
        question: "¿Hay recogida en hotel?",
        answer: "Sí, la mayoria de salidas incluye pickup en hoteles de Punta Cana y Bavaro con punto y hora confirmados."
      }
    ],
    en: [
      {
        question: "Can I choose buggy or ATV?",
        answer: "Yes. You choose buggy or ATV during booking and we confirm real availability for your selected time."
      },
      {
        question: "How long is the excursion?",
        answer: "The activity lasts about {durationLabel}, including stops."
      },
      {
        question: "Is hotel pickup included?",
        answer: "Yes, most departures include hotel pickup in Punta Cana/Bavaro with a confirmed time and meeting point."
      }
    ],
    fr: [
      {
        question: "Puis-je choisir buggy ou ATV?",
        answer: "Oui. Vous choisissez buggy ou ATV pendant la reservation, puis nous confirmons la disponibilite reelle."
      },
      {
        question: "Quelle est la duree de l excursion?",
        answer: "L activite dure environ {durationLabel}, pauses incluses."
      },
      {
        question: "La prise en charge hotel est incluse?",
        answer: "Oui, la plupart des departs incluent la prise en charge hotel a Punta Cana/Bavaro avec horaire confirme."
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
        answer: "Sí, monitoreamos la hora de llegada y ajustamos la espera cuando es necesario."
      },
      {
        question: "Puedo reservar ida y vuelta?",
        answer: "Sí, elige la opción round trip en el checkout para asegurar ambos trayectos."
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
        answer: "Sale desde Bayahibe o La Romana. Según la salida, combinas lancha rápida y catamarán durante el día."
      },
      {
        question: "Incluye almuerzo y bebidas?",
        answer: "Sí, incluye almuerzo tipo buffet y bebidas basicas. Los detalles exactos aparecen antes de confirmar reserva."
      },
      {
        question: "Hay tiempo libre en la playa?",
        answer: "Sí, hay tiempo de playa para banarse y descansar."
      }
    ],
    en: [
      {
        question: "Where does the Saona tour depart from?",
        answer: "Departure is from Bayahibe or La Romana. Depending on the schedule, the route combines speedboat and catamaran."
      },
      {
        question: "Is lunch and drinks included?",
        answer: "Yes, buffet lunch and basic drinks are included. Final inclusions are shown clearly before checkout."
      },
      {
        question: "Is there free beach time?",
        answer: "Yes, you have beach time to swim and relax."
      }
    ],
    fr: [
      {
        question: "D ou part le tour Ile Saona?",
        answer: "Depart depuis Bayahibe ou La Romana. Selon l horaire, le parcours combine bateau rapide et catamaran."
      },
      {
        question: "Dejeuner et boissons inclus?",
        answer: "Oui, dejeuner buffet et boissons de base inclus. Le detail final des inclusions apparait avant paiement."
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
        question: "¿Qué incluye el día en Samaná y Cayo Levantado?",
        answer: "Incluye transporte ida y vuelta, parada en Cascada El Limon, tiempo de playa en Cayo Levantado y almuerzo."
      },
      {
        question: "Cuánto dura el viaje desde Punta Cana?",
        answer: "Es un tour de día completo con salida temprano y regreso en la tarde."
      },
      {
        question: "Es apto para familias?",
        answer: "Sí, es una excursión tranquila con ritmo moderado."
      }
    ],
    en: [
      {
        question: "What is included in the Samana and Cayo Levantado day?",
        answer: "Round-trip transport, El Limon Waterfall stop, beach time in Cayo Levantado and lunch are included."
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
        answer: "Transfert aller-retour, arret a la cascade El Limon, temps de plage a Cayo Levantado et dejeuner inclus."
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
        answer: "Sí. Es una salida en catamarán con música, open bar y parada para snorkel en zona segura."
      },
      {
        question: "¿Hay recogida en hotel?",
        answer: "Confirmamos pickup en Punta Cana/Bávaro después de reservar."
      },
      {
        question: "¿Qué llevar?",
        answer: "Lleva traje de baño, toalla, protector solar y ropa ligera. Si quieres extras o fotos, lleva efectivo opciónal."
      }
    ],
    en: [
      {
        question: "Is it a party boat with snorkel?",
        answer: "Yes. It is a catamaran trip with music, open bar and a dedicated snorkel stop in a safe area."
      },
      {
        question: "Is hotel pickup included?",
        answer: "Pickup in Punta Cana/Bavaro is confirmed after booking."
      },
      {
        question: "What should I bring?",
        answer: "Bring swimsuit, towel, sunscreen and light clothes. Optional cash is useful for extras and photos."
      }
    ],
    fr: [
      {
        question: "C est un party boat avec snorkel?",
        answer: "Oui. Sortie catamaran avec musique, open bar et arret snorkel dans une zone adaptee."
      },
      {
        question: "La prise en charge hotel est incluse?",
        answer: "La prise en charge a Punta Cana/Bavaro est confirmee apres reservation."
      },
      {
        question: "Que faut-il apporter?",
        answer: "Prenez maillot, serviette, creme solaire et vetements legers. Cash optionnel pour extras et photos."
      }
    ]
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: [
      {
        question: "En que temporada se ven las ballenas?",
        answer: "La mejor ventana suele ser de enero a marzo, cuando Samana recibe la mayor presencia de ballenas jorobadas."
      },
      {
        question: "Incluye Cascada El Limon?",
        answer: "Sí, incluye visita a la cascada y Cayo Levantado."
      },
      {
        question: "Es un tour largo?",
        answer: "Sí, es jornada completa. Se sale temprano desde Punta Cana y se regresa en la tarde-noche."
      }
    ],
    en: [
      {
        question: "What is the whale season in Samana?",
        answer: "Peak season is usually January to March, when humpback whale activity in Samana is strongest."
      },
      {
        question: "Is El Limon Waterfall included?",
        answer: "Yes, it includes the waterfall and Cayo Levantado."
      },
      {
        question: "Is it a long tour?",
        answer: "Yes, it is a full-day experience with early departure from Punta Cana and return later in the day."
      }
    ],
    fr: [
      {
        question: "Quelle est la saison des baleines a Samana?",
        answer: "La haute saison est en general de janvier a mars, quand l activite des baleines est la plus forte a Samana."
      },
      {
        question: "La cascade El Limon est-elle incluse?",
        answer: "Oui, la cascade et Cayo Levantado sont inclus."
      },
      {
        question: "C est une longue excursion?",
        answer: "Oui, excursion a la journee complete avec depart matinal depuis Punta Cana et retour en fin de journee."
      }
    ]
  },
  "parasailing-punta-cana": {
    es: [
      {
        question: "Cuánto dura el vuelo?",
        answer: "El vuelo suele durar entre 10 y 12 minutos en el aire, mas el tiempo de navegacion y preparacion."
      },
      {
        question: "Es seguro?",
        answer: "Equipo certificado, briefing y despegue desde lancha."
      },
      {
        question: "Pueden volar dos personas?",
        answer: "Sí, se puede volar en pareja o trío según peso combinado y condiciones del viento."
      }
    ],
    en: [
      {
        question: "How long is the flight?",
        answer: "The parasailing flight is usually 10-12 minutes in the air, plus setup and boat navigation time."
      },
      {
        question: "Is it safe?",
        answer: "Certified gear, safety briefing and boat takeoff."
      },
      {
        question: "Can two people fly?",
        answer: "Yes, double and sometimes triple flights are possible depending on total weight and wind conditions."
      }
    ],
    fr: [
      {
        question: "Combien de temps dure le vol?",
        answer: "Le vol dure en general 10 a 12 minutes, plus le temps de preparation et de navigation en bateau."
      },
      {
        question: "Est-ce securise?",
        answer: "Equipement certifie, briefing et decollage depuis le bateau."
      },
      {
        question: "Peut-on voler a deux?",
        answer: "Oui, vol double et parfois triple selon le poids combine et les conditions meteo."
      }
    ]
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: [
      {
        question: "Incluye entrada y transporte?",
        answer: "Sí, incluye entradas, transporte y tiempo real en playa. Veras el detalle final antes de confirmar."
      },
      {
        question: "Que tipo de barco se usa?",
        answer: "Lancha rápida y catamarán según el itinerario."
      },
      {
        question: "Hay pickup en hoteles?",
        answer: "Sí, coordinamos recogida en hoteles de Punta Cana y Bavaro con horario confirmado despues de reservar."
      }
    ],
    en: [
      {
        question: "Does it include ticket and transport?",
        answer: "Yes, entry tickets, transport and real beach time are included. Final details are shown before checkout."
      },
      {
        question: "What kind of boat is used?",
        answer: "Speedboat and catamaran depending on the itinerary."
      },
      {
        question: "Is hotel pickup included?",
        answer: "Yes, we coordinate hotel pickup in Punta Cana/Bavaro and confirm your exact time after booking."
      }
    ],
    fr: [
      {
        question: "Billet et transport inclus?",
        answer: "Oui, billets, transport et vrai temps de plage inclus. Le detail final apparait avant validation."
      },
      {
        question: "Quel type de bateau est utilise?",
        answer: "Bateau rapide et catamaran selon l itineraire."
      },
      {
        question: "La prise en charge hotel est incluse?",
        answer: "Oui, nous confirmons la prise en charge hotel a Punta Cana/Bavaro apres la reservation."
      }
    ]
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: [
      {
        question: "Que lugares se visitan en el safari cultural?",
        answer: "Visitamos zonas rurales, pueblos locales, casa típica y paradas para degustaciones dominicanas."
      },
      {
        question: "¿Incluye guía local?",
        answer: "Sí, guía y transporte incluidos."
      },
      {
        question: "Es recomendable para familias?",
        answer: "Sí, es una experiencia tranquila y educativa, recomendada para familias y viajeros de ritmo relajado."
      }
    ],
    en: [
      {
        question: "What places are visited on the cultural safari?",
        answer: "The route includes countryside areas, local villages, a traditional home and Dominican tastings."
      },
      {
        question: "Is a local guide included?",
        answer: "Yes, guide and transport are included."
      },
      {
        question: "Is it family friendly?",
        answer: "Yes, it is a relaxed and educational tour, great for families and travelers who prefer a calm pace."
      }
    ],
    fr: [
      {
        question: "Quels lieux sont visites pendant le safari culturel?",
        answer: "Le parcours inclut campagne, villages locaux, maison traditionnelle et degustations dominicaines."
      },
      {
        question: "Un guide local est-il inclus?",
        answer: "Oui, guide et transport inclus."
      },
      {
        question: "C est adapte aux familles?",
        answer: "Oui, c est une excursion culturelle calme, ideale pour familles et voyageurs qui veulent un rythme doux."
      }
    ]
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: [
      {
        question: "Que incluye la visita a Santo Domingo?",
        answer: "Incluye recorrido por Zona Colonial, paradas históricas y acompañamiento de guía local durante la visita."
      },
      {
        question: "Incluye almuerzo?",
        answer: "Sí, almuerzo tipico incluido."
      },
      {
        question: "Cuánto dura el viaje?",
        answer: "Es día completo. La salida es temprano desde Punta Cana y el regreso es en la tarde."
      }
    ],
    en: [
      {
        question: "What is included in the Santo Domingo visit?",
        answer: "It includes a Colonial Zone tour, key historical stops and a local guide throughout the visit."
      },
      {
        question: "Is lunch included?",
        answer: "Yes, a local lunch is included."
      },
      {
        question: "How long is the trip?",
        answer: "It is a full-day trip, with early departure from Punta Cana and return in the afternoon."
      }
    ],
    fr: [
      {
        question: "Que comprend la visite de Saint-Domingue?",
        answer: "La visite comprend Zone Coloniale, arrets historiques principaux et accompagnement par un guide local."
      },
      {
        question: "Le dejeuner est-il inclus?",
        answer: "Oui, dejeuner local inclus."
      },
      {
        question: "Quelle est la duree du voyage?",
        answer: "C est une excursion a la journee complete, avec depart matinal depuis Punta Cana et retour l apres-midi."
      }
    ]
  },
  "party-boat-sosua": {
    es: [
      {
        question: "Cuánto cuesta el Sosua Party Boat?",
        answer: "La salida compartida inicia en USD 65 por persona. Si viajas en grupo, también puedes elegir opción privada o VIP."
      },
      {
        question: "El tour incluye open bar y snorkel?",
        answer: "Sí, incluye open bar, música a bordo, parada de snorkel y tiempo para disfrutar la bahía de Sosúa."
      },
      {
        question: "Hay pickup desde Puerto Plata, Amber Cove o Taino Bay?",
        answer: "Sí. Coordinamos recogida en Puerto Plata, Amber Cove y Taino Bay según horario, tráfico y disponibilidad del día."
      }
    ],
    en: [
      {
        question: "How much is the Sosua Party Boat?",
        answer: "Shared trips start at USD 65 per person. Private and VIP formats are available for groups who want a custom setup."
      },
      {
        question: "Does it include open bar and snorkeling?",
        answer: "Yes, it includes open bar, onboard music, a snorkeling stop, and swim time in Sosua Bay."
      },
      {
        question: "Is pickup available from Puerto Plata, Amber Cove, or Taino Bay?",
        answer: "Yes. We coordinate pickup from Puerto Plata, Amber Cove and Taino Bay based on schedule and same-day availability."
      }
    ],
    fr: [
      {
        question: "Combien coute le Sosua Party Boat?",
        answer: "Le depart partage commence a USD 65 par personne. Des versions privees et VIP sont aussi disponibles pour les groupes."
      },
      {
        question: "Le tour inclut-il open bar et snorkeling?",
        answer: "Oui, open bar, musique a bord, arret snorkeling et temps de baignade dans la baie de Sosua sont inclus."
      },
      {
        question: "Pickup possible depuis Puerto Plata, Amber Cove ou Taino Bay?",
        answer: "Oui. Nous coordonnons la prise en charge depuis Puerto Plata, Amber Cove et Taino Bay selon horaire et disponibilite."
      }
    ]
  },
  "scape-park-full-admission-punta-cana": {
    es: [
      {
        question: "¿Qué incluye Scape Park Full Admission?",
        answer: "Incluye Hoyo Azul, zip lines, cuevas, Saltos Azules, Faunaland, transporte ida y vuelta y almuerzo buffet."
      },
      {
        question: "¿Es una buena opción para familias?",
        answer: "Sí. Es la opción más equilibrada para familias y grupos porque combina naturaleza, agua y actividades de distinta intensidad en un mismo día."
      },
      {
        question: "¿Cuánto dura la experiencia?",
        answer: "La duración estimada es {durationLabel}, contando parque, traslados y tiempo para almorzar."
      }
    ],
    en: [
      {
        question: "What is included in Scape Park Full Admission?",
        answer: "It includes Hoyo Azul, zip lines, caves, Blue Jumps, Faunaland, round-trip transport and buffet lunch."
      },
      {
        question: "Is it a good option for families?",
        answer: "Yes. It is the most balanced choice for families and groups because it combines nature, water and different activity levels in one day."
      },
      {
        question: "How long does the experience last?",
        answer: "Estimated duration is {durationLabel}, including park time, transfers and buffet lunch."
      }
    ],
    fr: [
      {
        question: "Que comprend Scape Park Full Admission?",
        answer: "Hoyo Azul, tyroliennes, grottes, Saltos Azules, Faunaland, transport aller-retour et buffet sont inclus."
      },
      {
        question: "Est-ce une bonne option pour les familles?",
        answer: "Oui. C est l option la plus equilibree pour les familles et groupes car elle combine nature, eau et activites de differente intensite."
      },
      {
        question: "Quelle est la duree de l experience?",
        answer: "La duree estimee est de {durationLabel}, avec parc, transferts et temps pour dejeuner."
      }
    ]
  },
  "scape-park-sunshine-cruise-punta-cana": {
    es: [
      {
        question: "Que agrega Sunshine Cruise al Scape Park completo?",
        answer: "Agrega un catamarán al final del parque con snorkel, barra libre y parada en la piscina natural de Juanillo."
      },
      {
        question: "Es mejor que Full Admission normal?",
        answer: "Si quieres selva y mar en el mismo día, esta es la mejora más completa. Si solo quieres parque, Full Admission suele ser suficiente."
      },
      {
        question: "Incluye almuerzo y transporte?",
        answer: "Sí, incluye transporte ida y vuelta y almuerzo buffet, ademas del crucero Sunshine."
      }
    ],
    en: [
      {
        question: "What does Sunshine Cruise add to full Scape Park access?",
        answer: "It adds a catamaran after the park activities, with snorkel, open bar and a stop at Juanillo natural pool."
      },
      {
        question: "Is it better than regular Full Admission?",
        answer: "If you want both jungle and sea in one day, this is the strongest upgrade. If you only want the park, Full Admission is usually enough."
      },
      {
        question: "Does it include lunch and transport?",
        answer: "Yes. It includes round-trip transport, buffet lunch and the Sunshine cruise experience."
      }
    ],
    fr: [
      {
        question: "Que rajoute Sunshine Cruise au Scape Park complet?",
        answer: "Un catamaran apres le parc avec snorkel, open bar et arret a la piscine naturelle de Juanillo."
      },
      {
        question: "Est-ce mieux que le Full Admission classique?",
        answer: "Si vous voulez jungle et mer le meme jour, c est la meilleure evolution. Si vous voulez seulement le parc, Full Admission suffit souvent."
      },
      {
        question: "Le dejeuner et le transport sont-ils inclus?",
        answer: "Oui. Le transport aller-retour, le buffet et le Sunshine cruise sont inclus."
      }
    ]
  },
  "scape-park-buggies-punta-cana": {
    es: [
      {
        question: "Que incluye Scape Park + Buggies?",
        answer: "Incluye el acceso completo al parque mas una ruta en buggy 4x4 por senderos exclusivos dentro de Cap Cana."
      },
      {
        question: "Para quien conviene este combo?",
        answer: "Es el mejor formato para viajeros que priorizan accion y quieren sumar conduccion off-road al parque."
      },
      {
        question: "Hay equipo de seguridad incluido?",
        answer: "Sí, el equipo de seguridad esta incluido junto con transporte y almuerzo buffet."
      }
    ],
    en: [
      {
        question: "What is included in Scape Park + Buggies?",
        answer: "It includes full park access plus a 4x4 buggy route on exclusive Cap Cana trails."
      },
      {
        question: "Who is this combo best for?",
        answer: "It is the best fit for travelers who want action first and want to add off-road driving to the park day."
      },
      {
        question: "Is safety gear included?",
        answer: "Yes. Safety gear is included together with transport and buffet lunch."
      }
    ],
    fr: [
      {
        question: "Que comprend Scape Park + Buggies?",
        answer: "L acces complet au parc plus un parcours buggy 4x4 sur des pistes exclusives de Cap Cana."
      },
      {
        question: "Pour qui ce combo est-il ideal?",
        answer: "Pour les voyageurs qui veulent surtout de l action et ajouter la conduite off-road a la journee de parc."
      },
      {
        question: "L equipement de securite est-il inclus?",
        answer: "Oui. L equipement de securite, le transport et le buffet sont inclus."
      }
    ]
  },
  "juanillo-vip-scape-park-punta-cana": {
    es: [
      {
        question: "Qué hace diferente a Juanillo VIP?",
        answer: "Es la opción más exclusiva: Hoyo Azul con prioridad, catamarán premium, Juanillo Beach Club y almuerzo superior."
      },
      {
        question: "¿Es una excursión de lujo real?",
        answer: "Sí. Esta pensada para viajeros que quieren menos densidad, mejor servicio y una experiencia mas premium en Cap Cana."
      },
      {
        question: "Incluye snorkel y bebidas premium?",
        answer: "Sí, incluye navegación con bebidas premium y snorkel durante la salida en catamarán."
      }
    ],
    en: [
      {
        question: "What makes Juanillo VIP different?",
        answer: "It is the most exclusive option: priority Hoyo Azul access, premium catamaran, Juanillo Beach Club and elevated lunch."
      },
      {
        question: "Is it a real luxury excursion?",
        answer: "Yes. It is designed for travelers who want less crowding, stronger service and a more premium Cap Cana day."
      },
      {
        question: "Does it include snorkel and premium drinks?",
        answer: "Yes. The catamaran segment includes premium drinks and snorkel."
      }
    ],
    fr: [
      {
        question: "Qu est-ce qui rend Juanillo VIP different?",
        answer: "C est l option la plus exclusive : acces prioritaire a Hoyo Azul, catamaran premium, Juanillo Beach Club et dejeuner superieur."
      },
      {
        question: "Est-ce une vraie excursion luxe?",
        answer: "Oui. Elle vise les voyageurs qui veulent moins de foule, un meilleur service et une journee plus premium a Cap Cana."
      },
      {
        question: "Le snorkel et les boissons premium sont-ils inclus?",
        answer: "Oui. La partie catamaran comprend boissons premium et snorkel."
      }
    ]
  },
  "scape-park-punta-cana": {
    es: [
      {
        question: "¿Cuál opción de Scape Park me conviene más?",
        answer: "Full Admission es la base más equilibrada. Sunshine Cruise agrega mar y catamarán, Buggies suma adrenalina off-road, y Juanillo VIP es la opción más exclusiva."
      },
      {
        question: "Qué debo saber si estoy hospedado en Bayahibe o La Romana?",
        answer: "Para hoteles en Bayahibe o La Romana la recogida suele operar solo martes y sábados, y puede aplicar suplemento de transporte según hotel."
      },
      {
        question: "A que hora termina el tour y como funcionan las actividades especiales?",
        answer: "La operación suele arrancar por la mañana y el regreso sale normalmente entre 03:30 PM y 04:30 PM, con llegada al hotel entre 05:00 PM y 06:00 PM. Los buggies se asignan por turnos al llegar, Sunshine Cruise suele operar al final del día y Juanillo VIP lleva un ritmo más relajado."
      }
    ],
    en: [
      {
        question: "Which Scape Park option fits me best?",
        answer: "Full Admission is the balanced base. Sunshine Cruise adds sea and catamaran, Buggies adds off-road adrenaline, and Juanillo VIP is the most exclusive option."
      },
      {
        question: "What should I know if I stay in Bayahibe or La Romana?",
        answer: "For hotels in Bayahibe or La Romana, pickup usually runs only on Tuesdays and Saturdays, and an added transport supplement may apply depending on the hotel."
      },
      {
        question: "What time does the day end and how do the special activities run?",
        answer: "Operations usually start in the morning and return transport often leaves between 3:30 PM and 4:30 PM, with hotel arrival between 5:00 PM and 6:00 PM. Buggies are assigned in time slots at the counter, Sunshine Cruise usually runs at the end of the day, and Juanillo VIP follows a more relaxed flow."
      }
    ],
    fr: [
      {
        question: "Quelle option Scape Park me convient le mieux?",
        answer: "Full Admission est la base la plus equilibree. Sunshine Cruise ajoute mer et catamaran, Buggies apporte plus d adrenaline, et Juanillo VIP est l option la plus exclusive."
      },
      {
        question: "Que faut-il savoir si je loge a Bayahibe ou La Romana?",
        answer: "Pour les hotels de Bayahibe ou La Romana, la prise en charge fonctionne generalement seulement mardi et samedi, et un supplement transport peut s appliquer selon l hotel."
      },
      {
        question: "A quelle heure se termine la journee et comment fonctionnent les activites speciales?",
        answer: "L operation commence generalement le matin et le retour part souvent entre 15h30 et 16h30, avec arrivee hotel entre 17h00 et 18h00. Les buggies sont attribues par tour au comptoir, Sunshine Cruise se fait souvent en fin de journee et Juanillo VIP suit un rythme plus detendu."
      }
    ]
  }
  ,
  "private-buggy-tour-cenote-swim-dominican-lunch": {
    es: [
      {
        question: "Que incluye este buggy privado en Punta Cana?",
        answer: "Incluye buggy privado para tu grupo, guía, parada para baño en cenote o río, almuerzo dominicano, una bebida y fotos del recorrido."
      },
      {
        question: "¿Es una excursión compartida o privada?",
        answer: "Es una experiencia privada. No se mezcla tu grupo con otros viajeros durante la salida."
      },
      {
        question: "Que debo llevar para esta experiencia?",
        answer: "Recomendamos ropa cómoda, ropa de baño, toalla, protector solar y calzado que puedas usar en terreno off-road y zonas con agua."
      }
    ],
    en: [
      {
        question: "What is included in this private buggy tour in Punta Cana?",
        answer: "It includes a private buggy for your group, guide, cenote or river swim stop, Dominican lunch, one drink, and photos of the experience."
      },
      {
        question: "Is this a shared or private excursion?",
        answer: "It is a private experience. Your group is not mixed with other travelers during the tour."
      },
      {
        question: "What should I bring for this experience?",
        answer: "We recommend comfortable clothes, swimwear, towel, sunscreen, and shoes suitable for off-road terrain and water stops."
      }
    ],
    fr: [
      {
        question: "Que comprend ce tour prive en buggy a Punta Cana?",
        answer: "Le tour comprend buggy prive pour votre groupe, guide, arret baignade en cenote ou riviere, dejeuner dominicain, une boisson et photos de l experience."
      },
      {
        question: "Est-ce une excursion partagee ou privee?",
        answer: "C est une experience privee. Votre groupe n est pas melange avec d autres voyageurs."
      },
      {
        question: "Que faut-il apporter pour cette experience?",
        answer: "Nous recommandons vetements confortables, maillot de bain, serviette, creme solaire et chaussures adaptees au terrain off-road et a l eau."
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

const splitScapeOptionDescription = (description?: string | null) => {
  const text = description?.replace(/\s+/g, " ").trim();
  if (!text) {
    return {
      summary: "",
      schedule: "",
      specialOps: "",
      bayahibe: "",
      returnWindow: "",
      notes: ""
    };
  }

  const sentences = text.split(/(?<=\.)\s+/).map((part) => part.trim()).filter(Boolean);
  let summary = "";
  let schedule = "";
  let specialOps = "";
  let bayahibe = "";
  let returnWindow = "";
  const notes: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (!summary) {
      summary = sentence;
      continue;
    }
    if (!schedule && (lower.includes("opera de") || lower.includes("disponible solo") || lower.includes("recogida aproximada"))) {
      schedule = sentence;
      continue;
    }
    if (!specialOps && (lower.includes("turnos de buggy") || lower.includes("sunshine cruise suele") || lower.includes("itinerario suele ser mas relajado"))) {
      specialOps = sentence;
      continue;
    }
    if (!bayahibe && (lower.includes("bayahibe") || lower.includes("la romana"))) {
      bayahibe = sentence;
      continue;
    }
    if (!returnWindow && (lower.includes("regreso normalmente") || lower.includes("regreso suele") || lower.includes("llegada al hotel"))) {
      returnWindow = sentence;
      continue;
    }
    notes.push(sentence);
  }

  return {
    summary,
    schedule,
    specialOps,
    bayahibe,
    returnWindow,
    notes: notes.join(" ")
  };
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
        "Comparar excursiones por precio, duración y categoría.",
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

  return links;
};

const buildPracticalInfo = (locale: Locale, slug: string) => {
  const isBuggy = slug.includes("buggy") || slug.includes("atv");
  const whatToBring = isBuggy
    ? localeLabel(
        locale,
        ["Ropa que se pueda ensuciar", "Toalla y cambio de ropa", "Protector solar", "Calzado cerrado o deportivo"].join(";"),
        ["Clothes you can get dirty", "Towel and extra clothes", "Sunscreen", "Closed shoes or sneakers"].join(";"),
        ["Vetements qui peuvent se salir", "Serviette et vetements de rechange", "Creme solaire", "Chaussures fermees ou baskets"].join(";")
      )
    : localeLabel(
        locale,
        ["Toalla", "Protector solar", "Efectivo opciónal para extras", "Documento de identidad"].join(";"),
        ["Towel", "Sunscreen", "Optional cash for extras", "ID document"].join(";"),
        ["Serviette", "Creme solaire", "Cash optionnel pour extras", "Piece d identite"].join(";")
      );

  const restrictions = isBuggy
    ? localeLabel(
        locale,
        ["No apto para embarazadas", "Edad minima para conducir: 18", "No recomendado para lesiones de espalda severas"].join(";"),
        ["Not suitable for pregnant travelers", "Minimum driving age: 18", "Not recommended for severe back injuries"].join(";"),
        ["Non adapte aux femmes enceintes", "Age minimum pour conduire : 18 ans", "Non recommande pour lesions severes du dos"].join(";")
      )
    : localeLabel(
        locale,
        ["Sujeto a condiciones del clima", "Horarios pueden variar por operación local", "Seguir siempre indicaciones del guía"].join(";"),
        ["Weather conditions may affect schedule", "Timings can vary due to local operations", "Always follow guide instructions"].join(";"),
        ["Les conditions meteo peuvent affecter l horaire", "Les horaires peuvent varier selon l operation locale", "Suivre les instructions du guide"].join(";")
      );

  return {
    whatToBring: whatToBring.split(";").map((item) => item.trim()).filter(Boolean),
    restrictions: restrictions.split(";").map((item) => item.trim()).filter(Boolean)
  };
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
  agencyLink?: string;
  from?: string;
  option?: string;
};

type TourDetailProps = {
  params: Promise<{
    slug?: string;
  }>;
  searchParams?: Promise<TourDetailSearchParams>;
  locale: Locale;
  presentationMode?: "default" | "discovery";
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

  const normalizedLabel = formatDurationDisplay(trimmed, "4 hours");
  const normalizedMatch = normalizedLabel.match(/^(\d+(?:[.,]\d+)?)\s*(.+)$/);
  if (normalizedMatch) {
    return { value: normalizedMatch[1], unit: normalizedMatch[2].trim() };
  }

  return { value: "4", unit: "hour" };
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
    description: "Degustación de café, cacao y tabaco en casa típica."
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

export default async function TourDetailPage({
  params,
  searchParams,
  locale,
  presentationMode = "default"
}: TourDetailProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hotelSlugFromQuery = resolvedSearchParams?.hotelSlug;
  const bookingCodeFromQuery = resolvedSearchParams?.bookingCode;
  const agencyLinkFromQuery = resolvedSearchParams?.agencyLink;
  const optionIdFromQuery = resolvedSearchParams?.option;
  const originHotel =
    hotelSlugFromQuery !== undefined
      ? await prisma.location.findUnique({
          where: { slug: hotelSlugFromQuery }
        })
      : null;
  if (!slug) notFound();
  const normalizedSlug = slug.toLowerCase();
  const legacyDirectPath = LEGACY_TOUR_SLUG_REDIRECTS[normalizedSlug];
  if (legacyDirectPath) {
    redirect(toLocalizedPath(legacyDirectPath, locale));
  }
  const numericSuffixMatch = normalizedSlug.match(/^(.*)-\d+$/);
  if (numericSuffixMatch) {
    const baseSlug = numericSuffixMatch[1];
    const baseLegacyPath = LEGACY_TOUR_SLUG_REDIRECTS[baseSlug];
    if (baseLegacyPath) {
      redirect(toLocalizedPath(baseLegacyPath, locale));
    }
    redirect(toLocalizedPath("/tours", locale));
  }
  if (slug === HIDDEN_TRANSFER_SLUG) {
    redirect(toLocalizedPath("/punta-cana/premium-transfer-services", locale));
  }
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string } | null)?.id ?? null;
  const sessionUserRole = (session?.user as { role?: string } | null)?.role ?? null;
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
      productId: true,
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
        operatingDays: true,
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
            imageUrl: true,
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

  const PUBLIC_DETAIL_STATUSES = new Set(["published", "seo_only"]);
  if (!PUBLIC_DETAIL_STATUSES.has(tour.status)) notFound();

  const agencyProLink = agencyLinkFromQuery
    ? await prisma.agencyProLink.findUnique({
        where: { slug: agencyLinkFromQuery },
        select: {
          id: true,
          slug: true,
          tourId: true,
          price: true,
          note: true,
          active: true,
          AgencyUser: {
            select: {
              name: true,
              AgencyProfile: {
                select: {
                  companyName: true
                }
              }
            }
          }
        }
      })
    : null;

  if (agencyLinkFromQuery && (!agencyProLink || !agencyProLink.active || agencyProLink.tourId !== tour.id)) {
    notFound();
  }

  const agencyMode = Boolean(agencyProLink);
  const agencyProfile =
    sessionUserRole === "AGENCY" && sessionUserId
      ? await prisma.agencyProfile.findUnique({
          where: { userId: sessionUserId },
          select: { commissionPercent: true, companyName: true }
        })
      : null;
  const directAgencyMode = sessionUserRole === "AGENCY" && resolvedSearchParams?.from === "agency" && !agencyMode;
  const agencyDirectDiscountPercent = directAgencyMode
    ? Math.min(Math.max(agencyProfile?.commissionPercent ?? 20, 0), 100)
    : 0;
  const agencyDisplayName =
    agencyProLink?.AgencyUser.AgencyProfile?.companyName ??
    agencyProfile?.companyName ??
    agencyProLink?.AgencyUser.name ??
    null;

  const relatedConditions: Prisma.TourWhereInput[] = [];
  if (tour.destinationId) {
    relatedConditions.push({ destinationId: tour.destinationId });
  }

  const offerPriceMap = await getActiveOfferPriceMapForTours([{ id: tour.id, price: tour.price }]);
  const activeOffer = offerPriceMap.get(tour.id);
  const allowPublicDiscounts = !agencyProLink && !directAgencyMode;
  const preferencePrice =
    allowPublicDiscounts && discountPercent > 0 ? tour.price * (1 - discountPercent / 100) : tour.price;
  const effectiveTourPrice =
    agencyProLink
      ? agencyProLink.price
      : allowPublicDiscounts && typeof activeOffer?.finalPrice === "number"
        ? Math.min(activeOffer.finalPrice, preferencePrice)
        : preferencePrice;
  const agencyDirectNetPrice =
    directAgencyMode && agencyDirectDiscountPercent > 0
      ? Math.round(effectiveTourPrice * (1 - agencyDirectDiscountPercent / 100) * 100) / 100
      : null;
  const displayTourPrice = agencyDirectNetPrice ?? effectiveTourPrice;
  const hasActiveDiscount = allowPublicDiscounts && effectiveTourPrice < tour.price;
  const discountTag = !allowPublicDiscounts || agencyProLink
    ? null
    : activeOffer
      ? activeOffer.discountType === "PERCENT"
        ? `-${Math.round(activeOffer.discountValue)}%`
        : `-${Math.round(activeOffer.discountValue)} USD`
      : discountPercent > 0
        ? `-${discountPercent}%`
        : null;
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
  const languages = normalizeTourLanguages(tour.language);
  const locationLabel = normalizeTourLocation(tour.location);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const operatingDays = parseJsonArray<string>(tour.operatingDays);
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
  const seoOnlyHighlights = new Set(["hip hop", "hip hop party boat", "mar caribe"]);
  const visibleHighlights = highlights.filter((item) => !seoOnlyHighlights.has(item.trim().toLowerCase()));
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
  const localizedTitle = ensureLeadingCapital(translation?.title ?? tour.title);
  const heroTitle = resolveTourH1(tour.slug, locale, localizedTitle);
  const isDiscoveryMode = presentationMode === "discovery";
  const discoveryBadgeLabel = localeLabel(locale, "Ficha ProDiscovery", "ProDiscovery listing", "Fiche ProDiscovery");
  const visibleHeroTitle = isDiscoveryMode
    ? localeLabel(
        locale,
        `${heroTitle} · Opiniones y reserva`,
        `${heroTitle} · Reviews and booking`,
        `${heroTitle} · Avis et reservation`
      )
    : heroTitle;
  const localizedSubtitle = translation?.subtitle ?? tour.subtitle ?? "";
  const localizedShortDescription = translation?.shortDescription ?? tour.shortDescription;
  const localizedDescription = translation?.description ?? tour.description;
  const durationUnitSource = translation?.durationUnit ?? durationValue.unit;
  const durationUnit = normalizeDurationUnit(durationUnitSource, locale);
  const durationLabel = `${durationValue.value} ${durationUnit}`;
  const priceLabel = `$${displayTourPrice.toFixed(0)} USD`;
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
    const localizedRelatedTitle = ensureLeadingCapital(item.translations?.[0]?.title ?? item.title);
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
  const commercialIntentLinks = agencyMode ? [] : buildCommercialIntentLinks(locale, tour.slug);
  const practicalInfo = buildPracticalInfo(locale, tour.slug);
  const isCocoBongoTour = COCO_BONGO_COMPARISON_TOURS.has(tour.slug);
  const isScapeParkTour = SCAPE_PARK_TOURS.has(tour.slug);
  const selectedScapeOptionId =
    (optionIdFromQuery &&
    tour.options?.some((option) => option.id === optionIdFromQuery)
      ? optionIdFromQuery
      : null) ?? null;
  const currentScapeOptionId =
    selectedScapeOptionId ?? tour.options?.find((option) => option.isDefault)?.id ?? tour.options?.[0]?.id ?? null;
  const regularOption =
    tour.options?.find((option) => /regular/i.test(option.name)) ?? tour.options?.[0] ?? null;
  const goldOption =
    tour.options?.find((option) => /gold/i.test(option.name)) ?? tour.options?.[1] ?? null;
  const drinkPackOption = tour.options?.find((option) => /drink pack/i.test(option.name)) ?? null;
  const scapeProducts = (tour.options ?? []).map((option) => {
    const optionKey = (option.type ?? option.name).toLowerCase();
    const structuredDescription = splitScapeOptionDescription(option.description);
    const summary = option.description?.split(/(?<=[.!?])\s+/)[0]?.trim() || "";
    let focus = localeLabel(locale, "Opción disponible", "Available option", "Option disponible");
    let detail = summary;

    if (optionKey.includes("full-admission")) {
      focus = localeLabel(locale, "Variedad y mejor relacion valor", "Best overall value and variety", "Meilleur rapport valeur-variete");
      detail = localeLabel(locale, "Hoyo Azul, tirolesas, cuevas y aventura en un solo pase.", "Hoyo Azul, zip lines, caves and adventure in one pass.", "Hoyo Azul, tyroliennes, grottes et aventure en un seul pass.");
    } else if (optionKey.includes("sunshine-cruise")) {
      focus = localeLabel(locale, "Selva + mar el mismo día", "Jungle + sea in one day", "Jungle + mer le meme jour");
      detail = localeLabel(locale, "Parque completo, catamarán, snorkel y barra libre.", "Full park, catamaran, snorkel and open bar.", "Parc complet, catamaran, snorkel et open bar.");
    } else if (optionKey.includes("buggies")) {
      focus = localeLabel(locale, "Mas adrenalina", "More adrenaline", "Plus d adrenaline");
      detail = localeLabel(locale, "Parque completo con circuito 4x4 en buggy por la jungla.", "Full park plus a 4x4 buggy route through the jungle.", "Parc complet avec parcours buggy 4x4 dans la jungle.");
    } else if (optionKey.includes("juanillo-vip")) {
      focus = localeLabel(locale, "La opción premium", "The premium option", "L option premium");
      detail = localeLabel(locale, "Catamaran, Juanillo Beach Club, almuerzo y Blue Hole.", "Catamaran, Juanillo Beach Club, lunch and Blue Hole.", "Catamaran, Juanillo Beach Club, dejeuner et Blue Hole.");
    }

    return {
      slug: option.id,
      title: option.name,
      price:
        directAgencyMode && agencyDirectDiscountPercent > 0
          ? Math.round((option.pricePerPerson ?? effectiveTourPrice) * (1 - agencyDirectDiscountPercent / 100) * 100) / 100
          : option.pricePerPerson ?? effectiveTourPrice,
      focus,
      detail,
      image: option.imageUrl || resolveTourHeroImage(tour),
      isCurrent: option.id === currentScapeOptionId,
      structuredDescription
    };
  });
  const mapQuery = encodeURIComponent(`${heroTitle} ${locationLabel}`);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const travelerGallery = [...gallery].reverse().slice(0, 6);

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
  const heroReserveCta = isDiscoveryMode
    ? localeLabel(locale, "Comparar y reservar", "Compare and book", "Comparer et reserver")
    : translate(locale, "tour.hero.cta.reserve");
  const heroGalleryCta = translate(locale, "tour.hero.cta.gallery");
  const floatingButtonLabel = isDiscoveryMode
    ? localeLabel(locale, "Tarifa ProDiscovery", "ProDiscovery rate", "Tarif ProDiscovery")
    : translate(locale, "tour.booking.floating.label");
  const floatingButtonCta = isDiscoveryMode
    ? localeLabel(locale, "Comparar y reservar", "Compare and book", "Comparer et reserver")
    : translate(locale, "tour.booking.floating.button");
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
  const featuredReviewHighlights = [...reviewHighlights]
    .sort((left, right) => right.rating - left.rating)
    .slice(0, 2);


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
  const schemaImages = [heroImageAbsolute, ...galleryImagesAbsolute].slice(0, 10);
  const tourUrl = agencyMode
    ? `${PROACTIVITIS_URL}/agency-pro/${agencyLinkFromQuery}`
    : `${PROACTIVITIS_URL}${locale === "es" ? "" : `/${locale}`}/tours/${tour.slug}`;
  const toursHubUrl = `${PROACTIVITIS_URL}${locale === "es" ? "/tours" : `/${locale}/tours`}`;
  const schemaImageObjects = schemaImages.map((image, index) => ({
    "@type": "ImageObject",
    "@id": `${tourUrl}#image-${index + 1}`,
    contentUrl: image,
    url: image,
    caption: `${heroTitle} - ${index + 1}`
  }));
  const priceValidUntil = getPriceValidUntil();
  const touristTypeFallback = categories.find((category) =>
    ["Family", "Adventure", "Couples"].includes(category)
  );
  const schemaKeywords = TOUR_KEYWORDS_BY_SLUG[tour.slug]?.[locale]
    ?? (PUNTA_CANA_TOP_TOURS.has(tour.slug)
      ? TOUR_SCHEMA_KEYWORDS[locale]
      : NORTH_COAST_PARTY_BOAT_TOURS.has(tour.slug)
        ? NORTH_COAST_SCHEMA_KEYWORDS[locale]
        : undefined);
  const aggregateRating =
    detailReviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(ratingValue.toFixed(1)),
          reviewCount: detailReviewCount,
          bestRating: "5"
        }
      : undefined;
  const availableLanguages = normalizeTourLanguages(tour.language);
  const schemaAdditionalProperty =
    tour.slug === "private-buggy-tour-cenote-swim-dominican-lunch"
      ? [
          { "@type": "PropertyValue", name: "Tour format", value: localeLabel(locale, "Privado", "Private", "Prive") },
          { "@type": "PropertyValue", name: "Pickup", value: localeLabel(locale, "Disponible tras confirmar reserva", "Available after booking confirmation", "Disponible apres confirmation") },
          { "@type": "PropertyValue", name: "Swim stop", value: localeLabel(locale, "Cenote o rio natural", "Cenote or natural river", "Cenote ou riviere naturelle") },
          { "@type": "PropertyValue", name: "Meal included", value: localeLabel(locale, "Almuerzo dominicano", "Dominican lunch", "Dejeuner dominicain") },
          { "@type": "PropertyValue", name: "Media included", value: localeLabel(locale, "Fotos y videos", "Photos and videos", "Photos et videos") },
          { "@type": "PropertyValue", name: "Minimum driver age", value: "18+" }
        ]
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
    sku: tour.slug,
    mpn: tour.productId,
    slogan:
      tour.slug === "private-buggy-tour-cenote-swim-dominican-lunch"
        ? localeLabel(
            locale,
            "Buggy privado, baño en cenote y almuerzo dominicano real",
            "Private buggy, cenote swim, and real Dominican lunch",
            "Buggy prive, baignade en cenote et vrai dejeuner dominicain"
          )
        : undefined,
    areaServed: {
      "@type": "AdministrativeArea",
      name: locationLabel
    },
    availableLanguage: availableLanguages,
    isFamilyFriendly: true,
    audience: {
      "@type": "Audience",
      audienceType: localeLabel(locale, "Parejas, amigos y grupos privados", "Couples, friends, and private groups", "Couples, amis et groupes prives")
    },
    offers: {
      "@type": "Offer",
      "@id": `${tourUrl}#offer`,
      url: tourUrl,
      price: effectiveTourPrice,
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      availabilityStarts: new Date().toISOString(),
      seller: PROACTIVITIS_LOCALBUSINESS,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: effectiveTourPrice,
        priceCurrency: "USD"
      },
      eligibleRegion: {
        "@type": "Country",
        name: "Dominican Republic"
      },
      itemCondition: "https://schema.org/NewCondition",
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
      acceptedPaymentMethod: ["https://schema.org/CreditCard", "https://schema.org/ByBankTransferInAdvance"]
    },
    sameAs: SAME_AS_URLS,
    ...(schemaKeywords ? { keywords: schemaKeywords.join(", ") } : {}),
    ...(schemaAdditionalProperty ? { additionalProperty: schemaAdditionalProperty } : {}),
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
    availableLanguage: availableLanguages,
    ...(schemaAdditionalProperty ? { additionalProperty: schemaAdditionalProperty } : {}),
    itinerary: visualTimeline.slice(0, 6).map((stop, index) => ({
      "@type": "TouristAttraction",
      name: stop.title,
      description: stop.description,
      position: index + 1
    })),
    offers: {
      "@type": "Offer",
      "@id": `${tourUrl}#trip-offer`,
      url: tourUrl,
      price: effectiveTourPrice,
      priceCurrency: "USD",
      priceValidUntil,
      availability: "https://schema.org/InStock",
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
      acceptedPaymentMethod: ["https://schema.org/CreditCard", "https://schema.org/ByBankTransferInAdvance"]
    }
  };

  const mediaGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${tourUrl}#gallery`,
    name: `${heroTitle} gallery`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: schemaImageObjects.length,
    itemListElement: schemaImageObjects.map((image, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: image
    }))
  };

  const highlightsSchema =
    highlights.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${tourUrl}#highlights`,
          name: `${heroTitle} highlights`,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: Math.min(highlights.length, 8),
          itemListElement: highlights.slice(0, 8).map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item
          }))
        }
      : null;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${tourUrl}#webpage`,
    url: tourUrl,
    name: heroTitle,
    description: localizedDescription ?? shortTeaser,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${PROACTIVITIS_URL}#website`,
      name: "Proactivitis",
      url: PROACTIVITIS_URL
    },
    about: [
      { "@id": `${tourUrl}#product` },
      { "@id": `${tourUrl}#trip` }
    ],
    primaryImageOfPage: schemaImageObjects[0] ?? undefined,
    breadcrumb: { "@id": `${tourUrl}#breadcrumb` },
    ...(schemaKeywords ? { keywords: schemaKeywords.join(", ") } : {})
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${tourUrl}#breadcrumb`,
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
    basePrice: effectiveTourPrice,
    timeSlots,
    operatingDays,
    options:
      agencyMode
        ? []
        : tour.options?.map((option) => ({
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
    initialOptionId: currentScapeOptionId ?? undefined,
    discountPercent: allowPublicDiscounts ? discountPercent : 0,
    agencyLink: agencyLinkFromQuery ?? undefined,
    agencyDirectDiscountPercent
  };
  const currentTourPath = toLocalizedPath(`/tours/${tour.slug}`, locale);
  const buildTourOptionHref = (optionId: string) => {
    const params = new URLSearchParams();
    if (hotelSlugFromQuery) params.set("hotelSlug", hotelSlugFromQuery);
    if (bookingCodeFromQuery) params.set("bookingCode", bookingCodeFromQuery);
    if (agencyLinkFromQuery) params.set("agencyLink", agencyLinkFromQuery);
    if (resolvedSearchParams?.from) params.set("from", resolvedSearchParams.from);
    params.set("option", optionId);
    return `${currentTourPath}?${params.toString()}#booking`;
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
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div>
        <TourBookingWidget {...bookingWidgetProps} />
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-start gap-3 text-sm text-slate-700">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500 text-xs font-black text-emerald-600">
            +
          </span>
          <div>
            <p className="font-black text-slate-950">
              {localeLabel(locale, "Cancelación flexible", "Flexible cancellation", "Annulation flexible")}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600">
              {localeLabel(
                locale,
                "Puedes cancelar con 24 horas de antelación y recibir reembolso completo.",
                "Cancel up to 24 hours in advance for a full refund.",
                "Annulez jusqu a 24 heures a l avance pour un remboursement complet."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
  <div className="travel-surface min-h-screen overflow-x-clip pb-24 text-slate-950">
      <StructuredData data={tourSchema} />
      <StructuredData data={touristTripSchema} />
      <StructuredData data={webPageSchema} />
      <StructuredData data={mediaGallerySchema} />
      {highlightsSchema ? <StructuredData data={highlightsSchema} /> : null}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />
      {relatedToursSchema ? <StructuredData data={relatedToursSchema} /> : null}

      <section className="mx-auto max-w-[1180px] px-4 pt-6 sm:pt-8">
        {agencyMode ? (
          <div className="mb-4 rounded-[24px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-700">
                  {localeLabel(locale, "Reserva por agencia", "Agency booking", "Reservation agence")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {localeLabel(
                    locale,
                    `Oferta privada gestionada por ${agencyDisplayName ?? "tu agencia"}.`,
                    `Private offer managed by ${agencyDisplayName ?? "your agency"}.`,
                    `Offre privee geree par ${agencyDisplayName ?? "votre agence"}.`
                  )}
                </p>
              </div>
              <div className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
                {localeLabel(locale, "Tarifa acordada", "Agreed rate", "Tarif convenu")} · {priceLabel}
              </div>
            </div>
          </div>
        ) : null}
        <div className="space-y-4">
          <div className="hidden flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 lg:flex">
            <span className="rounded-full bg-slate-100 px-3 py-1 uppercase tracking-[0.18em] text-slate-700">
              {locationLabel}
            </span>
            {agencyMode ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 uppercase tracking-[0.18em] text-emerald-700">
                {agencyDisplayName ?? localeLabel(locale, "Agencia", "Agency", "Agence")}
              </span>
            ) : null}
            {isDiscoveryMode ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 uppercase tracking-[0.18em] text-sky-700">
                {discoveryBadgeLabel}
              </span>
            ) : null}
          </div>
          <div className="hidden space-y-2 lg:block">
            <h1 className="max-w-4xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {visibleHeroTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1 text-slate-950">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-amber-500"
                    fill="currentColor"
                  >
                    <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
                  </svg>
                ))}
                {detailReviewCount ? ratingValue.toFixed(1) : "0.0"}
              </span>
              <a href="#reviews" className="underline decoration-slate-300 underline-offset-4 hover:text-sky-700">
                {heroReviewsLabel}
              </a>
              <span className="text-slate-400">|</span>
              <span>
                {localeLabel(locale, "Operado por", "Operated by", "Opere par")}{" "}
                {agencyDisplayName ??
                  tour.SupplierProfile?.company ??
                  tour.SupplierProfile?.User?.name ??
                  translate(locale, "tour.booking.panel.providerFallback")}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
              {trustBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="space-y-3">
              <TourGalleryCollage
                images={gallery}
                title={heroTitle}
                fallbackImage={heroImage}
                label={heroGalleryCta}
                variant="compact"
              />
              <div className="space-y-3 lg:hidden">
                <p className="inline-flex items-center gap-2 text-sm font-black text-slate-500">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-5" />
                  </svg>
                  {localeLabel(locale, "Original Proactivitis", "Original Proactivitis", "Original Proactivitis")}
                </p>
                <h1 className="text-[2rem] font-black leading-tight text-slate-950">
                  {visibleHeroTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-800">
                  <span className="inline-flex items-center gap-0.5 text-slate-950">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="currentColor"
                      >
                        <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
                      </svg>
                    ))}
                  </span>
                  <span>{detailReviewCount ? ratingValue.toFixed(1) : "0.0"}</span>
                  <a href="#reviews" className="font-black underline underline-offset-4">
                    {heroReviewsLabel}
                  </a>
                </div>
              </div>
              <nav className="hidden rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur lg:block">
                <div className="flex gap-3 overflow-x-auto py-1 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
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
              </div>

      <section id="overview" className="mt-8">
        <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "tour.section.overview.label")}
          </p>
          <p className="text-lg text-slate-800 line-clamp-3">{shortDescriptionText ?? shortTeaser}</p>
          <div className="grid gap-5 border-t border-slate-100 pt-4 md:grid-cols-2">
            {quickInfo.map((item) => (
              <div key={item.label} className="flex gap-3">
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center text-slate-950">
                  {item.icon}
                </span>
                <div>
                  <p className="text-base font-black text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{item.value}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {featuredReviewHighlights.length ? (
            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-xl font-black text-slate-950">
                {localeLabel(
                  locale,
                  "Lo que más les gustó a los viajeros",
                  "What travelers liked most",
                  "Ce que les voyageurs ont le plus aime"
                )}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {featuredReviewHighlights.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
                    <div className="flex items-center gap-1 text-slate-950">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <svg key={index} aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm font-black">{review.rating}</span>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-base font-black text-sky-700">
                        {review.name
                          .split(" ")
                          .map((chunk) => chunk[0])
                          .slice(0, 1)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-950">{review.name}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {review.date} - {localeLabel(locale, "Reserva verificada", "Verified booking", "Reservation verifiee")}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-900">{review.quote}</p>
                  </article>
                ))}
              </div>
              <div className="mt-4 text-right">
                <a href="#reviews" className="text-sm font-black text-slate-950 underline underline-offset-4">
                  {localeLabel(locale, "Ver más reseñas", "See more reviews", "Voir plus d avis")}
                </a>
              </div>
            </div>
          ) : null}
          {visibleHighlights.length ? (
            <ul className="space-y-2 text-sm font-semibold text-slate-700">
              {visibleHighlights.map((item) => (
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
        <section className="mt-6">
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

      <section id="includes" className="mt-6">
        <div className="space-y-4 rounded-[24px] border border-slate-100 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
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
                    <span aria-hidden className="text-lg text-rose-500">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="booking" className="mt-6 lg:hidden">
        <BookingPanel />
      </section>

      {isCocoBongoTour ? (
        <section className="mt-6">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {localeLabel(locale, "Comparativa de entradas", "Ticket comparison", "Comparatif des billets")}
                </p>
                <h2 className="mt-2 text-[20px] font-semibold text-slate-900">
                  {localeLabel(
                    locale,
                    "Regular vs Gold Member: que cambia realmente",
                    "Regular vs Gold Member: what really changes",
                    "Regular vs Gold Member : ce qui change vraiment"
                  )}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">
                  {localeLabel(
                    locale,
                    "Así evitamos reservas equivocadas: la opción económica es para vivir el show en área general, mientras Gold da asiento, más espacio y bar premium.",
                    "This makes the difference clear before booking: the cheaper option is the general-standing experience, while Gold adds seating, more space and premium bar.",
                    "Cela clarifie la difference avant reservation : l option economique reste en zone generale, tandis que Gold ajoute siege, espace et bar premium."
                  )}
                </p>
              </div>
              {drinkPackOption ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-semibold">{drinkPackOption.name}</p>
                  <p>
                    {localeLabel(
                      locale,
                      "Solo disponible martes y miércoles. El widget bloquea automáticamente otras fechas.",
                      "Only available on Tuesdays and Wednesdays. The widget automatically blocks other dates.",
                      "Disponible uniquement mardi et mercredi. Le widget bloque automatiquement les autres dates."
                    )}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {regularOption ? (
                <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    {localeLabel(locale, "Opción base", "Base option", "Option de base")}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900">{regularOption.name}</h3>
                    <p className="text-xl font-black text-slate-900">
                      ${Number(regularOption.pricePerPerson ?? tour.price).toFixed(0)}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    <li>• {localeLabel(locale, "Entrada sin filas", "Skip-the-line entry", "Entree coupe-file")}</li>
                    <li>• {localeLabel(locale, "Area general, normalmente de pie", "General area, usually standing", "Zone generale, souvent debout")}</li>
                    <li>• {localeLabel(locale, "Bar abierto regular", "Regular open bar", "Open bar standard")}</li>
                    <li>• {localeLabel(locale, "Ideal si priorizas precio", "Best if price matters most", "Ideal si le prix passe d abord")}</li>
                  </ul>
                </article>
              ) : null}

              {goldOption ? (
                <article className="rounded-[22px] border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                    {localeLabel(locale, "Mejor experiencia", "Best experience", "Meilleure experience")}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900">{goldOption.name}</h3>
                    <p className="text-xl font-black text-amber-800">
                      ${Number(goldOption.pricePerPerson ?? tour.price).toFixed(0)}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    <li>• {localeLabel(locale, "Entrada VIP sin filas", "VIP fast-track entry", "Entree VIP rapide")}</li>
                    <li>• {localeLabel(locale, "Asiento reservado y más espacio", "Reserved seating and more space", "Siege reserve et plus d espace")}</li>
                    <li>• {localeLabel(locale, "Bar premium y mejor vista del show", "Premium bar and better show view", "Bar premium et meilleure vue sur le show")}</li>
                    <li>• {localeLabel(locale, "Recomendado si no quieres pasar horas de pie", "Recommended if you do not want to stand for hours", "Recommande si vous ne voulez pas rester debout pendant des heures")}</li>
                  </ul>
                </article>
              ) : null}
            </div>

            <div className="mt-6 overflow-hidden rounded-[22px] border border-slate-200">
              <div className="grid grid-cols-[1.3fr,1fr,1fr] bg-slate-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <div className="px-4 py-3">{localeLabel(locale, "Característica", "Feature", "Caracteristique")}</div>
                <div className="px-4 py-3">{regularOption?.name ?? "Regular"}</div>
                <div className="px-4 py-3">{goldOption?.name ?? "Gold Member"}</div>
              </div>
              {[
                [
                  localeLabel(locale, "Tipo de área", "Area type", "Type de zone"),
                  localeLabel(locale, "General / de pie", "General / standing", "Generale / debout"),
                  localeLabel(locale, "Reservada / sentada", "Reserved / seated", "Reservee / assise")
                ],
                [
                  localeLabel(locale, "Bar", "Bar", "Bar"),
                  localeLabel(locale, "Regular", "Regular", "Standard"),
                  localeLabel(locale, "Premium", "Premium", "Premium")
                ],
                [
                  localeLabel(locale, "Comodidad durante el show", "Comfort during the show", "Confort pendant le show"),
                  localeLabel(locale, "Básica", "Basic", "Basique"),
                  localeLabel(locale, "Alta", "High", "Eleve")
                ],
                [
                  localeLabel(locale, "Para quién conviene", "Best for", "Ideal pour"),
                  localeLabel(locale, "Quien quiere entrar al mejor precio", "Travelers focused on the best price", "Voyageurs axes sur le meilleur prix"),
                  localeLabel(locale, "Quien quiere espacio, asiento y experiencia VIP", "Travelers wanting space, seating and VIP comfort", "Voyageurs voulant espace, siege et confort VIP")
                ]
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-[1.3fr,1fr,1fr] border-t border-slate-200 text-sm text-slate-700">
                  <div className="px-4 py-3 font-semibold text-slate-900">{row[0]}</div>
                  <div className="px-4 py-3">{row[1]}</div>
                  <div className="px-4 py-3">{row[2]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isScapeParkTour ? (
        <section className="mt-6">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {localeLabel(locale, "Comparativa Scape Park", "Scape Park comparison", "Comparatif Scape Park")}
                </p>
                <h2 className="mt-2 text-[20px] font-semibold text-slate-900">
                  {localeLabel(
                    locale,
                    "Qué opción te conviene más dentro de Cap Cana",
                    "Which Cap Cana option fits you best",
                    "Quelle option de Cap Cana vous convient le mieux"
                  )}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">
                  {localeLabel(
                    locale,
                    "Compara rápido cada variante, abre los detalles dentro de cada tarjeta y luego selecciona la que quieras reservar.",
                    "Compare each option quickly, open the details inside each card and then select the one you want to book.",
                    "Comparez rapidement chaque option, ouvrez les details dans chaque carte puis selectionnez celle que vous voulez reserver."
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {scapeProducts.map((item) => {
                const isCurrent = item.isCurrent;
                return (
                  <article
                    key={item.slug}
                    className={`rounded-[22px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      isCurrent ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="overflow-hidden rounded-[18px] border border-white/60 bg-white">
                      <div
                        className="aspect-[4/3] w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {isCurrent
                        ? localeLabel(locale, "Estás viendo", "Viewing now", "En cours")
                        : localeLabel(locale, "Disponible", "Available", "Disponible")}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-2xl font-black text-indigo-600">${item.price}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{item.focus}</p>
                    <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                    <details className="mt-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                        {localeLabel(locale, "Ver detalles", "View details", "Voir details")}
                      </summary>
                      <div className="mt-3 space-y-3 text-sm text-slate-600">
                        {item.structuredDescription.summary ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {localeLabel(locale, "Resumen", "Summary", "Resume")}
                            </p>
                            <p className="mt-1 leading-relaxed">{item.structuredDescription.summary}</p>
                          </div>
                        ) : null}
                        {item.structuredDescription.schedule ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {localeLabel(locale, "Horario", "Schedule", "Horaire")}
                            </p>
                            <p className="mt-1 leading-relaxed">{item.structuredDescription.schedule}</p>
                          </div>
                        ) : null}
                        {item.structuredDescription.specialOps ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {localeLabel(locale, "Operación especial", "Special operation", "Operation speciale")}
                            </p>
                            <p className="mt-1 leading-relaxed">{item.structuredDescription.specialOps}</p>
                          </div>
                        ) : null}
                        {item.structuredDescription.bayahibe ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {localeLabel(locale, "Bayahibe / La Romana", "Bayahibe / La Romana", "Bayahibe / La Romana")}
                            </p>
                            <p className="mt-1 leading-relaxed">{item.structuredDescription.bayahibe}</p>
                          </div>
                        ) : null}
                        {item.structuredDescription.returnWindow ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {localeLabel(locale, "Regreso", "Return", "Retour")}
                            </p>
                            <p className="mt-1 leading-relaxed">{item.structuredDescription.returnWindow}</p>
                          </div>
                        ) : null}
                        {item.structuredDescription.notes ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {localeLabel(locale, "Notas", "Notes", "Notes")}
                            </p>
                            <p className="mt-1 leading-relaxed">{item.structuredDescription.notes}</p>
                          </div>
                        ) : null}
                      </div>
                    </details>
                    <Link
                      href={buildTourOptionHref(item.slug)}
                      className={`mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isCurrent
                          ? "bg-sky-600 text-white hover:bg-sky-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {isCurrent
                        ? localeLabel(locale, "Opción seleccionada", "Selected option", "Option selectionnee")
                        : localeLabel(locale, "Seleccionar esta opción", "Select this option", "Selectionner cette option")}
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section id="practical" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-md">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              {localeLabel(locale, "Qué llevar", "What to bring", "Que faut-il apporter")}
            </p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
              {practicalInfo.whatToBring.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden className="text-emerald-600">✔</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-md">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              {localeLabel(locale, "Restricciones y seguridad", "Restrictions and safety", "Restrictions et securite")}
            </p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
              {practicalInfo.restrictions.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden className="text-rose-500">✖</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="meeting-point" className="mt-6">
        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                {localeLabel(locale, "Punto de encuentro", "Meeting point", "Point de rencontre")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{heroTitle}</p>
            </div>
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400"
            >
              {localeLabel(locale, "Abrir en Google Maps", "Open in Google Maps", "Ouvrir dans Google Maps")}
            </a>
          </div>
          <iframe
            title={`${heroTitle} map`}
            src={mapEmbedUrl}
            className="h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section id="traveler-photos" className="mt-6">
        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                {localeLabel(locale, "Fotos de viajeros", "Traveler photos", "Photos des voyageurs")}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {localeLabel(
                  locale,
                  "Momentos compartidos por clientes en experiencias reales.",
                  "Moments shared by guests from real experiences.",
                  "Moments partages par des clients lors d experiences reelles."
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {travelerGallery.map((img, index) => (
              <img
                key={`${img}-${index}`}
                src={img}
                alt={localeLabel(locale, "Foto de viajero", "Traveler photo", "Photo voyageur")}
                className="h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      <main className="mt-10">
        <div className="space-y-10">
          <section id="includes-legacy" className="hidden">
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
                      <span aria-hidden className="text-lg text-emerald-500">✔</span>
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
                      <span aria-hidden className="text-lg text-rose-500">✖</span>
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
                  {localeLabel(locale, "Reseñas verificadas", "Verified reviews", "Avis verifies")}
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

          {!agencyMode ? (
          <section className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                {localeLabel(locale, "Planifica mejor", "Plan better", "Planifiez mieux")}
              </p>
              <h2 className="text-[20px] font-semibold text-slate-900">
                {localeLabel(
                  locale,
                  "Enlaces útiles para reservar",
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
          ) : null}

        </div>
      </main>
            </div>
            <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto overscroll-contain pb-4 pr-1 lg:block" style={{ scrollbarWidth: "thin" }}>
              <div
                className="w-full"
              >
                <BookingPanel />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {!agencyMode && relatedTourCards.length ? (
        <section id="related-tours" className="mx-auto mt-12 max-w-[1180px] px-4">
          <div className="space-y-5">
            <h2 className="text-2xl font-black text-slate-950">
              {localeLabel(locale, "Otras sugerencias", "Other suggestions", "Autres suggestions")}
            </h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {relatedTourCards.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                    {index === 0 ? (
                      <span className="absolute left-3 top-3 rounded bg-slate-950 px-2.5 py-1 text-[11px] font-black text-white shadow">
                        {localeLabel(locale, "Recomendado", "Recommended", "Recommande")}
                      </span>
                    ) : null}
                    <span className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-md">
                      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    <h3 className="line-clamp-3 min-h-[4.5rem] text-base font-black leading-6 text-slate-950">
                      {item.title}
                    </h3>
                    <p className="text-sm font-semibold text-slate-700">
                      {localeLabel(locale, "Recogida disponible", "Pickup available", "Prise en charge disponible")} · {durationLabel}
                    </p>
                    <div className="flex items-end justify-between gap-3 pt-2">
                      <p className="inline-flex items-center gap-1 text-sm font-black text-slate-950">
                        {ratingValue.toFixed(1)}
                        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-slate-950" fill="currentColor">
                          <path d="M12 3.5l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 17.9l-5.4 2.84 1.03-6.03-4.38-4.27 6.05-.88L12 3.5z" />
                        </svg>
                        <span className="text-xs font-semibold text-slate-500">({Math.max(detailReviewCount, 100)})</span>
                      </p>
                      <p className="text-right text-xs font-semibold text-slate-500">
                        {localeLabel(locale, "Desde", "From", "Des")}{" "}
                        <span className="text-lg font-black text-rose-600">{item.price}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ReserveFloatingButton
        targetId="booking"
        priceLabel={priceLabel}
        label={floatingButtonLabel}
        buttonLabel={floatingButtonCta}
      />
    </div>
  );
}
