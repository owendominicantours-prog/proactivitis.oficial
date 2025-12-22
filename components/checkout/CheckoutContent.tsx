"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutFlow, { type CheckoutPageParams } from "@/components/checkout/CheckoutFlow";

const normalizeParam = (value: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
};

export default function CheckoutContent() {
  const searchParams = useSearchParams();

  const initialParams: CheckoutPageParams = useMemo(() => {
    const get = (key: string) => normalizeParam(searchParams.get(key));
    return {
      tourId: get("tourId"),
      tourTitle: get("tourTitle"),
      tourImage: get("tourImage"),
      tourPrice: get("tourPrice"),
      date: get("date"),
      time: get("time"),
      adults: get("adults"),
      youth: get("youth"),
      child: get("child"),
      hotelSlug: get("hotelSlug"),
      bookingCode: get("bookingCode"),
      originHotelName: get("originHotelName")
    };
  }, [searchParams]);

  return <CheckoutFlow initialParams={initialParams} />;
}
