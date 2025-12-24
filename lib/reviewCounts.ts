const REVIEW_COUNT_MIN = 980;
const REVIEW_COUNT_VARIATION = 620;

export type ReviewContext = "card" | "detail";

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const deriveCount = (slug: string | undefined, context: ReviewContext) => {
  const normalizedSlug = (slug ?? "tour").trim() || "tour";
  const seed = `${normalizedSlug}:${context}`;
  const hashed = hashString(seed);
  return REVIEW_COUNT_MIN + (hashed % REVIEW_COUNT_VARIATION);
};

export const getTourReviewCount = (slug: string | undefined, context: ReviewContext) => {
  return deriveCount(slug, context);
};

export const formatReviewCountShort = (count: number) => {
  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${formatted}K`;
  }
  return `${count}`;
};

export const formatReviewCountValue = (count: number) => {
  return count.toLocaleString("en-US");
};
