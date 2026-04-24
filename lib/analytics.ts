export const GA_MEASUREMENT_ID = "G-R3L9DE7KXL";
export const GOOGLE_ADS_ID = "AW-17889405007";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsItem = {
  item_id?: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

type PurchasePayload = {
  transaction_id: string;
  value: number;
  currency?: string;
  coupon?: string;
  items: AnalyticsItem[];
};

type BeginCheckoutPayload = {
  currency?: string;
  value: number;
  items: AnalyticsItem[];
};

const isBrowser = () => typeof window !== "undefined";

const trackDeduped = (scope: "session" | "local", key: string, callback: () => void) => {
  if (!isBrowser()) return;
  const storage = scope === "local" ? window.localStorage : window.sessionStorage;
  if (storage.getItem(key)) return;
  callback();
  storage.setItem(key, "1");
};

export const gtag = (...args: unknown[]) => {
  if (!isBrowser() || typeof window.gtag !== "function") return;
  window.gtag(...args);
};

export const trackPageView = (url: string) => {
  gtag("event", "page_view", {
    page_location: url,
    page_path: new URL(url).pathname + new URL(url).search,
    send_to: GA_MEASUREMENT_ID
  });
};

export const trackEvent = (name: string, params: Record<string, unknown>) => {
  gtag("event", name, params);
};

export const trackBeginCheckout = (payload: BeginCheckoutPayload, dedupeKey: string) => {
  trackDeduped("session", `ga4_begin_checkout_${dedupeKey}`, () => {
    trackEvent("begin_checkout", {
      currency: payload.currency ?? "USD",
      value: payload.value,
      items: payload.items
    });
  });
};

export const trackPurchase = (payload: PurchasePayload) => {
  trackDeduped("local", `ga4_purchase_${payload.transaction_id}`, () => {
    trackEvent("purchase", {
      transaction_id: payload.transaction_id,
      value: payload.value,
      currency: payload.currency ?? "USD",
      coupon: payload.coupon,
      items: payload.items
    });
  });
};
