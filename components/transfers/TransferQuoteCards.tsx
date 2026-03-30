"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Locale, translate } from "@/lib/translations";

type QuoteVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

type TransferQuoteCardsProps = {
  originId: string;
  destinationId: string;
  originSlug: string;
  destinationSlug: string;
  originLabel: string;
  destinationLabel: string;
  defaultDeparture: string;
  defaultPassengers?: number;
  priceFrom: number;
  locale?: Locale;
};

const ROUND_TRIP_DISCOUNT_PERCENT = Number(process.env.NEXT_PUBLIC_ROUND_TRIP_DISCOUNT_PERCENT ?? 5);

const formatDate = (value: string) => value;

const fetchQuote = async ({
  originId,
  destinationId,
  passengers
}: {
  originId: string;
  destinationId: string;
  passengers: number;
}) => {
  const response = await fetch("/api/transfers/v2/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin_location_id: originId,
      destination_location_id: destinationId,
      passengers
    })
  });
  if (!response.ok) {
    throw response;
  }
  const data = await response.json();
  return data as { vehicles: QuoteVehicle[] };
};

const transferTourId = process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID;
const transferTourTitle =
  process.env.NEXT_PUBLIC_TRANSFER_TITLE ?? "Transfer privado Proactivitis";
const transferTourImage =
  process.env.NEXT_PUBLIC_TRANSFER_IMAGE ?? "/transfer/sedan.png";

const buildCheckoutHref = ({
  vehicleId,
  vehicleName,
  vehicleCategory,
  price,
  passengers,
  originSlug,
  destinationSlug,
  originLabel,
  destinationLabel,
  tripType,
  dateTime,
  returnDatetime
}: {
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: string;
  price: number;
  passengers: number;
  originSlug: string;
  destinationSlug: string;
  originLabel: string;
  destinationLabel: string;
  tripType: "one-way" | "round-trip";
  dateTime: string;
  returnDatetime?: string;
}) => {
  const params = new URLSearchParams();
  params.set("type", "transfer");
  params.set("hotelSlug", destinationSlug);
  params.set("origin", originSlug);
  params.set("originLabel", originLabel);
  params.set("originHotelName", destinationLabel);
  if (transferTourId) {
    params.set("tourId", transferTourId);
  }
  params.set("tourTitle", transferTourTitle);
  params.set("tourImage", transferTourImage);
  params.set("vehicleId", vehicleId);
  params.set("vehicleName", vehicleName);
  params.set("vehicleCategory", vehicleCategory);
  params.set("price", price.toFixed(2));
  params.set("passengers", String(passengers));
  params.set("adults", String(passengers));
  params.set("youth", "0");
  params.set("child", "0");
  params.set("tripType", tripType);
  params.set("dateTime", dateTime);
  const totalPrice = price;
  const perPersonPrice = totalPrice / Math.max(1, passengers);
  params.set("totalPrice", totalPrice.toFixed(2));
  params.set("tourPrice", perPersonPrice.toFixed(2));
  const [datePart, timePart] = dateTime.split("T");
  if (datePart) {
    params.set("date", datePart);
  }
  if (timePart) {
    params.set("time", timePart);
  }
  if (returnDatetime) {
    params.set("returnDatetime", returnDatetime);
  }
  return `/checkout?${params.toString()}`;
};

export default function TransferQuoteCards({
  originId,
  destinationId,
  originSlug,
  destinationSlug,
  originLabel,
  destinationLabel,
  defaultDeparture,
  defaultPassengers = 2,
  priceFrom,
  locale = "es"
}: TransferQuoteCardsProps) {
  const t = useCallback(
    (key: Parameters<typeof translate>[1], replacements?: Record<string, string | number>) =>
      translate(locale, key, replacements),
    [locale]
  );
  const [passengers, setPassengers] = useState(defaultPassengers);
  const [departureDate, setDepartureDate] = useState(defaultDeparture.slice(0, 10));
  const [departureTime, setDepartureTime] = useState(defaultDeparture.slice(11, 16));
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [vehicles, setVehicles] = useState<QuoteVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departureDatetime = useMemo(
    () => `${departureDate}T${departureTime}`,
    [departureDate, departureTime]
  );
  const returnDatetime = useMemo(
    () => (returnDate && returnTime ? `${returnDate}T${returnTime}` : undefined),
    [returnDate, returnTime]
  );

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError(null);
    fetchQuote({ originId, destinationId, passengers })
      .then((data) => {
        if (!canceled) {
          setVehicles(data.vehicles);
        }
      })
      .catch((err) => {
        if (!canceled) {
          setError(t("transferQuote.error"));
          console.error(err);
        }
      })
      .finally(() => {
        if (!canceled) {
          setLoading(false);
        }
      });
    return () => {
      canceled = true;
    };
  }, [originId, destinationId, passengers, t]);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }
    const timer = setTimeout(() => setShowLoading(true), 400);
    return () => clearTimeout(timer);
  }, [loading]);

  const roundTripMultiplier = useMemo(
    () => 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100),
    []
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-500">
            {t("transferQuote.datetime")}
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
            </div>
          </label>
          <label className="space-y-1 text-sm text-slate-500">
            {t("transferQuote.passengers")}
            <input
              type="number"
              min={1}
              max={16}
              value={passengers}
              onChange={(event) => setPassengers(Math.max(1, Math.min(16, Number(event.target.value))))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTripType("one-way")}
            className={`rounded-full px-4 py-2 ${
              tripType === "one-way" ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-700"
            }`}
          >
            {t("transferQuote.oneWay")}
          </button>
          <button
            type="button"
            onClick={() => setTripType("round-trip")}
            className={`rounded-full px-4 py-2 ${
              tripType === "round-trip" ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-700"
            }`}
          >
            {t("transferQuote.roundTrip")}
          </button>
          {tripType === "round-trip" && (
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          {t("transferQuote.priceFrom", { price: priceFrom.toFixed(2) })}
        </p>
        {showLoading && <p className="text-sm text-slate-500">{t("transferQuote.updating")}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="grid gap-6 md:grid-cols-2">
          {vehicles.map((vehicle) => {
            const oneWayPrice = vehicle.price;
            const roundTripPrice = Number((vehicle.price * roundTripMultiplier).toFixed(2));
            const displayPrice = tripType === "round-trip" ? roundTripPrice : oneWayPrice;
            const reserveUrl = buildCheckoutHref({
              vehicleId: vehicle.id,
              vehicleName: vehicle.name,
              vehicleCategory: vehicle.category,
              price: displayPrice,
              passengers,
              originSlug,
              destinationSlug,
              originLabel,
              destinationLabel,
              tripType,
              dateTime: departureDatetime,
              returnDatetime: tripType === "round-trip" ? returnDatetime : undefined
            });
            return (
              <article
                key={vehicle.id}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-card transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="relative">
                  <div
                    className="aspect-[4/3] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${vehicle.imageUrl || "/transfer/sedan.png"})` }}
                    role="img"
                    aria-label={vehicle.name}
                  />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 shadow">
                      {vehicle.category}
                    </span>
                    <span className="rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 shadow">
                      Private Transfer
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="text-brand text-[10px] font-medium uppercase tracking-[0.35em]">
                    {originLabel} to {destinationLabel}
                  </p>
                  <h3 className="text-2xl font-black leading-tight text-slate-900">{vehicle.name}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {t("transferQuote.passengerRange", { min: vehicle.minPax, max: vehicle.maxPax })}
                  </p>

                  <ul className="space-y-1 border-y border-slate-50 py-2 text-xs text-slate-500">
                    <li>{t("transferQuote.bullets.private")}</li>
                    <li>{t("transferQuote.bullets.ac")}</li>
                  </ul>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                        {tripType === "round-trip" ? t("transferQuote.totalRoundTrip") : t("transferQuote.perTrip")}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-brand">${displayPrice.toFixed(2)}</span>
                        <span className="text-sm font-semibold text-slate-500">USD</span>
                      </div>
                    </div>
                    <Link
                      href={reserveUrl}
                      className="rounded-2xl bg-brand px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand/40 transition-colors group-hover:bg-brand-light"
                    >
                      {t("transferQuote.reserve")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
          {!loading && !vehicles.length && (
            <p className="text-sm text-slate-500">{t("transferQuote.noRates")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
