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

const STOPWORDS = new Set([
  "hola",
  "hi",
  "hello",
  "quiero",
  "necesito",
  "please",
  "por",
  "para",
  "with",
  "from",
  "the",
  "and",
  "que",
  "mas",
  "otra",
  "opcion",
  "precio",
  "costo",
  "cost",
  "rate"
]);

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const detectLang = (text: string): Lang => {
  const t = normalize(text);
  if (/(bonjour|merci|reserver|transfert|hotel|excursion)/.test(t)) return "fr";
  if (/(hello|hi|book|price|transfer|hotel|tour)/.test(t) && !/(que|necesito|quiero|hola)/.test(t)) return "en";
  return "es";
};

const formatDuration = (value: string | null, lang: Lang) => {
  if (!value) return lang === "es" ? "duracion variable" : lang === "fr" ? "duree variable" : "variable duration";
  const raw = value.trim();
  if (!raw) return lang === "es" ? "duracion variable" : lang === "fr" ? "duree variable" : "variable duration";
  try {
    const parsed = JSON.parse(raw) as { value?: string | number; unit?: string };
    if (parsed && (parsed.value || parsed.unit)) {
      const amount = parsed.value ? String(parsed.value) : "";
      const unit = parsed.unit ? String(parsed.unit) : lang === "es" ? "horas" : lang === "fr" ? "heures" : "hours";
      return `${amount} ${unit}`.trim();
    }
  } catch {
    // keep raw
  }
  return raw;
};

const extractTokens = (text: string) =>
  normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
    .slice(0, 5);

const extractMentionedSlugs = (history: ChatHistoryItem[] | undefined, segment: string) => {
  if (!history?.length) return new Set<string>();
  const regex = new RegExp(`https?://proactivitis\\.com/${segment}/([a-z0-9-]+)`, "gi");
  const found = new Set<string>();
  for (const item of history) {
    let match: RegExpExecArray | null = regex.exec(item.content);
    while (match) {
      found.add(match[1]);
      match = regex.exec(item.content);
    }
  }
  return found;
};

const extractPartySize = (text: string, history?: ChatHistoryItem[]) => {
  const all = `${history?.map((item) => item.content).join(" ") ?? ""} ${text}`;
  const match = normalize(all).match(/(\d{1,2})\s*(pax|personas|people|adultos|adults)/);
  return match ? Number(match[1]) : null;
};

const extractTravelDate = (text: string, history?: ChatHistoryItem[]) => {
  const all = `${history?.map((item) => item.content).join(" ") ?? ""} ${text}`;
  const match = all.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/);
  return match?.[1] ?? null;
};

const introByLang = {
  es: "Perfecto, te ayudo como asesor de ventas.",
  en: "Perfect, I can help you as your booking advisor.",
  fr: "Parfait, je vous aide comme conseiller de reservation."
};

const askForMissingByLang = (lang: Lang, partySize: number | null, travelDate: string | null) => {
  if (lang === "en") {
    if (!travelDate && !partySize) return "Send me your travel date and number of travelers to quote exactly.";
    if (!travelDate) return "Tell me your travel date and I will confirm the best option now.";
    if (!partySize) return "How many travelers are you? I will send the exact quote.";
    return "If you want, I can prepare your final booking link now.";
  }
  if (lang === "fr") {
    if (!travelDate && !partySize) return "Envoyez-moi votre date et le nombre de voyageurs pour un prix exact.";
    if (!travelDate) return "Donnez-moi la date du voyage et je confirme la meilleure option.";
    if (!partySize) return "Combien de voyageurs? Je vous envoie le devis exact.";
    return "Si vous voulez, je peux preparer votre lien de paiement maintenant.";
  }
  if (!travelDate && !partySize) return "Comparteme fecha del viaje y cantidad de personas para cotizarte exacto.";
  if (!travelDate) return "Dime la fecha del viaje y te confirmo la mejor opcion ahora mismo.";
  if (!partySize) return "Cuantas personas son? Te envio la cotizacion exacta.";
  return "Si quieres, te preparo ahora mismo el enlace final de pago.";
};

export async function generateVisitorChatReply({ message, pagePath, history }: SalesReplyInput): Promise<string> {
  const msg = normalize(message);
  const lang = detectLang(message);
  const partySize = extractPartySize(message, history);
  const travelDate = extractTravelDate(message, history);

  const isGreeting = /^(hola|hi|hello|buenas|buenos dias|good morning|bonjour)/.test(msg);
  const wantsHuman = /(asesor|agente|humano|human|persona real|whatsapp)/.test(msg);
  const isFollowUp = /(que mas|mas opciones|otra opcion|otra|more options|anything else|autre option)/.test(msg);
  const looksWater = /(agua|water|snorkel|boat|catamaran|isla|saona|mar|ocean|beach|party boat)/.test(msg);
  const looksTour = /(tour|excursion|excursiones|activity|activite|buggy|saona|catamaran|party boat)/.test(msg) || looksWater;
  const looksTransfer = /(traslado|transfer|airport|aeropuerto|pickup|drop off|puj)/.test(msg) || Boolean(pagePath?.includes("/transfer"));
  const looksHotel = /(hotel|resort|all inclusive|todo incluido|alojamiento|hebergement)/.test(msg) || Boolean(pagePath?.includes("/hotel"));
  const wantsPrice = /(precio|cost|cuanto|tarifa|rate|usd|dolar|how much|combien)/.test(msg);
  const wantsPay = /(pagar|pago|payment|checkout|book now|reservar|reserva|payer)/.test(msg);

  if (wantsHuman) {
    return lang === "en"
      ? "Great. I can connect you with a live advisor now: https://wa.me/18093949877"
      : lang === "fr"
        ? "Parfait. Je peux vous connecter avec un conseiller maintenant: https://wa.me/18093949877"
        : "Perfecto. Te conecto con un asesor humano ahora mismo: https://wa.me/18093949877";
  }

  const tokens = extractTokens(message);
  const mentionedTourSlugs = extractMentionedSlugs(history, "tours");
  const mentionedHotelSlugs = extractMentionedSlugs(history, "hoteles");
  const mentionedTransferSlugs = extractMentionedSlugs(history, "transfer");

  const shouldFetchTours = looksTour || isFollowUp || (!looksTransfer && !looksHotel);
  const shouldFetchHotels = looksHotel || (looksTransfer && isFollowUp);
  const shouldFetchTransfers = looksTransfer || Boolean(pagePath?.includes("/traslado"));

  const [tourRows, hotelRows, transferRows] = await Promise.all([
    shouldFetchTours
      ? prisma.tour.findMany({
          where: tokens.length
            ? {
                OR: tokens.flatMap((token) => [
                  { title: { contains: token, mode: "insensitive" as const } },
                  { slug: { contains: token, mode: "insensitive" as const } },
                  { description: { contains: token, mode: "insensitive" as const } }
                ])
              }
            : looksWater
              ? {
                  OR: [
                    { title: { contains: "saona", mode: "insensitive" as const } },
                    { title: { contains: "catamaran", mode: "insensitive" as const } },
                    { title: { contains: "party boat", mode: "insensitive" as const } },
                    { description: { contains: "snorkel", mode: "insensitive" as const } }
                  ]
                }
              : undefined,
          select: { slug: true, title: true, price: true, duration: true, featured: true, createdAt: true },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: 8
        })
      : Promise.resolve([]),
    shouldFetchHotels
      ? prisma.transferLocation.findMany({
          where: {
            type: "HOTEL",
            active: true,
            ...(tokens.length
              ? {
                  OR: tokens.map((token) => ({ name: { contains: token, mode: "insensitive" as const } }))
                }
              : {})
          },
          select: { slug: true, name: true },
          orderBy: { name: "asc" },
          take: 8
        })
      : Promise.resolve([]),
    shouldFetchTransfers
      ? prisma.transferDestination.findMany({
          where: tokens.length
            ? {
                OR: tokens.map((token) => ({ name: { contains: token, mode: "insensitive" as const } }))
              }
            : undefined,
          select: { slug: true, name: true },
          orderBy: { updatedAt: "desc" },
          take: 8
        })
      : Promise.resolve([])
  ]);

  const tours = tourRows.filter((item) => !mentionedTourSlugs.has(item.slug)).slice(0, 3);
  const hotels = hotelRows.filter((item) => !mentionedHotelSlugs.has(item.slug)).slice(0, 3);
  const transfers = transferRows.filter((item) => !mentionedTransferSlugs.has(item.slug)).slice(0, 3);

  const lines: string[] = [];
  if (isGreeting) lines.push(introByLang[lang]);

  if (shouldFetchTours) {
    const head =
      lang === "en"
        ? "These are strong options for you:"
        : lang === "fr"
          ? "Voici des options solides pour vous:"
          : isFollowUp
            ? "Claro, aqui tienes opciones nuevas que encajan mejor:"
            : "Estas son opciones fuertes para ti:";
    const tourList = tours.length
      ? tours.map(
          (tour) =>
            `- ${tour.title} (desde USD ${Math.round(tour.price)}, ${formatDuration(tour.duration, lang)}) https://proactivitis.com/tours/${tour.slug}`
        )
      : [
          lang === "en"
            ? "- Top excursions: https://proactivitis.com/tours"
            : lang === "fr"
              ? "- Excursions principales: https://proactivitis.com/tours"
              : "- Excursiones top: https://proactivitis.com/tours"
        ];
    lines.push(head, ...tourList);
  }

  if (shouldFetchTransfers) {
    const transferHead =
      lang === "en"
        ? "Private transfer options:"
        : lang === "fr"
          ? "Options de transfert prive:"
          : "Opciones de traslado privado:";
    const transferList = transfers.length
      ? transfers.map((transfer) => `- ${transfer.name}: https://proactivitis.com/transfer/${transfer.slug}`)
      : [
          lang === "en"
            ? "- See all transfers: https://proactivitis.com/traslado"
            : lang === "fr"
              ? "- Voir tous les transferts: https://proactivitis.com/traslado"
              : "- Ver todos los traslados: https://proactivitis.com/traslado"
        ];
    lines.push(transferHead, ...transferList);
  }

  if (shouldFetchHotels) {
    const hotelHead =
      lang === "en"
        ? "Recommended resorts to combine with tours/transfers:"
        : lang === "fr"
          ? "Resorts recommandes a combiner avec tours/transferts:"
          : "Resorts recomendados para combinar con tours y traslados:";
    const hotelList = hotels.length
      ? hotels.map((hotel) => `- ${hotel.name}: https://proactivitis.com/hoteles/${hotel.slug}`)
      : [
          lang === "en"
            ? "- Hotels directory: https://proactivitis.com/hoteles"
            : lang === "fr"
              ? "- Catalogue hotels: https://proactivitis.com/hoteles"
              : "- Catalogo de hoteles: https://proactivitis.com/hoteles"
        ];
    lines.push(hotelHead, ...hotelList);
  }

  if (wantsPrice && !travelDate) {
    lines.push(
      lang === "en"
        ? "I can send exact prices in 1 message."
        : lang === "fr"
          ? "Je peux vous envoyer un prix exact en 1 message."
          : "Te puedo enviar precio exacto en 1 mensaje."
    );
  }

  lines.push(askForMissingByLang(lang, partySize, travelDate));

  if (wantsPay) {
    lines.push(
      lang === "en"
        ? "Direct payment now: https://proactivitis.com/tours"
        : lang === "fr"
          ? "Paiement direct maintenant: https://proactivitis.com/tours"
          : "Pago directo ahora: https://proactivitis.com/tours"
    );
  }

  return lines.join("\n");
}
