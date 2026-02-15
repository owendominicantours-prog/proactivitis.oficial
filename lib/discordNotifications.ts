type DiscordBookingPayload = {
  bookingId: string;
  orderCode: string;
  tourTitle: string;
  travelDate: Date;
  startTime?: string | null;
  customerName?: string | null;
  customerEmail: string;
  totalAmount: number;
  hotel?: string | null;
  originAirport?: string | null;
  paxAdults?: number | null;
  paxChildren?: number | null;
};

type DiscordTransferQuotePayload = {
  originName: string;
  destinationName: string;
  passengers: number;
  vehiclesCount: number;
};

const safeText = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const postDiscordMessage = async (webhookUrl: string, lines: string[]) => {
  if (!webhookUrl.trim()) return;
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: lines.join("\n") })
  });
};

const resolveWebhook = (kind: "tour" | "transfer") => {
  if (kind === "tour") {
    return process.env.DISCORD_TOURS_WEBHOOK_URL?.trim() || process.env.DISCORD_WEBHOOK_URL?.trim() || "";
  }
  return process.env.DISCORD_TRANSFERS_WEBHOOK_URL?.trim() || process.env.DISCORD_WEBHOOK_URL?.trim() || "";
};

export async function notifyDiscordTourBookingConfirmed(payload: DiscordBookingPayload) {
  const webhook = resolveWebhook("tour");
  const lines = [
    "New tour booking confirmed",
    `Order: ${safeText(payload.orderCode)}`,
    `Booking ID: ${safeText(payload.bookingId)}`,
    `Tour: ${safeText(payload.tourTitle)}`,
    `Date: ${payload.travelDate.toISOString().slice(0, 10)}`,
    `Time: ${safeText(payload.startTime)}`,
    `Customer: ${safeText(payload.customerName)}`,
    `Email: ${safeText(payload.customerEmail)}`,
    `PAX: ${(payload.paxAdults ?? 0) + (payload.paxChildren ?? 0)}`,
    `Total USD: ${payload.totalAmount.toFixed(2)}`
  ];
  await postDiscordMessage(webhook, lines);
}

export async function notifyDiscordTransferBookingConfirmed(payload: DiscordBookingPayload) {
  const webhook = resolveWebhook("transfer");
  const lines = [
    "New transfer booking confirmed",
    `Order: ${safeText(payload.orderCode)}`,
    `Booking ID: ${safeText(payload.bookingId)}`,
    `Service: ${safeText(payload.tourTitle)}`,
    `Date: ${payload.travelDate.toISOString().slice(0, 10)}`,
    `Time: ${safeText(payload.startTime)}`,
    `Hotel: ${safeText(payload.hotel)}`,
    `Airport: ${safeText(payload.originAirport)}`,
    `Customer: ${safeText(payload.customerName)}`,
    `Email: ${safeText(payload.customerEmail)}`,
    `PAX: ${(payload.paxAdults ?? 0) + (payload.paxChildren ?? 0)}`,
    `Total USD: ${payload.totalAmount.toFixed(2)}`
  ];
  await postDiscordMessage(webhook, lines);
}

export async function notifyDiscordTransferQuoteRequested(payload: DiscordTransferQuotePayload) {
  const webhook = resolveWebhook("transfer");
  const lines = [
    "New transfer quote request",
    `Origin: ${safeText(payload.originName)}`,
    `Destination: ${safeText(payload.destinationName)}`,
    `Passengers: ${safeText(payload.passengers)}`,
    `Vehicles found: ${safeText(payload.vehiclesCount)}`
  ];
  await postDiscordMessage(webhook, lines);
}
