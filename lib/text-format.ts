const COLON_SPACING_REGEX = /(?<!\d)\s*:\s*(?=[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g;

export const normalizeColonSpacing = (value: string): string =>
  value.replace(COLON_SPACING_REGEX, ": ");

const ENCODING_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Ã¡/g, "á"],
  [/Ã©/g, "é"],
  [/Ã­/g, "í"],
  [/Ã³/g, "ó"],
  [/Ãº/g, "ú"],
  [/Ã¼/g, "ü"],
  [/Ã±/g, "ñ"],
  [/Ã/g, "Á"],
  [/Ã‰/g, "É"],
  [/Ã/g, "Í"],
  [/Ã“/g, "Ó"],
  [/Ãš/g, "Ú"],
  [/Ãœ/g, "Ü"],
  [/Ã‘/g, "Ñ"],
  [/Â·/g, "·"],
  [/Â¿/g, "¿"],
  [/Â¡/g, "¡"],
  [/â€¢/g, "•"],
  [/â€“|â€”/g, "-"],
  [/â€˜|â€™/g, "'"],
  [/â€œ|â€�/g, '"'],
  [/â€¦/g, "..."]
];

export const normalizeDisplayText = (value: string): string =>
  ENCODING_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    normalizeColonSpacing(value)
  );

export const normalizeTextDeep = <T>(value: T): T => {
  if (typeof value === "string") {
    return normalizeDisplayText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTextDeep(item)) as T;
  }
  if (value instanceof Date) {
    return value;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      normalizeTextDeep(item)
    ]);
    return Object.fromEntries(entries) as T;
  }
  return value;
};

export const ensureLeadingCapital = (value: string): string => {
  const text = value ?? "";
  if (!text) return text;
  const chars = [...text];
  const firstLetterIndex = chars.findIndex((char) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(char));
  if (firstLetterIndex < 0) return text;
  const updated = [...chars];
  updated[firstLetterIndex] = updated[firstLetterIndex].toLocaleUpperCase();
  return updated.join("");
};
