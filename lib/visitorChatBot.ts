import { prisma } from "@/lib/prisma";

type SalesReplyInput = {
  message: string;
  pagePath?: string;
};

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const formatDuration = (value: string | null) => {
  if (!value) return "duracion variable";
  const raw = value.trim();
  if (!raw) return "duracion variable";
  try {
    const parsed = JSON.parse(raw) as { value?: string | number; unit?: string };
    if (parsed && (parsed.value || parsed.unit)) {
      const amount = parsed.value ? String(parsed.value) : "";
      const unit = parsed.unit ? String(parsed.unit) : "horas";
      return `${amount} ${unit}`.trim();
    }
  } catch {
    // ignore invalid JSON duration, use raw
  }
  return raw;
};

const makeTourLine = (tour: { slug: string; title: string; price: number; duration: string | null }) =>
  `- ${tour.title} (desde USD ${Math.round(tour.price)}, ${formatDuration(tour.duration)}) https://proactivitis.com/tours/${tour.slug}`;

const makeHotelLine = (hotel: { slug: string; name: string }) =>
  `- ${hotel.name}: https://proactivitis.com/hoteles/${hotel.slug}`;

const makeTransferLine = (transfer: { slug: string; name: string }) =>
  `- ${transfer.name}: https://proactivitis.com/transfer/${transfer.slug}`;

export async function generateVisitorChatReply({ message, pagePath }: SalesReplyInput): Promise<string> {
  const text = normalize(message);

  const isFollowUp = /^(que mas|mas opciones|otra opcion|otra|more|anything else|que tienes)$/.test(text);
  const looksTour = /(tour|excursion|excursiones|saona|buggy|party boat|catamaran|catamaran|isla)/.test(text);
  const looksTransfer = /(traslado|transfer|aeropuerto|puj|pickup|hotel)/.test(text);
  const looksHotel = /(hotel|resort|all inclusive|todo incluido|alojamiento)/.test(text);
  const looksWater = /(agua|water|snorkel|snorkeling|boat|catamaran|isla|saona|mar|ocean|beach)/.test(text);
  const wantsPrice = /(precio|cost|cuanto|tarifa|rate|usd|dolar)/.test(text);
  const wantsPay = /(pagar|pago|payment|checkout|book|reservar|reserva)/.test(text);

  const keyword = looksWater ? "" : text.split(/\s+/).find((word) => word.length >= 4) ?? "";
  const tourWhere = (() => {
    if (looksWater) {
      return {
        OR: [
          { title: { contains: "saona", mode: "insensitive" as const } },
          { title: { contains: "catamaran", mode: "insensitive" as const } },
          { title: { contains: "party boat", mode: "insensitive" as const } },
          { title: { contains: "snorkel", mode: "insensitive" as const } },
          { description: { contains: "snorkel", mode: "insensitive" as const } },
          { description: { contains: "boat", mode: "insensitive" as const } }
        ]
      };
    }
    if (keyword) {
      return {
        OR: [
          { title: { contains: keyword, mode: "insensitive" as const } },
          { slug: { contains: keyword, mode: "insensitive" as const } }
        ]
      };
    }
    return undefined;
  })();

  const [tours, hotels, transfers] = await Promise.all([
    prisma.tour.findMany({
      where: tourWhere,
      select: { slug: true, title: true, price: true, duration: true },
      take: 3,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    }),
    prisma.transferLocation.findMany({
      where: {
        type: "HOTEL",
        active: true,
        ...(keyword ? { name: { contains: keyword, mode: "insensitive" } } : {})
      },
      select: { slug: true, name: true },
      take: 3,
      orderBy: { name: "asc" }
    }),
    prisma.transferDestination.findMany({
      where: keyword ? { name: { contains: keyword, mode: "insensitive" } } : undefined,
      select: { slug: true, name: true },
      take: 3,
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const lines: string[] = [];

  if (looksWater) {
    const tourList = tours.length
      ? tours.map(makeTourLine)
      : ["- Actividades en agua en Punta Cana: https://proactivitis.com/tours"];
    lines.push("Perfecto, para actividades en agua te recomiendo:", ...tourList);
  } else if (looksTour || (!looksTransfer && !looksHotel)) {
    const tourList = tours.length
      ? tours.map(makeTourLine)
      : ["- Tours top en Punta Cana: https://proactivitis.com/tours"];
    lines.push(isFollowUp ? "Claro, aqui tienes mas opciones recomendadas:" : "Te recomiendo estas excursiones ahora:", ...tourList);
  }

  if (looksTransfer || pagePath?.includes("/transfer") || pagePath?.includes("/traslado")) {
    const transferList = transfers.length
      ? transfers.map(makeTransferLine)
      : ["- Ver todos los traslados: https://proactivitis.com/traslado"];
    lines.push("Para traslados privados, opciones activas:", ...transferList);
  }

  if (looksHotel || pagePath?.includes("/hotel") || pagePath?.includes("/hoteles")) {
    const hotelList = hotels.length
      ? hotels.map(makeHotelLine)
      : ["- Hoteles y resorts: https://proactivitis.com/hoteles"];
    lines.push("Si quieres hotel + traslado + tours, mira estas opciones:", ...hotelList);
  }

  if (wantsPrice && !lines.length) {
    lines.push(
      "Tengo opciones por presupuesto. Dime: fecha, cantidad de personas y hotel para enviarte precio exacto ahora."
    );
  }

  if (!lines.length) {
    lines.push(
      isFollowUp
        ? "Te puedo enviar 3 opciones exactas ahora. Solo dime: fecha, hotel y cantidad de personas."
        : "Perfecto, te ayudo a cerrar tu reserva. Dime fecha de viaje, hotel y cuantas personas son."
    );
  }

  if (wantsPay) {
    lines.push("Para pagar y confirmar al instante: https://proactivitis.com/tours");
  } else {
    lines.push("Si quieres, te dejo ya el enlace de pago directo de la mejor opcion para tu grupo.");
  }

  return lines.join("\n");
}
