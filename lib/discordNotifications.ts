type DiscordBookingPayload = {
  bookingId: string;
  orderCode: string;
  tourTitle: string;
  travelDate: Date;
  startTime?: string | null;
  tripType?: string | null;
  returnTravelDate?: Date | null;
  returnStartTime?: string | null;
  customerName?: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  hotel?: string | null;
  pickup?: string | null;
  pickupNotes?: string | null;
  originAirport?: string | null;
  flightNumber?: string | null;
  paxAdults?: number | null;
  paxChildren?: number | null;
  tourOptionName?: string | null;
  tourOptionType?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  source?: string | null;
  supplierName?: string | null;
  supplierEmail?: string | null;
  agencyName?: string | null;
  agencyPhone?: string | null;
  transferVehicleName?: string | null;
  transferVehicleCategory?: string | null;
};

type DiscordTransferQuotePayload = {
  originName: string;
  destinationName: string;
  passengers: number;
  vehiclesCount: number;
};

const safeText = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const appBaseUrl = () =>
  (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://proactivitis.com"
  ).replace(/\/+$/, "");

const formatDate = (value?: Date | null) => (value ? value.toISOString().slice(0, 10) : "-");

const formatTripType = (value?: string | null) => {
  if (value === "round-trip") return "Ida y vuelta";
  if (value === "one-way") return "Solo ida";
  return safeText(value);
};

const bookingLines = (payload: DiscordBookingPayload) => {
  const paxAdults = payload.paxAdults ?? 0;
  const paxChildren = payload.paxChildren ?? 0;
  const totalPax = paxAdults + paxChildren;
  return [
    `Order: ${safeText(payload.orderCode)}`,
    `Booking ID: ${safeText(payload.bookingId)}`,
    `Service: ${safeText(payload.tourTitle)}`,
    `Option: ${safeText(payload.tourOptionName)}${payload.tourOptionType ? ` (${payload.tourOptionType})` : ""}`,
    `Date: ${formatDate(payload.travelDate)}`,
    `Time: ${safeText(payload.startTime)}`,
    `Trip type: ${formatTripType(payload.tripType)}`,
    `Return: ${formatDate(payload.returnTravelDate)} ${safeText(payload.returnStartTime)}`,
    `Customer: ${safeText(payload.customerName)}`,
    `Email: ${safeText(payload.customerEmail)}`,
    `Phone: ${safeText(payload.customerPhone)}`,
    `PAX: ${totalPax} (${paxAdults} adults, ${paxChildren} children)`,
    `Origin/Airport: ${safeText(payload.originAirport)}`,
    `Pickup: ${safeText(payload.pickup)}`,
    `Hotel/Destination: ${safeText(payload.hotel)}`,
    `Flight: ${safeText(payload.flightNumber)}`,
    `Vehicle: ${safeText(payload.transferVehicleName)} ${safeText(payload.transferVehicleCategory)}`,
    `Supplier: ${safeText(payload.supplierName)} <${safeText(payload.supplierEmail)}>`,
    `Agency: ${safeText(payload.agencyName)} ${safeText(payload.agencyPhone)}`,
    `Payment: ${safeText(payload.paymentStatus)} / ${safeText(payload.paymentMethod)}`,
    `Source: ${safeText(payload.source)}`,
    `Total USD: ${payload.totalAmount.toFixed(2)}`,
    `Notes: ${safeText(payload.pickupNotes)}`,
    `Admin: ${appBaseUrl()}/admin/bookings?tab=all&bookingId=${encodeURIComponent(
      payload.bookingId
    )}&code=${encodeURIComponent(payload.orderCode)}`
  ];
};

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
    ...bookingLines(payload)
  ];
  await postDiscordMessage(webhook, lines);
}

export async function notifyDiscordTransferBookingConfirmed(payload: DiscordBookingPayload) {
  const webhook = resolveWebhook("transfer");
  const lines = [
    "New transfer booking confirmed",
    ...bookingLines(payload)
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
