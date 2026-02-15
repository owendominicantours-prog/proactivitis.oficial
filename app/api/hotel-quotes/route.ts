import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notificationService";

type HotelQuotePayload = {
  hotelSlug?: string;
  hotelName?: string;
  locale?: "es" | "en" | "fr";
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  childrenAges?: string;
  rooms?: number;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

const safeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const sendDiscordNotification = async (payload: HotelQuotePayload) => {
  const webhookUrl =
    process.env.DISCORD_HOTEL_QUOTES_WEBHOOK_URL?.trim() ||
    process.env.DISCORD_WEBHOOK_URL?.trim() ||
    "";

  if (!webhookUrl) return;

  const lines = [
    "New hotel quote request",
    `Hotel: ${payload.hotelName || payload.hotelSlug || "Unknown"}`,
    `Check-in: ${payload.checkIn || "-"}`,
    `Check-out: ${payload.checkOut || "-"}`,
    `Adults: ${payload.adults ?? 0} | Children: ${payload.children ?? 0}`,
    `Children ages: ${payload.childrenAges || "-"}`,
    `Rooms: ${payload.rooms ?? 1}`,
    `Guest: ${payload.name || "-"}`,
    `Email: ${payload.email || "-"}`,
    `Phone: ${payload.phone || "-"}`,
    `Notes: ${payload.notes || "-"}`
  ];

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: lines.join("\n") })
  });
};

export async function POST(request: Request) {
  const body = (await request.json()) as HotelQuotePayload;

  const payload: HotelQuotePayload = {
    hotelSlug: safeText(body.hotelSlug),
    hotelName: safeText(body.hotelName),
    locale: body.locale,
    checkIn: safeText(body.checkIn),
    checkOut: safeText(body.checkOut),
    adults: Number(body.adults ?? 0),
    children: Number(body.children ?? 0),
    childrenAges: safeText(body.childrenAges),
    rooms: Number(body.rooms ?? 1),
    name: safeText(body.name),
    email: safeText(body.email),
    phone: safeText(body.phone),
    notes: safeText(body.notes)
  };

  if (!payload.hotelSlug || !payload.checkIn || !payload.checkOut || !payload.name || !payload.email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await createNotification({
    type: "ADMIN_CONTACT_REQUEST",
    role: "ADMIN",
    title: `Cotizacion hotel: ${payload.hotelName || payload.hotelSlug}`,
    message: `${payload.name} solicito disponibilidad del ${payload.checkIn} al ${payload.checkOut}`,
    metadata: {
      source: "HOTEL_QUOTE_WIDGET",
      payload
    }
  });

  try {
    await sendDiscordNotification(payload);
  } catch (error) {
    console.warn("Failed to send Discord hotel quote notification", error);
  }

  return NextResponse.json({ success: true });
}
