"use client";

import { useState } from "react";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";

type OptionCard = {
  id: string;
  name: string;
  description?: string | null;
  priceLabel: string;
  details: string[];
  pickupTimes: string[];
  image: string;
  ctaLabel: string;
};

type BookingProps = React.ComponentProps<typeof TourBookingWidget> & {
  initialOptionId?: string;
};

type SosuaPartyBoatOptionsProps = {
  options: OptionCard[];
  bookingProps: BookingProps;
  sectionTitle: string;
  sectionSubtitle: string;
};

export default function SosuaPartyBoatOptions({
  options,
  bookingProps,
  sectionTitle,
  sectionSubtitle
}: SosuaPartyBoatOptionsProps) {
  const [selectedOptionId, setSelectedOptionId] = useState(options[0]?.id ?? "");

  return (
    <section id="options" className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 lg:grid-cols-[1fr,380px]">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{sectionTitle}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{sectionSubtitle}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOptionId(option.id)}
              className={`group overflow-hidden rounded-[28px] border text-left shadow-sm transition hover:-translate-y-0.5 ${
                option.id === selectedOptionId
                  ? "border-emerald-400 bg-emerald-50/70"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="relative h-40 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={option.image} alt={option.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-900">
                  {option.priceLabel}
                </span>
              </div>
              <div className="space-y-3 px-4 pb-4 pt-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{option.name}</p>
                  {option.description && (
                    <p className="text-sm text-slate-600">{option.description}</p>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  {option.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                {!!option.pickupTimes.length && (
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {option.pickupTimes.join(" · ")}
                  </p>
                )}
                <div className="pt-2">
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                    {option.ctaLabel}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-24 self-start">
        <TourBookingWidget {...bookingProps} initialOptionId={selectedOptionId} />
      </div>
    </section>
  );
}
