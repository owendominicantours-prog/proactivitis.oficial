"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

type AnalyticsItem = {
  item_id?: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

export default function BookingPurchaseTracker({
  transactionId,
  value,
  currency = "USD",
  coupon,
  items
}: {
  transactionId: string;
  value: number;
  currency?: string;
  coupon?: string | null;
  items: AnalyticsItem[];
}) {
  useEffect(() => {
    if (!transactionId || !items.length || !Number.isFinite(value)) return;
    trackPurchase({
      transaction_id: transactionId,
      value,
      currency,
      coupon: coupon ?? undefined,
      items
    });
  }, [coupon, currency, items, transactionId, value]);

  return null;
}
