const COLON_SPACING_REGEX = /(?<!\d)\s*:\s*(?=[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g;

export const normalizeColonSpacing = (value: string): string =>
  value.replace(COLON_SPACING_REGEX, ": ");

export const normalizeTextDeep = <T>(value: T): T => {
  if (typeof value === "string") {
    return normalizeColonSpacing(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTextDeep(item)) as T;
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

