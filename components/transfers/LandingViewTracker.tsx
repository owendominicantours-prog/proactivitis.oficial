"use client";

import { useEffect } from "react";

type LandingViewTrackerProps = {
  landingSlug: string;
};

export default function LandingViewTracker({ landingSlug }: LandingViewTrackerProps) {
  useEffect(() => {
    if (!landingSlug) return;
    const controller = new AbortController();
    const payload = { landingSlug };
    fetch("/api/transfers/landing-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).catch(() => {});
    return () => controller.abort();
  }, [landingSlug]);
  return null;
}
