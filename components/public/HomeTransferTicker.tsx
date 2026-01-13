"use client";

import { useEffect, useState } from "react";
import { Locale, translate } from "@/lib/translations";

const routes = [
  { origin: "PUJ", destination: "Bavaro" },
  { origin: "PUJ", destination: "Cap Cana" },
  { origin: "PUJ", destination: "Uvero Alto" },
  { origin: "Santo Domingo", destination: "Punta Cana" },
  { origin: "PUJ", destination: "Macao" }
] as const;

const ROTATE_MS = 6000;

type Props = {
  locale: Locale;
};

export default function HomeTransferTicker({ locale }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % routes.length);
    }, ROTATE_MS);

    return () => clearInterval(timer);
  }, []);

  const current = routes[index];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
      <span>
        {translate(locale, "home.transferBanner.originLabel")}: {current.origin}
      </span>
      <div className="relative flex items-center gap-2">
        <div className="relative h-1 w-16 rounded-full bg-white/30">
          <span className="transfer-route-dot absolute -top-1 h-3 w-3 rounded-full bg-emerald-300 shadow-sm" />
        </div>
        <span className="text-white/70">{translate(locale, "home.transferBanner.click")}</span>
      </div>
      <span>
        {translate(locale, "home.transferBanner.destinationLabel")}: {current.destination}
      </span>
      <span>
        {translate(locale, "home.transferBanner.vehicleLabel")}: {translate(locale, "home.transferBanner.vehicleOptions")}
      </span>
    </div>
  );
}
