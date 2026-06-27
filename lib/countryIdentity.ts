const normalizeCountryToken = (value?: string | null) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const DOMINICAN_REPUBLIC_TOKENS = new Set([
  "rd",
  "do",
  "dominican-republic",
  "republica-dominicana",
  "dominican-republic-do"
]);

export const isDominicanRepublicCountry = (value?: string | null) =>
  DOMINICAN_REPUBLIC_TOKENS.has(normalizeCountryToken(value));

export const sameCountryIdentity = (left?: string | null, right?: string | null) => {
  const normalizedLeft = normalizeCountryToken(left);
  const normalizedRight = normalizeCountryToken(right);
  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;
  return isDominicanRepublicCountry(normalizedLeft) && isDominicanRepublicCountry(normalizedRight);
};

export const countryIdentityVariants = (value?: string | null) => {
  if (isDominicanRepublicCountry(value)) {
    return ["RD", "DO", "DOMINICAN-REPUBLIC", "REPUBLICA-DOMINICANA"];
  }
  const normalized = (value ?? "").trim();
  return normalized ? [normalized] : [];
};
