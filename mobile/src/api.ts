import { Platform } from "react-native";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

export type LocationSummary = {
  id: string;
  name: string;
  slug: string;
  type: string;
  zoneName: string | null;
};

export type QuoteVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

export type QuoteResponse = {
  routeId: string;
  currency: string;
  vehicles: QuoteVehicle[];
};

export type MobileTransferRoute = {
  id: string;
  origin: LocationSummary;
  destination: LocationSummary;
  priceFrom: number;
  currency?: string;
  zoneLabel?: string | null;
};

export type MobileUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
};

export type MobileSession = {
  token: string;
  user: MobileUser;
};

export type MobileConfig = {
  stripePublishableKey: string;
  appUrl: string;
};

export type MobileTourOption = {
  id: string;
  name: string;
  type?: string | null;
  description?: string | null;
  pricePerPerson?: number | null;
  basePrice?: number | null;
  baseCapacity?: number | null;
  extraPricePerPerson?: number | null;
  imageUrl?: string | null;
  isDefault?: boolean;
};

export type MobileTourItineraryStop = {
  time: string;
  title: string;
  description?: string | null;
};

export type MobileTour = {
  id: string;
  slug: string;
  productId?: string | null;
  title: string;
  subtitle?: string | null;
  description: string;
  fullDescription?: string | null;
  price: number;
  priceChild?: number | null;
  priceYouth?: number | null;
  duration: string;
  category: string;
  location: string;
  languages?: string[];
  timeOptions?: string[];
  operatingDays?: string[];
  pickup?: string | null;
  meetingPoint?: string | null;
  meetingInstructions?: string | null;
  requirements?: string | null;
  cancellationPolicy?: string | null;
  terms?: string | null;
  physicalLevel?: string | null;
  minAge?: number | null;
  accessibility?: string | null;
  confirmationType?: string | null;
  capacity?: number | null;
  includes: string[];
  notIncluded?: string[];
  highlights: string[];
  image: string;
  gallery: string[];
  itinerary?: MobileTourItineraryStop[];
  options: MobileTourOption[];
};

const getBrowserLocalApiBaseUrl = () => {
  if (Platform.OS !== "web") return null;
  if (typeof window === "undefined") return null;
  const host = window.location?.hostname;
  if (!host) return null;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:3000";
  }
  return null;
};

const normalizeApiBaseUrl = (value?: string | null) => {
  const candidate = value?.trim();
  if (!candidate || candidate === "undefined" || candidate === "null") return null;
  if (!/^https?:\/\//i.test(candidate)) return null;
  try {
    const parsed = new URL(candidate);
    if (!parsed.hostname || parsed.hostname === "undefined") return null;
    return parsed.origin;
  } catch {
    return null;
  }
};

export const getApiBaseUrl = () =>
  normalizeApiBaseUrl(process?.env?.EXPO_PUBLIC_API_BASE_URL) ||
  normalizeApiBaseUrl(getBrowserLocalApiBaseUrl()) ||
  "https://proactivitis.com";

const jsonFetch = async <T>(path: string, init?: RequestInit) => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const endpoint = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(endpoint, init);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `No se pudo conectar con Proactivitis (${baseUrl}): ${error.message}`
        : `No se pudo conectar con Proactivitis (${baseUrl}).`
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? "No se pudo conectar con Proactivitis.");
  return body as T;
};

const authHeader = (token?: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const fetchMobileConfig = () => jsonFetch<MobileConfig>("/api/mobile/config");

export const loginMobileUser = ({ email, password }: { email: string; password: string }) =>
  jsonFetch<MobileSession>("/api/mobile/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

export const registerMobileUser = ({
  name,
  email,
  password
}: {
  name: string;
  email: string;
  password: string;
}) =>
  jsonFetch<MobileSession>("/api/mobile/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

export const fetchMobileUser = (token: string) =>
  jsonFetch<{ user: MobileUser }>("/api/mobile/auth/me", {
    headers: authHeader(token)
  });

export const fetchTransferLocations = async (query: string) => {
  const data = await jsonFetch<{ locations: LocationSummary[] }>(
    `/api/transfers/v2/locations?query=${encodeURIComponent(query.trim())}`
  );
  return data.locations ?? [];
};

export const fetchTransferQuote = async ({
  originId,
  destinationId,
  passengers
}: {
  originId: string;
  destinationId: string;
  passengers: number;
}) =>
  jsonFetch<QuoteResponse>("/api/transfers/v2/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin_location_id: originId,
      destination_location_id: destinationId,
      passengers
    })
  });

export const fetchMobileTransferRoutes = async () => {
  const data = await jsonFetch<{ routes: MobileTransferRoute[] }>("/api/mobile/transfers");
  return data.routes ?? [];
};

export const fetchMobileTransferLocations = async () => {
  const data = await jsonFetch<{ locations: LocationSummary[] }>("/api/mobile/transfer-locations");
  return data.locations ?? [];
};

export const fetchMobileTours = async () => {
  const data = await jsonFetch<{ tours: MobileTour[] }>("/api/mobile/tours?limit=50");
  return data.tours ?? [];
};

const todayPlus = (days: number) => {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
};

export const buildTourCheckoutUrl = ({
  tour,
  option,
  adults = 2,
  date = todayPlus(1),
  time = "09:00"
}: {
  tour: MobileTour;
  option?: MobileTourOption | null;
  adults?: number;
  date?: string;
  time?: string;
}) => {
  const pricePerPerson = option?.pricePerPerson ?? tour.price;
  const totalPrice = option?.basePrice && option.baseCapacity ? option.basePrice : pricePerPerson * adults;
  const params = new URLSearchParams();
  params.set("tourId", tour.id);
  params.set("tourTitle", tour.title);
  params.set("tourImage", tour.image);
  params.set("tourPrice", String(pricePerPerson));
  params.set("totalPrice", String(totalPrice));
  params.set("date", date);
  params.set("time", time);
  params.set("adults", String(adults));
  params.set("youth", "0");
  params.set("child", "0");
  if (option) {
    params.set("tourOptionId", option.id);
    params.set("tourOptionName", option.name);
    if (option.type) params.set("tourOptionType", option.type);
    if (option.pricePerPerson) params.set("tourOptionPrice", String(option.pricePerPerson));
    if (option.basePrice) params.set("tourOptionBasePrice", String(option.basePrice));
    if (option.baseCapacity) params.set("tourOptionBaseCapacity", String(option.baseCapacity));
    if (option.extraPricePerPerson) params.set("tourOptionExtraPricePerPerson", String(option.extraPricePerPerson));
  }
  return `${getApiBaseUrl().replace(/\/$/, "")}/checkout?${params.toString()}`;
};

export type MobilePaymentIntentPayload = Record<string, string | number | null | undefined>;

export type MobilePaymentIntentResponse = {
  bookingId: string;
  amount: number;
  paymentIntentId: string;
  clientSecret: string | null;
};

export const createMobilePaymentIntent = (payload: MobilePaymentIntentPayload, token?: string | null) =>
  jsonFetch<MobilePaymentIntentResponse>("/api/checkout/payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token)
    },
    body: JSON.stringify(payload)
  });

export const confirmMobileBooking = ({
  bookingId,
  paymentIntentId,
  token
}: {
  bookingId: string;
  paymentIntentId?: string | null;
  token?: string | null;
}) =>
  jsonFetch<{ ok: boolean; error?: string }>("/api/session/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token)
    },
    body: JSON.stringify({ bookingId, paymentIntentId })
  });

export const buildCheckoutUrl = ({
  origin,
  destination,
  vehicle,
  passengers,
  price,
  tripType,
  departureDate,
  departureTime,
  returnDate,
  returnTime
}: {
  origin: LocationSummary;
  destination: LocationSummary;
  vehicle: QuoteVehicle;
  passengers: number;
  price: number;
  tripType: "one-way" | "round-trip";
  departureDate: string;
  departureTime: string;
  returnDate?: string;
  returnTime?: string;
}) => {
  const params = new URLSearchParams();
  params.set("type", "transfer");
  params.set("hotelSlug", destination.slug);
  params.set("origin", origin.slug);
  params.set("originLabel", origin.name);
  params.set("originHotelName", destination.name);
  params.set("vehicleId", vehicle.id);
  params.set("vehicleName", vehicle.name);
  params.set("vehicleCategory", vehicle.category);
  if (vehicle.imageUrl) params.set("vehicleImage", vehicle.imageUrl);
  params.set("price", price.toFixed(2));
  params.set("passengers", String(passengers));
  params.set("adults", String(passengers));
  params.set("youth", "0");
  params.set("child", "0");
  params.set("tripType", tripType);
  params.set("totalPrice", price.toFixed(2));
  params.set("tourPrice", (price / Math.max(1, passengers)).toFixed(2));
  if (departureDate) {
    params.set("date", departureDate);
  }
  if (departureTime) {
    params.set("time", departureTime);
  }
  if (departureDate && departureTime) {
    params.set("dateTime", `${departureDate}T${departureTime}`);
  }
  if (returnDate && returnTime) {
    params.set("returnDatetime", `${returnDate}T${returnTime}`);
  }
  return `${getApiBaseUrl().replace(/\/$/, "")}/checkout?${params.toString()}`;
};
