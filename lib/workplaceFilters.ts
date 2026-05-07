import { Prisma } from "@prisma/client";

export type WorkplaceScope = {
  countries: string[];
  cities: string[];
  niches: string[];
  products: string[];
  companies: string[];
  modules: string[];
};

export const normalizeScopeText = (value?: string | null) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const isGlobalScope = (items: string[]) => {
  if (!items.length) return true;
  return items.some((item) => {
    const normalized = normalizeScopeText(item);
    return normalized === "*" || normalized === "global" || normalized === "all" || normalized === "todos";
  });
};

export const containsInsensitive = (value: string): Prisma.StringFilter => ({
  contains: value,
  mode: Prisma.QueryMode.insensitive
});

export const uniqueScopeItems = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 40);

export const scopeAllows = (items: string[], allowed: string[]) => {
  if (isGlobalScope(items)) return true;
  const allowedSet = allowed.map(normalizeScopeText);
  return items.some((item) => {
    const normalized = normalizeScopeText(item);
    return allowedSet.some((allowedItem) => normalized === allowedItem || normalized.includes(allowedItem));
  });
};

export const isDominicanRepublicScope = (value: string) => {
  const normalized = normalizeScopeText(value);
  return (
    normalized === "rd" ||
    normalized === "do" ||
    normalized.includes("dominican republic") ||
    normalized.includes("dominican republica") ||
    normalized.includes("republica dominicana") ||
    normalized.includes("dominicana")
  );
};

export const countryMatchesScopeText = (value: string, countryScope: string[]) => {
  if (isGlobalScope(countryScope)) return true;
  const normalizedValue = normalizeScopeText(value);
  return countryScope.some((country) => {
    const normalizedCountry = normalizeScopeText(country);
    if (isDominicanRepublicScope(country)) {
      return (
        normalizedValue.includes("rd") ||
        normalizedValue.includes("republica dominicana") ||
        normalizedValue.includes("dominican republic") ||
        normalizedValue.includes("dominicana")
      );
    }
    return normalizedValue.includes(normalizedCountry) || normalizedCountry.includes(normalizedValue);
  });
};

export const textMatchesScope = (value: string, scopeItems: string[]) => {
  if (isGlobalScope(scopeItems)) return true;
  const normalizedValue = normalizeScopeText(value);
  return scopeItems.some((item) => {
    const normalizedItem = normalizeScopeText(item);
    return normalizedValue.includes(normalizedItem) || normalizedItem.includes(normalizedValue);
  });
};

export const formatScopeLine = (scope: WorkplaceScope) => {
  const city = isGlobalScope(scope.cities) ? "todas las zonas asignadas" : scope.cities.slice(0, 3).join(", ");
  const country = isGlobalScope(scope.countries)
    ? "todos los mercados autorizados"
    : scope.countries
        .slice(0, 2)
        .map((item) => (isDominicanRepublicScope(item) ? "Republica Dominicana" : item))
        .join(", ");
  return `${city} - ${country}`;
};
