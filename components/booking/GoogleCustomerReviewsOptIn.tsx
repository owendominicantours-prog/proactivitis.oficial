"use client";

import { useEffect } from "react";

type GoogleSurveyOptInPayload = {
  merchant_id: number;
  order_id: string;
  email: string;
  delivery_country: string;
  estimated_delivery_date: string;
};

declare global {
  interface Window {
    gapi?: {
      load: (api: "surveyoptin", callback: () => void) => void;
      surveyoptin?: {
        render: (payload: GoogleSurveyOptInPayload) => void;
      };
    };
    renderOptIn?: () => void;
  }
}

type Props = {
  orderId: string;
  email: string;
  deliveryCountry?: string;
  estimatedDeliveryDate: Date | string | null;
};

const SCRIPT_ID = "google-customer-reviews-platform";

const merchantId = Number(process.env.NEXT_PUBLIC_GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID ?? "5810897403");

const toDateInputValue = (value: Date | string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

export default function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  deliveryCountry = "DO",
  estimatedDeliveryDate
}: Props) {
  useEffect(() => {
    const normalizedOrderId = orderId.trim();
    const normalizedEmail = email.trim();
    const normalizedCountry = deliveryCountry.trim().toUpperCase();
    const deliveryDate = toDateInputValue(estimatedDeliveryDate);

    if (!merchantId || !normalizedOrderId || !normalizedEmail || !normalizedCountry || !deliveryDate) {
      return;
    }

    const payload: GoogleSurveyOptInPayload = {
      merchant_id: merchantId,
      order_id: normalizedOrderId,
      email: normalizedEmail,
      delivery_country: normalizedCountry,
      estimated_delivery_date: deliveryDate
    };

    window.renderOptIn = function renderOptIn() {
      if (!window.gapi?.load) return;
      window.gapi.load("surveyoptin", () => {
        window.gapi?.surveyoptin?.render(payload);
      });
    };

    if (window.gapi?.load) {
      window.renderOptIn();
      return;
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [deliveryCountry, email, estimatedDeliveryDate, orderId]);

  return null;
}
