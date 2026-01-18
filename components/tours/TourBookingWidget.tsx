"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";

type TimeSlotOption = {
  hour: number;
  minute: string;
  period: "AM" | "PM";
};

type TravelerGroup = {
  label: string;
  range: string;
  count: number;
  setter: Dispatch<SetStateAction<number>>;
};

type TourBookingWidgetProps = {
  tourId: string;
  basePrice: number;
  timeSlots: TimeSlotOption[];
  options?: TourOption[];
  supplierHasStripeAccount: boolean;
  platformSharePercent: number;
  tourTitle: string;
  tourImage?: string;
  hotelSlug?: string;
  bookingCode?: string;
  originHotelName?: string;
  initialOptionId?: string;
  discountPercent?: number;
};

type TourOption = {
  id: string;
  name: string;
  type?: string | null;
  description?: string | null;
  pricePerPerson?: number | null;
  basePrice?: number | null;
  baseCapacity?: number | null;
  extraPricePerPerson?: number | null;
  pickupTimes?: string[] | null;
  isDefault?: boolean | null;
  active?: boolean | null;
};

type OptionPricing = {
  pricePerPerson: number;
  totalPrice: number;
  summaryLabel: string;
};

const resolveOptionPricing = (
  option: TourOption | null,
  travelers: number,
  fallbackPrice: number
): OptionPricing => {
  if (!option) {
    const total = fallbackPrice * travelers;
    return {
      pricePerPerson: fallbackPrice,
      totalPrice: total,
      summaryLabel: `$${fallbackPrice.toFixed(2)} USD por persona`
    };
  }

  const basePrice = option.basePrice ?? null;
  const baseCapacity = option.baseCapacity ?? null;
  const extraPrice =
    option.extraPricePerPerson ?? option.pricePerPerson ?? fallbackPrice;
  let total = 0;
  if (basePrice && baseCapacity) {
    const extras = Math.max(0, travelers - baseCapacity);
    total = basePrice + extras * extraPrice;
  } else if (basePrice && !baseCapacity) {
    total = basePrice;
  } else if (option.pricePerPerson) {
    total = option.pricePerPerson * travelers;
  } else {
    total = fallbackPrice * travelers;
  }

  const perPerson =
    option.pricePerPerson ?? (travelers > 0 ? total / travelers : fallbackPrice);
  const summaryLabel = option.basePrice
    ? `$${total.toFixed(2)} USD total`
    : `$${perPerson.toFixed(2)} USD por persona`;

  return { pricePerPerson: perPerson, totalPrice: total, summaryLabel };
};

export function TourBookingWidget({
  tourId,
  basePrice,
  timeSlots,
  options,
  supplierHasStripeAccount: _supplierHasStripeAccount,
  platformSharePercent: _platformSharePercent,
  tourTitle,
  tourImage,
  hotelSlug,
  bookingCode,
  originHotelName,
  initialOptionId,
  discountPercent = 0
}: TourBookingWidgetProps) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [youth, setYouth] = useState(0);
  const [child, setChild] = useState(0);
  const [showTravelersPopover, setShowTravelersPopover] = useState(false);
  const resolvedOptions = (options ?? []).filter((option) => option.active !== false);
  const defaultOption =
    resolvedOptions.find((option) => option.isDefault) ?? resolvedOptions[0] ?? null;
  const [selectedOptionId, setSelectedOptionId] = useState(
    initialOptionId ?? defaultOption?.id ?? ""
  );

  const selectedOption =
    resolvedOptions.find((option) => option.id === selectedOptionId) ?? defaultOption;

  const optionPickupTimes = selectedOption?.pickupTimes?.filter(Boolean) ?? [];
  const timeSlotLabels = useMemo(() => {
    if (optionPickupTimes.length) return optionPickupTimes;
    return timeSlots.map((slot) => formatTimeOption(slot));
  }, [optionPickupTimes, timeSlots]);

  const [selectedTime, setSelectedTime] = useState(() =>
    timeSlotLabels.length ? timeSlotLabels[0] : ""
  );

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const totalTravelers = Math.max(1, adults + youth + child);
  const pricing = resolveOptionPricing(selectedOption ?? null, totalTravelers, basePrice);
  const discountMultiplier = discountPercent > 0 ? 1 - discountPercent / 100 : 1;
  const discountedTotal = Math.round(pricing.totalPrice * discountMultiplier * 100) / 100;
  const discountedPerPerson = Math.round(pricing.pricePerPerson * discountMultiplier * 100) / 100;
  const estimatedTotal = discountedTotal;
  const bookingLabel = originHotelName
    ? `Reservar Buggy con recogida en ${originHotelName}`
    : "Reservar Ahora";
  const baseCapacityLabel = selectedOption?.baseCapacity
    ? `1-${selectedOption.baseCapacity} pax`
    : "grupo base";
  const priceHeaderValue = selectedOption?.basePrice ? discountedTotal : discountedPerPerson;
  const priceHeaderNote = selectedOption?.basePrice
    ? `Total (${baseCapacityLabel})`
    : "Por persona";

  useEffect(() => {
    if (!selectedOptionId && defaultOption?.id) {
      setSelectedOptionId(defaultOption.id);
    }
  }, [defaultOption, selectedOptionId]);

  useEffect(() => {
    if (initialOptionId) {
      setSelectedOptionId(initialOptionId);
    }
  }, [initialOptionId]);

  useEffect(() => {
    if (!timeSlotLabels.length) return;
    if (!selectedTime || !timeSlotLabels.includes(selectedTime)) {
      setSelectedTime(timeSlotLabels[0]);
    }
  }, [selectedTime, timeSlotLabels]);

  const handleCheckAvailability = () => {
    if (!date) return;
    const params = new URLSearchParams({
      tourId,
      date,
      time: selectedTime,
      adults: adults.toString(),
      youth: youth.toString(),
      child: child.toString()
    });
    params.set("tourTitle", tourTitle);
    if (tourImage) {
      params.set("tourImage", tourImage);
    }
    if (selectedOption?.id) {
      params.set("tourOptionId", selectedOption.id);
      params.set("tourOptionName", selectedOption.name);
      if (selectedOption.type) params.set("tourOptionType", selectedOption.type);
      if (selectedOption.pricePerPerson !== undefined && selectedOption.pricePerPerson !== null) {
        params.set("tourOptionPrice", selectedOption.pricePerPerson.toString());
      }
      if (selectedOption.basePrice !== undefined && selectedOption.basePrice !== null) {
        params.set("tourOptionBasePrice", selectedOption.basePrice.toString());
      }
      if (selectedOption.baseCapacity !== undefined && selectedOption.baseCapacity !== null) {
        params.set("tourOptionBaseCapacity", selectedOption.baseCapacity.toString());
      }
      if (
        selectedOption.extraPricePerPerson !== undefined &&
        selectedOption.extraPricePerPerson !== null
      ) {
        params.set("tourOptionExtraPricePerPerson", selectedOption.extraPricePerPerson.toString());
      }
    }
    params.set("tourPrice", discountedPerPerson.toString());
    params.set("totalPrice", discountedTotal.toString());
    if (hotelSlug) params.set("hotelSlug", hotelSlug);
    if (bookingCode) params.set("bookingCode", bookingCode);
    if (originHotelName) params.set("originHotelName", originHotelName);
    router.push(`/checkout?${params.toString()}`);
  };

  const travelersSummary = () => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} adult${adults > 1 ? "s" : ""}`);
    if (youth > 0) parts.push(`${youth} youth`);
    if (child > 0) parts.push(`${child} child${child > 1 ? "ren" : ""}`);
    if (!parts.length) return "1 traveler";
    return parts.join(", ");
  };

  const handlePopperToggle = () => {
    setShowTravelersPopover((prev) => !prev);
  };

  const handleApplyTravelers = () => {
    setShowTravelersPopover(false);
  };

  const handleIncrement =
    (setter: Dispatch<SetStateAction<number>>, limit = 15) =>
    () =>
      setter((prev) => Math.min(limit, prev + 1));

  const handleDecrement =
    (setter: Dispatch<SetStateAction<number>>) =>
    () =>
      setter((prev) => Math.max(0, prev - 1));

  useEffect(() => {
    if (!showTravelersPopover) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setShowTravelersPopover(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showTravelersPopover]);

  const travelerGroups: TravelerGroup[] = [
    { label: "Adult", range: "Age 17-99", count: adults, setter: setAdults },
    { label: "Youth", range: "Age 10-16", count: youth, setter: setYouth },
    { label: "Child", range: "Age 1-9", count: child, setter: setChild }
  ];

  return (
    <div className="relative w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      {resolvedOptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-500">Opcion</p>
          <div className="space-y-2">
            {resolvedOptions.map((option) => {
              const optionPricing = resolveOptionPricing(option, totalTravelers, basePrice);
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-3 py-2 text-xs ${
                    option.id === selectedOption?.id
                      ? "border-sky-400 bg-sky-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="tourOption"
                      checked={option.id === selectedOption?.id}
                      onChange={() => setSelectedOptionId(option.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{option.name}</p>
                      {option.description && (
                        <p className="text-xs text-slate-500">{option.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{optionPricing.summaryLabel}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      {/* PRICE HEADER */}
      <div className="space-y-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-500">From price</p>
        <p className="text-3xl font-semibold text-slate-900">
          ${priceHeaderValue.toFixed(2)} <span className="text-xs font-normal text-slate-500">USD</span>
        </p>
        <p className="text-xs text-slate-600">{priceHeaderNote} - Confirmacion inmediata</p>
      </div>

      {/* ESTIMATED TOTAL */}
      <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
        <span className="font-semibold">Estimated total:</span> ${estimatedTotal.toFixed(2)} for {totalTravelers} traveler
        {totalTravelers > 1 ? "s" : ""}
      </div>

      {/* DATE + TRAVELERS + START TIME */}
      <div className="rounded-xl border border-slate-200">
      <div className="grid grid-cols-[1.15fr,1fr] divide-x divide-slate-200">
          {/* DATE */}
          <div className="flex flex-col px-4 py-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full border-none bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>

          {/* TRAVELERS */}
          <div className="relative flex flex-col px-4 py-2">
            <button ref={triggerRef} type="button" onClick={handlePopperToggle} className="w-full text-left outline-none">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Travelers</span>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {totalTravelers} traveler{totalTravelers > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-slate-500">{travelersSummary()}</p>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-100 px-4 py-2 space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Start time</p>
          {timeSlotLabels.length > 1 ? (
            <select
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
            >
              {timeSlotLabels.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          ) : timeSlotLabels.length === 1 ? (
            <p className="text-xs font-semibold text-slate-900">{timeSlotLabels[0]}</p>
          ) : (
            <p className="text-xs text-slate-500">Start time will be confirmed after booking.</p>
          )}
        </div>
      </div>

      {/* Travelers popover */}
      {showTravelersPopover && (
        <div
          ref={popoverRef}
          className="absolute left-1/2 top-[165px] z-[9999] mt-2 w-[300px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Select up to 15 travelers in total.
          </p>

          <div className="mt-3 space-y-3">
            {travelerGroups.map(({ label, range, count, setter }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-[0.65rem] text-slate-500">{range}</p>
                </div>
                <div className="flex items-center gap-3 text-base font-semibold">
                  <button
                    type="button"
                    onClick={handleDecrement(setter)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="min-w-[24px] text-center">{count}</span>
                  <button
                    type="button"
                    onClick={handleIncrement(setter)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleApplyTravelers}
            className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
          >
            Apply
          </button>
        </div>
      )}

      {/* MAIN CTA */}
      <button
        type="button"
        onClick={handleCheckAvailability}
        disabled={!date}
        className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
          date ? "bg-sky-500 hover:bg-sky-600" : "cursor-not-allowed bg-slate-300"
        }`}
      >
        Check availability
      </button>

      {/* BENEFITS */}
      <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-xs text-slate-800">
        <div className="flex items-start gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] text-white">
            OK
          </span>
          <p>
            <span className="font-semibold">Free cancellation</span> up to 24 hours before the experience starts.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] text-white">
            OK
          </span>
          <p>
            <span className="font-semibold">Reserve now and pay later</span> - secure your spot while staying flexible.
          </p>
        </div>
      </div>

      {/* URGENCY */}
      <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-xs text-slate-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">!</div>
        <div>
          <p className="font-semibold">Book ahead!</p>
          <p>On average, this is booked several days in advance.</p>
        </div>
      </div>

    </div>
  );
}

const formatTimeOption = (slot: TimeSlotOption) => {
  const minute = slot.minute.padStart(2, "0");
  const hour = slot.hour.toString().padStart(2, "0");
  return `${hour}:${minute} ${slot.period}`;
};
