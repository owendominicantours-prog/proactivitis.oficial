import { Prisma } from "@prisma/client";

import {
  containsInsensitive,
  countryMatchesScopeText,
  isDominicanRepublicScope,
  isGlobalScope,
  normalizeScopeText,
  scopeAllows,
  textMatchesScope,
  uniqueScopeItems,
  type WorkplaceScope
} from "@/lib/workplaceFilters";

export type WorkplaceBookingFilters = {
  q?: string;
  status?: string;
  type?: string;
  date?: string;
};

const insensitive = Prisma.QueryMode.insensitive;

const countryConditionsForBooking = (term: string): Prisma.BookingWhereInput[] => {
  if (isDominicanRepublicScope(term)) {
    return [
      { Tour: { countryId: { equals: "RD", mode: insensitive } } },
      { Tour: { country: { is: { code: { equals: "RD", mode: insensitive } } } } },
      { pickup: containsInsensitive("Republica Dominicana") },
      { hotel: containsInsensitive("Republica Dominicana") },
      { originAirport: containsInsensitive("PUJ") },
      { originAirport: containsInsensitive("SDQ") },
      { pickupNotes: containsInsensitive("Republica Dominicana") }
    ];
  }

  return [
    { Tour: { countryId: { equals: term.toUpperCase(), mode: insensitive } } },
    { Tour: { country: { is: { name: containsInsensitive(term) } } } },
    { pickup: containsInsensitive(term) },
    { hotel: containsInsensitive(term) },
    { originAirport: containsInsensitive(term) },
    { pickupNotes: containsInsensitive(term) }
  ];
};

export function workplaceScopeAllowsBookingType(scope: WorkplaceScope, type: string) {
  if (isGlobalScope(scope.modules) && isGlobalScope(scope.niches)) return true;

  const moduleAllowed =
    isGlobalScope(scope.modules) ||
    scope.modules.some((module) => {
      const normalized = normalizeScopeText(module);
      if (type === "tour") return ["tour", "tours", "bookings", "reservas"].includes(normalized);
      if (type === "transfer") return ["transfer", "transfers", "traslados", "bookings", "reservas"].includes(normalized);
      if (type === "rent_car") return ["rent_car", "rent car", "renta car", "bookings", "reservas"].includes(normalized);
      return false;
    });

  const nicheAllowed =
    isGlobalScope(scope.niches) ||
    (type === "tour" && scopeAllows(scope.niches, ["tour", "tours", "experiencias", "excursiones"])) ||
    (type === "transfer" && scopeAllows(scope.niches, ["transfer", "transfers", "traslados"])) ||
    (type === "rent_car" && scopeAllows(scope.niches, ["rent car", "rent_car", "renta car", "renta de carro"]));

  return moduleAllowed && nicheAllowed;
}

export function buildWorkplaceBookingWhere(scope: WorkplaceScope, filters: WorkplaceBookingFilters = {}) {
  const and: Prisma.BookingWhereInput[] = [];

  const typeOr: Prisma.BookingWhereInput[] = [];
  if (workplaceScopeAllowsBookingType(scope, "tour")) {
    typeOr.push({ OR: [{ flowType: "tour" }, { flowType: null }] });
  }
  if (workplaceScopeAllowsBookingType(scope, "transfer")) {
    typeOr.push({ flowType: "transfer" });
  }
  if (workplaceScopeAllowsBookingType(scope, "rent_car")) {
    typeOr.push({ flowType: "rent_car" });
  }
  if (!typeOr.length) return { id: "__no_booking_access__" } satisfies Prisma.BookingWhereInput;
  and.push({ OR: typeOr });

  const countryTerms = uniqueScopeItems(scope.countries);
  if (!isGlobalScope(countryTerms)) {
    and.push({ OR: countryTerms.flatMap((term) => countryConditionsForBooking(term)) });
  }

  const cityTerms = uniqueScopeItems(scope.cities);
  if (!isGlobalScope(cityTerms)) {
    and.push({
      OR: cityTerms.flatMap((term) => [
        { pickup: containsInsensitive(term) },
        { hotel: containsInsensitive(term) },
        { originAirport: containsInsensitive(term) },
        { pickupNotes: containsInsensitive(term) },
        { Tour: { location: containsInsensitive(term) } },
        { Tour: { destination: { is: { name: containsInsensitive(term) } } } },
        { Tour: { microZone: { is: { name: containsInsensitive(term) } } } }
      ])
    });
  }

  const companyTerms = uniqueScopeItems(scope.companies);
  if (!isGlobalScope(companyTerms)) {
    and.push({
      OR: companyTerms.map((term) => ({
        Tour: { SupplierProfile: { is: { company: containsInsensitive(term) } } }
      }))
    });
  }

  const productTerms = uniqueScopeItems(scope.products);
  if (!isGlobalScope(productTerms)) {
    and.push({
      OR: productTerms.flatMap((term) => [
        { Tour: { title: containsInsensitive(term) } },
        { Tour: { productId: containsInsensitive(term) } },
        { Tour: { slug: containsInsensitive(normalizeScopeText(term).replace(/\s+/g, "-")) } },
        { pickupNotes: containsInsensitive(term) }
      ])
    });
  }

  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { bookingCode: containsInsensitive(q) },
        { customerName: containsInsensitive(q) },
        { customerEmail: containsInsensitive(q) },
        { customerPhone: containsInsensitive(q) },
        { pickup: containsInsensitive(q) },
        { hotel: containsInsensitive(q) },
        { Tour: { title: containsInsensitive(q) } },
        { Tour: { SupplierProfile: { is: { company: containsInsensitive(q) } } } }
      ]
    });
  }

  if (filters.status && filters.status !== "all") {
    and.push({ status: { equals: filters.status, mode: insensitive } });
  }
  if (filters.type && filters.type !== "all") {
    and.push({ flowType: filters.type });
  }
  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(`${filters.date}T23:59:59.999Z`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      and.push({ travelDate: { gte: start, lte: end } });
    }
  }

  return and.length ? ({ AND: and } satisfies Prisma.BookingWhereInput) : ({} satisfies Prisma.BookingWhereInput);
}

export function bookingMatchesScopeText(value: string, scope: WorkplaceScope) {
  const countryOk = countryMatchesScopeText(value, scope.countries);
  const cityOk = textMatchesScope(value, scope.cities);
  return countryOk && cityOk;
}
