import { prisma } from "@/lib/prisma";

type ChatHistoryItem = {
  senderRole: string;
  content: string;
};

type SalesReplyInput = {
  message: string;
  pagePath?: string;
  history?: ChatHistoryItem[];
};

type Lang = "es" | "en" | "fr";

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const detectLang = (text: string): Lang => {
  const t = normalize(text);
  // Prioriza espanol para evitar mezclar idiomas en mensajes latinos.
  if (/(hola|quiero|necesito|traslado|excursion|excursiones|precio|reserva|hotel)/.test(t)) return "es";
  if (/(bonjour|merci|reservation|reserver|transfert|prix|hotel|excursion)/.test(t)) return "fr";
  if (/(hello|book|price|transfer|hotel|tour)/.test(t)) return "en";
  return "es";
};

const copy = {
  es: {
    hello: "Claro, te ayudo como asesor real de reservas.",
    askDate: "Perfecto. Que fecha llegas a Punta Cana?",
    askHotel: "Excelente. Cual es tu hotel exacto?",
    askPax: "Cuantas personas son en total?",
    transferReady: "Listo, te deje el enlace directo para ese traslado.",
    transferNoHotel: "No encontre ese hotel exacto. Escribeme el nombre completo y te lo configuro.",
    toursIntro: "Te recomiendo estas opciones reales de la web:",
    toursMore: "Aqui tienes mas opciones que encajan con lo que buscas:",
    fallback: "Te puedo ayudar con traslados, tours y hoteles. Dime primero que quieres reservar.",
    human: "Te conecto con asesor humano ahora: https://wa.me/18093949877",
    pay: "Si quieres, tambien puedo enviarte el enlace de pago ahora.",
    upsell: "Si quieres, tambien te recomiendo excursiones segun tu hotel."
  },
  en: {
    hello: "Sure, I can help you as your real booking advisor.",
    askDate: "Perfect. What date are you arriving in Punta Cana?",
    askHotel: "Great. What is your exact hotel name?",
    askPax: "How many travelers are you?",
    transferReady: "Done. I prepared the direct transfer link for you.",
    transferNoHotel: "I could not match that exact hotel yet. Send the full hotel name and I will set it.",
    toursIntro: "These are real options available on the website:",
    toursMore: "Here are more options that match what you want:",
    fallback: "I can help with transfers, tours, and hotels. Tell me what you want to book first.",
    human: "I can connect you with a human advisor now: https://wa.me/18093949877",
    pay: "If you want, I can also send your direct payment link now.",
    upsell: "If you want, I can also recommend tours based on your hotel."
  },
  fr: {
    hello: "Parfait, je vous aide comme conseiller de reservation.",
    askDate: "Super. Quelle est votre date d'arrivee a Punta Cana?",
    askHotel: "Excellent. Quel est le nom exact de votre hotel?",
    askPax: "Vous etes combien de voyageurs?",
    transferReady: "C'est pret. J'ai prepare le lien direct pour ce transfert.",
    transferNoHotel: "Je n'ai pas trouve cet hotel exact. Envoyez le nom complet et je le configure.",
    toursIntro: "Voici des options reelles disponibles sur le site:",
    toursMore: "Voici d'autres options adaptees a votre demande:",
    fallback: "Je peux aider pour transferts, tours et hotels. Dites-moi quoi reserver d'abord.",
    human: "Je vous connecte a un conseiller humain: https://wa.me/18093949877",
    pay: "Si vous voulez, je peux aussi envoyer le lien de paiement direct.",
    upsell: "Si vous voulez, je peux aussi recommander des excursions selon votre hotel."
  }
} as const;

type FaqIntent = {
  key:
    | "price"
    | "paymentMethods"
    | "safety"
    | "sharedOrPrivate"
    | "arrivalDelay"
    | "luggage"
    | "cancellation"
    | "children"
    | "pickupPoint"
    | "nightService"
    | "groupBooking"
    | "bestTour"
    | "duration"
    | "whatIncludes"
    | "availability"
    | "sameDay"
    | "airportHelp"
    | "contact";
  phrases: string[];
};

// 100+ variaciones reales de preguntas de clientes.
const FAQ_INTENTS: FaqIntent[] = [
  {
    key: "price",
    phrases: [
      "cuanto cuesta",
      "cuanto sale",
      "precio",
      "tarifa",
      "cost",
      "how much",
      "combien",
      "mejor precio",
      "precio final",
      "hay cargos extras"
    ]
  },
  {
    key: "paymentMethods",
    phrases: [
      "como pago",
      "metodos de pago",
      "aceptan tarjeta",
      "aceptan paypal",
      "pago en efectivo",
      "can i pay cash",
      "pay online",
      "payment methods",
      "moyens de paiement",
      "puedo pagar despues"
    ]
  },
  {
    key: "safety",
    phrases: [
      "es seguro",
      "seguridad",
      "safe",
      "is it safe",
      "driver is licensed",
      "chofer certificado",
      "seguro incluido",
      "insurance included",
      "fiable",
      "confiable"
    ]
  },
  {
    key: "sharedOrPrivate",
    phrases: [
      "es privado",
      "compartido",
      "shared",
      "private transfer",
      "solo mi grupo",
      "solo nosotros",
      "transfer privado",
      "vehiculo exclusivo",
      "service prive",
      "collectif"
    ]
  },
  {
    key: "arrivalDelay",
    phrases: [
      "si mi vuelo se retrasa",
      "vuelo retrasado",
      "flight delay",
      "late flight",
      "cambio de horario",
      "llego tarde",
      "retard de vol",
      "demora del vuelo",
      "tracking de vuelo",
      "flight tracking"
    ]
  },
  {
    key: "luggage",
    phrases: [
      "cuantas maletas",
      "equipaje",
      "luggage",
      "bags",
      "maletas grandes",
      "carry on",
      "maleta extra",
      "equipaje adicional",
      "combien de valises",
      "bagage"
    ]
  },
  {
    key: "cancellation",
    phrases: [
      "cancelacion",
      "politica de cancelacion",
      "cambiar fecha",
      "refund",
      "reembolso",
      "annulation",
      "modificar reserva",
      "change date",
      "cancel my booking",
      "devolucion"
    ]
  },
  {
    key: "children",
    phrases: [
      "ninos",
      "silla de bebe",
      "car seat",
      "child seat",
      "baby",
      "viajo con ninos",
      "actividades para ninos",
      "kids friendly",
      "enfant",
      "bebe"
    ]
  },
  {
    key: "pickupPoint",
    phrases: [
      "donde me recogen",
      "punto de encuentro",
      "meeting point",
      "pickup point",
      "terminal de llegada",
      "salida aeropuerto",
      "donde nos vemos",
      "ou se trouve le point",
      "encuentro en aeropuerto",
      "driver sign"
    ]
  },
  {
    key: "nightService",
    phrases: [
      "servicio nocturno",
      "de madrugada",
      "early morning",
      "late night",
      "24 horas",
      "24/7",
      "a las 3 am",
      "llegada nocturna",
      "service de nuit",
      "open all night"
    ]
  },
  {
    key: "groupBooking",
    phrases: [
      "grupo grande",
      "somos 10",
      "somos 15",
      "somos 20",
      "group booking",
      "corporate",
      "evento",
      "boda",
      "despedida",
      "reserva grupal"
    ]
  },
  {
    key: "bestTour",
    phrases: [
      "mejor excursion",
      "top tours",
      "que recomiendas",
      "best tour",
      "que tour es mejor",
      "tour mas vendido",
      "most booked",
      "popular excursion",
      "top rated",
      "mejor experiencia"
    ]
  },
  {
    key: "duration",
    phrases: [
      "cuanto dura",
      "duracion",
      "how long",
      "duration",
      "horario",
      "a que hora",
      "what time start",
      "hora de regreso",
      "combien de temps",
      "duree"
    ]
  },
  {
    key: "whatIncludes",
    phrases: [
      "que incluye",
      "incluye comida",
      "incluye bebidas",
      "what is included",
      "includes pickup",
      "hotel pickup included",
      "equipamiento incluido",
      "snorkel gear included",
      "ce qui est inclus",
      "inclut transport"
    ]
  },
  {
    key: "availability",
    phrases: [
      "hay disponibilidad",
      "available",
      "availability",
      "disponible para",
      "queda cupo",
      "todavia hay espacio",
      "full booked",
      "last spots",
      "places disponibles",
      "space left"
    ]
  },
  {
    key: "sameDay",
    phrases: [
      "para hoy",
      "same day",
      "last minute",
      "hoy mismo",
      "ahora",
      "en dos horas",
      "book today",
      "reserva inmediata",
      "reservation rapide",
      "disponible hoy"
    ]
  },
  {
    key: "airportHelp",
    phrases: [
      "llego al puj",
      "airport pickup",
      "puj airport",
      "aeropuerto punta cana",
      "terminal b",
      "terminal a",
      "migration delay",
      "aduana",
      "immigration",
      "arrivee aeroport"
    ]
  },
  {
    key: "contact",
    phrases: [
      "telefono",
      "numero de contacto",
      "whatsapp",
      "support",
      "soporte",
      "hablar con agente",
      "contacto",
      "email",
      "service client",
      "customer service"
    ]
  }
];

const FAQ_REPLY: Record<FaqIntent["key"], Record<Lang, string>> = {
  price: {
    es: "Te cotizo exacto ahora. Enviame fecha, hotel y cantidad de personas para darte precio final sin sorpresas.",
    en: "I can quote you exactly now. Send date, hotel, and travelers for a final no-surprise price.",
    fr: "Je peux vous donner un prix exact maintenant. Envoyez date, hotel et nombre de voyageurs."
  },
  paymentMethods: {
    es: "Aceptamos pago online seguro (tarjeta y metodos digitales). Si prefieres, tambien te conecto con un asesor para finalizar por WhatsApp.",
    en: "We accept secure online payment (card and digital methods). I can also connect you on WhatsApp to finalize.",
    fr: "Nous acceptons le paiement en ligne securise (carte et methodes digitales)."
  },
  safety: {
    es: "Trabajamos con operacion formal, seguimiento y soporte real. Si quieres te envio una opcion segura segun tu hotel.",
    en: "We operate with formal service, live tracking, and real support. I can send a safe option for your hotel.",
    fr: "Nous operons avec service formel, suivi en direct et vrai support."
  },
  sharedOrPrivate: {
    es: "Manejamos opciones privadas para tu grupo. Si buscas compartido, te digo cuando hay disponibilidad.",
    en: "We run private options for your group. If you want shared, I can check availability.",
    fr: "Nous avons des options privees pour votre groupe. Je peux verifier le partage si necessaire."
  },
  arrivalDelay: {
    es: "No te preocupes: monitoreamos el vuelo y ajustamos recogida cuando hay demora razonable.",
    en: "No worries: we monitor flights and adjust pickup for reasonable delays.",
    fr: "Pas de souci: nous suivons le vol et ajustons la prise en charge en cas de retard raisonnable."
  },
  luggage: {
    es: "Te asigno vehiculo segun maletas y pasajeros para que viajes comodo. Dime cuantas maletas grandes y de mano llevan.",
    en: "I assign the right vehicle based on luggage and passengers. Tell me large and carry-on bags.",
    fr: "Je choisis le vehicule selon bagages et passagers. Dites-moi grandes valises et bagages cabine."
  },
  cancellation: {
    es: "Te ayudo con cambios y cancelacion segun politica del servicio. Si me pasas fecha y producto, te digo exactamente como aplica.",
    en: "I can help with changes/cancellation based on service policy. Share date and product and I’ll tell you exactly how it applies.",
    fr: "Je peux aider pour modifications/annulation selon la politique du service."
  },
  children: {
    es: "Perfecto. Trabajamos con opciones family-friendly y podemos coordinar silla de bebe bajo solicitud.",
    en: "Great. We have family-friendly options and can coordinate baby seat upon request.",
    fr: "Parfait. Nous avons des options famille et siege bebe sur demande."
  },
  pickupPoint: {
    es: "Te indicamos punto exacto de recogida al confirmar. En aeropuerto te explicamos salida y referencia clara.",
    en: "We provide exact pickup point on confirmation. At airport we share clear exit instructions.",
    fr: "Nous donnons le point de rendez-vous exact a la confirmation."
  },
  nightService: {
    es: "Si, operamos servicios de madrugada y noche segun disponibilidad. Te lo confirmo con fecha y vuelo.",
    en: "Yes, we operate night/early-morning services subject to availability. I confirm with date and flight.",
    fr: "Oui, nous operons de nuit selon disponibilite. Je confirme avec date et vol."
  },
  groupBooking: {
    es: "Excelente para grupos. Te armamos logistica y precio por volumen. Dime cantidad total y fechas.",
    en: "Great for groups. We can organize logistics and volume pricing. Tell me group size and dates.",
    fr: "Parfait pour groupes. Nous organisons la logistique et tarif de groupe."
  },
  bestTour: {
    es: "Te recomiendo segun estilo: adrenalina, playa, familiar o VIP. Dime tu perfil y te mando top 3 real.",
    en: "I recommend based on style: adrenaline, beach, family, or VIP. Tell me your profile and I’ll send real top 3.",
    fr: "Je recommande selon style: adrenaline, plage, famille ou VIP."
  },
  duration: {
    es: "Te confirmo duracion exacta segun tour y ruta de recogida. Dime cual opcion viste y te doy detalle.",
    en: "I can confirm exact duration based on tour and pickup route. Tell me which option you saw.",
    fr: "Je confirme la duree exacte selon le tour et la route de pickup."
  },
  whatIncludes: {
    es: "Te detallo que incluye cada opcion (transporte, bebidas, entradas, equipos) antes de pagar.",
    en: "I can break down what each option includes before payment.",
    fr: "Je peux detailler ce qui est inclus pour chaque option avant paiement."
  },
  availability: {
    es: "Reviso disponibilidad en vivo. Pasame fecha y te digo cupos reales.",
    en: "I check live availability. Send your date and I’ll confirm real spots.",
    fr: "Je verifie la disponibilite en direct. Envoyez votre date."
  },
  sameDay: {
    es: "Si hay cupo, te cierro reserva de ultimo minuto. Dime fecha/hora exacta y hotel.",
    en: "If there is availability, I can close last-minute booking. Send exact time/date and hotel.",
    fr: "Si disponible, je peux fermer une reservation de derniere minute."
  },
  airportHelp: {
    es: "Perfecto. Te asistimos desde llegada a PUJ hasta tu hotel con instrucciones claras de encuentro.",
    en: "Perfect. We assist from PUJ arrival to hotel with clear meeting instructions.",
    fr: "Parfait. Assistance depuis l'arrivee PUJ jusqu'a l'hotel."
  },
  contact: {
    es: "Te atiendo aqui mismo y tambien por WhatsApp directo: https://wa.me/18093949877",
    en: "I can support you here and also on direct WhatsApp: https://wa.me/18093949877",
    fr: "Je vous aide ici et aussi sur WhatsApp direct: https://wa.me/18093949877"
  }
};

function matchFaqIntent(text: string): FaqIntent["key"] | null {
  const msg = normalize(text);
  for (const intent of FAQ_INTENTS) {
    if (intent.phrases.some((phrase) => msg.includes(normalize(phrase)))) {
      return intent.key;
    }
  }
  return null;
}

const extractDate = (text: string) => {
  const explicit = text.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/);
  if (explicit?.[1]) return explicit[1];
  const n = normalize(text);
  if (/(hoy|today|aujourd)/.test(n)) return "hoy";
  if (/(manana|mañana|tomorrow|demain)/.test(n)) return "manana";
  return null;
};

const extractPartySize = (text: string) => {
  const match = normalize(text).match(/(\d{1,2})\s*(pax|personas|people|adultos|adults|voyageurs|personnes)/);
  return match ? Number(match[1]) : null;
};

const wantsHuman = (text: string) => /(agente|asesor|humano|persona real|human|agent|whatsapp)/.test(normalize(text));
const wantsTransfer = (text: string, pagePath?: string) =>
  /(traslado|transfer|taxi|recogida|pickup|airport|aeropuerto|puj)/.test(normalize(text)) ||
  Boolean(pagePath?.includes("/transfer") || pagePath?.includes("/traslado"));
const wantsTours = (text: string, pagePath?: string) =>
  /(tour|excursion|excursiones|actividad|activity|saona|buggy|party boat|catamaran|snorkel|adventure)/.test(normalize(text)) ||
  Boolean(pagePath?.includes("/tours"));
const wantsMore = (text: string) => /(que mas|mas opciones|otra opcion|otra|more|anything else|autre option)/.test(normalize(text));
const wantsPay = (text: string) => /(pagar|pago|checkout|pay|book now|reservar|reserva|payer)/.test(normalize(text));
const asksTourDetails = (text: string) => /(incluye|included|includes|duracion|duration|precio|price|costo|cost|hora|hours)/.test(normalize(text));
const asksWhyRecommendation = (text: string) =>
  /(por que|porque|why|pourquoi|razon|motivo|why that|por que ese|porque ese)/.test(normalize(text));
const asksAdrenaline = (text: string) =>
  /(adrenalina|adrenaline|extremo|extreme|aventura|adventure|buggy|atv|parasailing|zipline)/.test(normalize(text));

const extractWords = (text: string) =>
  normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4)
    .slice(0, 6);

const extractUrls = (history?: ChatHistoryItem[]) => {
  const urls = {
    tours: [] as string[],
    hotels: [] as string[],
    transfer: [] as string[]
  };
  if (!history?.length) return urls;

  for (const item of history) {
    const matches = item.content.match(/https?:\/\/proactivitis\.com\/[^\s]+/g) ?? [];
    for (const url of matches) {
      if (url.includes("/tours/")) urls.tours.push(url);
      if (url.includes("/hoteles/")) urls.hotels.push(url);
      if (url.includes("/transfer/")) urls.transfer.push(url);
    }
  }
  return urls;
};

const getLastTourSlug = (history?: ChatHistoryItem[]) => {
  const urls = extractUrls(history).tours;
  const last = urls[urls.length - 1];
  if (!last) return null;
  const match = last.match(/\/tours\/([a-z0-9-]+)/i);
  return match?.[1] ?? null;
};

const formatDuration = (value: string | null) => {
  if (!value) return "duracion variable";
  const raw = value.trim();
  if (!raw) return "duracion variable";
  try {
    const parsed = JSON.parse(raw) as { value?: string | number; unit?: string };
    if (parsed && (parsed.value || parsed.unit)) return `${parsed.value ?? ""} ${parsed.unit ?? "horas"}`.trim();
  } catch {
    // use raw
  }
  return raw;
};

const buildTransferUrl = (hotelSlug: string, date: string | null, pax: number | null) => {
  const params = new URLSearchParams();
  params.set("origin", "PUJ");
  params.set("to", hotelSlug);
  if (date) params.set("date", date);
  if (pax) params.set("pax", String(pax));
  return `https://proactivitis.com/traslado?${params.toString()}`;
};

async function searchHotelByText(text: string, history?: ChatHistoryItem[]) {
  const full = `${history?.map((h) => h.content).join(" ") ?? ""} ${text}`;
  const words = extractWords(full);
  if (!words.length) return null;
  return prisma.transferLocation.findFirst({
    where: {
      type: "HOTEL",
      active: true,
      OR: words.map((w) => ({ name: { contains: w, mode: "insensitive" as const } }))
    },
    select: { slug: true, name: true }
  });
}

async function searchToursByText(text: string, history?: ChatHistoryItem[]) {
  const full = `${history?.map((h) => h.content).join(" ") ?? ""} ${text}`;
  const words = extractWords(full);
  const watery = /(agua|water|snorkel|boat|catamaran|isla|saona|beach|mar|party boat)/.test(normalize(full));
  const adrenaline = asksAdrenaline(full);

  return prisma.tour.findMany({
    where: adrenaline
      ? {
          OR: [
            { title: { contains: "buggy", mode: "insensitive" } },
            { title: { contains: "atv", mode: "insensitive" } },
            { title: { contains: "parasailing", mode: "insensitive" } },
            { title: { contains: "zipline", mode: "insensitive" } },
            { description: { contains: "aventura", mode: "insensitive" } },
            { description: { contains: "adrenal", mode: "insensitive" } }
          ]
        }
      : words.length
      ? {
          OR: words.flatMap((w) => [
            { title: { contains: w, mode: "insensitive" as const } },
            { slug: { contains: w, mode: "insensitive" as const } },
            { description: { contains: w, mode: "insensitive" as const } }
          ])
        }
      : watery
        ? {
            OR: [
              { title: { contains: "saona", mode: "insensitive" } },
              { title: { contains: "catamaran", mode: "insensitive" } },
              { title: { contains: "party boat", mode: "insensitive" } },
              { description: { contains: "snorkel", mode: "insensitive" } }
            ]
          }
        : undefined,
    select: { slug: true, title: true, price: true, duration: true, includes: true, shortDescription: true, featured: true, createdAt: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4
  });
}

export async function generateVisitorChatReply({ message, pagePath, history }: SalesReplyInput): Promise<string> {
  const lang = detectLang(message);
  const t = copy[lang];
  const allVisitorText = `${history?.filter((h) => h.senderRole === "VISITOR").map((h) => h.content).join(" ") ?? ""} ${message}`;
  const faqIntent = matchFaqIntent(allVisitorText);
  const transferIntent = wantsTransfer(allVisitorText, pagePath);
  const tourIntent = wantsTours(allVisitorText, pagePath);
  const followUp = wantsMore(message);
  const travelDate = extractDate(allVisitorText);
  const partySize = extractPartySize(allVisitorText);
  const adrenalineIntent = asksAdrenaline(allVisitorText);

  if (wantsHuman(message)) return t.human;

  if (faqIntent && !transferIntent && !tourIntent) {
    return FAQ_REPLY[faqIntent][lang];
  }

  if (asksWhyRecommendation(message)) {
    const lastTourSlug = getLastTourSlug(history);
    if (lastTourSlug) {
      const tour = await prisma.tour.findUnique({
        where: { slug: lastTourSlug },
        select: { title: true, price: true, duration: true, shortDescription: true, includes: true }
      });
      if (tour) {
        if (lang === "en") {
          return `I recommended ${tour.title} because it matches your request and has strong demand.\nPrice from USD ${Math.round(tour.price)} · Duration ${formatDuration(tour.duration)}.\nIf you prefer, I can show a more extreme or softer option right now.`;
        }
        if (lang === "fr") {
          return `Je vous ai recommande ${tour.title} car il correspond a votre demande et convertit tres bien.\nPrix depuis USD ${Math.round(tour.price)} · Duree ${formatDuration(tour.duration)}.\nSi vous voulez, je peux proposer une option plus extreme ou plus tranquille.`;
        }
        return `Te recomendé ${tour.title} porque encaja con lo que pediste y es una de las opciones con mejor conversión.\nPrecio desde USD ${Math.round(tour.price)} · Duración ${formatDuration(tour.duration)}.\nSi quieres, te muestro ahora una opción más extrema o una más tranquila.`;
      }
    }
    return lang === "en"
      ? "Good question. I can explain each option before you decide. Tell me if you want adventure, beach, or family style."
      : lang === "fr"
        ? "Bonne question. Je peux expliquer chaque option avant de choisir. Dites-moi: aventure, plage ou famille?"
        : "Buena pregunta. Te explico cada opción antes de decidir. Dime si prefieres aventura, playa o familiar.";
  }

  // Follow-up details about a tour already shown in chat.
  if (asksTourDetails(message)) {
    const lastTourSlug = getLastTourSlug(history);
    if (lastTourSlug) {
      const tour = await prisma.tour.findUnique({
        where: { slug: lastTourSlug },
        select: { title: true, price: true, duration: true, includes: true }
      });
      if (tour) {
        if (lang === "en") {
          return `${tour.title}: price from USD ${Math.round(tour.price)}, duration ${formatDuration(tour.duration)}, includes ${tour.includes || "details on booking page"}.\nhttps://proactivitis.com/tours/${lastTourSlug}`;
        }
        if (lang === "fr") {
          return `${tour.title}: prix a partir de USD ${Math.round(tour.price)}, duree ${formatDuration(tour.duration)}, inclus ${tour.includes || "details sur la page de reservation"}.\nhttps://proactivitis.com/tours/${lastTourSlug}`;
        }
        return `${tour.title}: desde USD ${Math.round(tour.price)}, duracion ${formatDuration(tour.duration)}, incluye ${tour.includes || "detalles en la pagina de reserva"}.\nhttps://proactivitis.com/tours/${lastTourSlug}`;
      }
    }
  }

  if (transferIntent) {
    if (!travelDate) {
      return `${t.hello}\n${t.askDate}`;
    }

    const hotel = await searchHotelByText(allVisitorText, history);
    if (!hotel) {
      return `${t.askHotel}\n${t.transferNoHotel}`;
    }

    const transferUrl = buildTransferUrl(hotel.slug, travelDate, partySize);
    const hotelUrl = `https://proactivitis.com/hoteles/${hotel.slug}`;
    const lines = [
      t.transferReady,
      `Hotel: ${hotel.name}`,
      `Enlace traslado: ${transferUrl}`,
      `Ficha hotel: ${hotelUrl}`
    ];

    if (!partySize) lines.push(t.askPax);
    lines.push(t.upsell);
    if (wantsPay(message)) lines.push(t.pay, "https://proactivitis.com/tours");
    return lines.join("\n");
  }

  if (tourIntent || followUp) {
    const tours = await searchToursByText(allVisitorText, history);
    if (!tours.length) return t.fallback;

    const title = followUp ? t.toursMore : t.toursIntro;
    const lines: string[] = [title];
    if (adrenalineIntent && lang === "es") {
      lines.unshift("Sí, claro. Para adrenalina real te recomiendo actividades de motor y altura.");
    }
    if (adrenalineIntent && lang === "en") {
      lines.unshift("Yes. For real adrenaline, I recommend motor and height activities.");
    }
    if (adrenalineIntent && lang === "fr") {
      lines.unshift("Oui. Pour plus d'adrenaline, je recommande des activites moteur et hauteur.");
    }
    for (const tour of tours.slice(0, 3)) {
      lines.push(`- ${tour.title} (USD ${Math.round(tour.price)}, ${formatDuration(tour.duration)}) https://proactivitis.com/tours/${tour.slug}`);
    }
    if (travelDate) {
      if (lang === "en") lines.push(`If you want, I can prepare one for ${travelDate}.`);
      else if (lang === "fr") lines.push(`Si vous voulez, je peux preparer une option pour ${travelDate}.`);
      else lines.push(`Si quieres, te dejo una opcion lista para ${travelDate}.`);
    }
    if (wantsPay(message)) lines.push(t.pay, "https://proactivitis.com/tours");
    return lines.join("\n");
  }

  return t.fallback;
}
