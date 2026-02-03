"use client";

import { useEffect } from "react";

export default function BookingEmailDispatcher({ bookingId }: { bookingId: string }) {
  useEffect(() => {
    if (!bookingId) return;
    const controller = new AbortController();
    fetch("/api/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bookingId }),
      signal: controller.signal
    }).catch(() => {
      // Intentionally silent: email dispatch retry happens on refresh.
    });
    return () => controller.abort();
  }, [bookingId]);

  return null;
}
