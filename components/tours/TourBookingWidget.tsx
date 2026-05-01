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
  operatingDays?: string[];
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
  agencyLink?: string;
  agencyDirectDiscountPercent?: number;
};

type TourOption = {
  id: string;
  name: string;
  type?: string | null;
  checkoutType?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  pricePerPerson?: number | null;
  basePrice?: number | null;
  baseCapacity?: number | null;
  extraPricePerPerson?: number | null;
  pickupTimes?: string[] | null;
  availableDays?: string[] | null;
  unavailableReason?: string | null;
  isDefault?: boolean | null;
  active?: boolean | null;
};

const WEEKDAY_ORDER = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
] as const;

type WeekdayKey = (typeof WEEKDAY_ORDER)[number];

const WEEKDAY_ALIASES: Record<string, WeekdayKey> = {
  sun: "sunday",
  sunday: "sunday",
  domingo: "sunday",
  dom: "sunday",
  mon: "monday",
  monday: "monday",
  lunes: "monday",
  lun: "monday",
  tue: "tuesday",
  tues: "tuesday",
  tuesday: "tuesday",
  martes: "tuesday",
  mar: "tuesday",
  wed: "wednesday",
  wednesday: "wednesday",
  miercoles: "wednesday",
  miércoles: "wednesday",
  mie: "wednesday",
  thu: "thursday",
  thur: "thursday",
  thursday: "thursday",
  jueves: "thursday",
  jue: "thursday",
  fri: "friday",
  friday: "friday",
  viernes: "friday",
  vie: "friday",
  sat: "saturday",
  saturday: "saturday",
  sabado: "saturday",
  sábado: "saturday",
  sab: "saturday"
};

const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  sunday: "Dom",
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mie",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sab"
};

const normalizeWeekdayLabel = (value: string): WeekdayKey | null => {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return WEEKDAY_ALIASES[normalized] ?? null;
};

const parseDateWeekday = (value: string): WeekdayKey | null => {
  if (!value) return null;
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!year || !month || !day) return null;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return WEEKDAY_ORDER[weekday] ?? null;
};

const parseAvailableDays = (days?: string[] | null): WeekdayKey[] | null => {
  if (!days?.length) return null;
  const normalized = days
    .map((day) => normalizeWeekdayLabel(day))
    .filter((day): day is WeekdayKey => Boolean(day));
  return normalized.length ? normalized : null;
};

const formatDaysSummary = (days?: WeekdayKey[] | null) => {
  if (!days?.length) return "";
  return days.map((day) => WEEKDAY_LABELS[day]).join(", ");
};

const isOptionAvailableForDay = (option: TourOption | null, selectedWeekday: WeekdayKey | null) => {
  if (!option || !selectedWeekday) return true;
  const optionDays = parseAvailableDays(option.availableDays);
  if (!optionDays?.length) return true;
  return optionDays.includes(selectedWeekday);
};

const parseOptionTypeMeta = (rawType?: string | null) => {
  if (!rawType?.trim()) {
    return { checkoutType: null, availableDays: null as string[] | null };
  }
  const parts = rawType
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const checkoutType = parts[0] ?? rawType.trim();
  let availableDays: string[] | null = null;

  for (const part of parts.slice(1)) {
    const match = part.match(/^days?\s*[:=]\s*(.+)$/i);
    if (!match) continue;
    const parsed = match[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (parsed.length) {
      availableDays = parsed;
    }
  }

  return { checkoutType, availableDays };
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
  operatingDays,
  options,
  supplierHasStripeAccount: _supplierHasStripeAccount,
  platformSharePercent: _platformSharePercent,
  tourTitle,
  tourImage,
  hotelSlug,
  bookingCode,
  originHotelName,
  initialOptionId,
  discountPercent = 0,
  agencyLink,
  agencyDirectDiscountPercent = 0
}: TourBookingWidgetProps) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [youth, setYouth] = useState(0);
  const [child, setChild] = useState(0);
  const [showTravelersPopover, setShowTravelersPopover] = useState(false);
  const [bookingNotice, setBookingNotice] = useState("");
  const normalizedOperatingDays = useMemo(
    () => parseAvailableDays(operatingDays ?? null),
    [operatingDays]
  );
  const resolvedOptions = useMemo(
    () =>
      (options ?? [])
        .filter((option) => option.active !== false)
        .map((option) => {
          const parsedType = parseOptionTypeMeta(option.type);
          return {
            ...option,
            checkoutType: option.checkoutType ?? parsedType.checkoutType,
            availableDays: option.availableDays ?? parsedType.availableDays
          };
        }),
    [options]
  );
  const defaultOption =
    resolvedOptions.find((option) => option.isDefault) ?? resolvedOptions[0] ?? null;
  const [selectedOptionId, setSelectedOptionId] = useState(
    initialOptionId ?? defaultOption?.id ?? ""
  );

  const selectedOption =
    resolvedOptions.find((option) => option.id === selectedOptionId) ?? defaultOption;
  const selectedWeekday = useMemo(() => parseDateWeekday(date), [date]);
  const selectedOptionAvailable = isOptionAvailableForDay(selectedOption ?? null, selectedWeekday);
  const operatingDayBlocked = Boolean(
    date &&
      selectedWeekday &&
      normalizedOperatingDays?.length &&
      !normalizedOperatingDays.includes(selectedWeekday)
  );
  const hasConfiguredOptions = resolvedOptions.length > 0;
  const availableOptionsCount = resolvedOptions.filter((option) =>
    isOptionAvailableForDay(option, selectedWeekday)
  ).length;

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
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const totalTravelers = Math.max(1, adults + youth + child);
  const pricing = resolveOptionPricing(selectedOption ?? null, totalTravelers, basePrice);
  const discountMultiplier = discountPercent > 0 ? 1 - discountPercent / 100 : 1;
  const discountedTotal = Math.round(pricing.totalPrice * discountMultiplier * 100) / 100;
  const discountedPerPerson = Math.round(pricing.pricePerPerson * discountMultiplier * 100) / 100;
  const agencyDirectMultiplier =
    agencyDirectDiscountPercent > 0 ? 1 - agencyDirectDiscountPercent / 100 : 1;
  const displayTotal = Math.round(discountedTotal * agencyDirectMultiplier * 100) / 100;
  const displayPerPerson = Math.round(discountedPerPerson * agencyDirectMultiplier * 100) / 100;
  const estimatedTotal = displayTotal;
  const bookingLabel = originHotelName
    ? `Reservar Buggy con recogida en ${originHotelName}`
    : "Reservar Ahora";
  const baseCapacityLabel = selectedOption?.baseCapacity
    ? `1-${selectedOption.baseCapacity} pax`
    : "grupo base";
  const priceHeaderValue = selectedOption?.basePrice ? displayTotal : displayPerPerson;
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

  useEffect(() => {
    if (!selectedWeekday) return;
    if (!selectedOption || selectedOptionAvailable) return;
    const fallbackOption = resolvedOptions.find((option) =>
      isOptionAvailableForDay(option, selectedWeekday)
    );
    if (fallbackOption?.id) {
      setSelectedOptionId(fallbackOption.id);
    }
  }, [resolvedOptions, selectedOption, selectedOptionAvailable, selectedWeekday]);

  const handleCheckAvailability = () => {
    if (!date) {
      setBookingNotice("Selecciona una fecha para asegurar tu cupo.");
      dateInputRef.current?.focus();
      dateInputRef.current?.showPicker?.();
      return;
    }
    if (operatingDayBlocked) {
      setBookingNotice("Ese día no está disponible. Elige otra fecha para reservar.");
      return;
    }
    if (!selectedOptionAvailable) {
      setBookingNotice("Esta opción no opera ese día. Cambia de ticket o elige otra fecha.");
      return;
    }
    setBookingNotice("");
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
      if (selectedOption.checkoutType || selectedOption.type) {
        params.set("tourOptionType", selectedOption.checkoutType ?? selectedOption.type ?? "");
      }
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
    if (agencyDirectDiscountPercent > 0) {
      params.set("displayTourPrice", displayPerPerson.toString());
      params.set("displayTotalPrice", displayTotal.toString());
      params.set("agencyDirectPercent", agencyDirectDiscountPercent.toString());
      params.set("pricingMode", "direct-agency");
    }
    if (hotelSlug) params.set("hotelSlug", hotelSlug);
    if (bookingCode) params.set("bookingCode", bookingCode);
    if (originHotelName) params.set("originHotelName", originHotelName);
    if (agencyLink) params.set("agencyLink", agencyLink);
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

  const canContinue = Boolean(date && !operatingDayBlocked && selectedOptionAvailable);

  return (
    <div className="relative w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-none">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-rose-600 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-white shadow-sm shadow-rose-600/20">
          Alta demanda
        </span>
        <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-amber-900">
          Se agota rápido
        </span>
      </div>
      {resolvedOptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-500">Opción</p>
          <div className="space-y-2">
            {resolvedOptions.map((option) => {
              const optionPricing = resolveOptionPricing(option, totalTravelers, basePrice);
              const optionDays = parseAvailableDays(option.availableDays);
              const disabledForDate = !isOptionAvailableForDay(option, selectedWeekday);
              return (
                <div
                  key={option.id}
                  className={`flex items-start justify-between gap-2 rounded-xl border px-2.5 py-2 text-xs ${
                    disabledForDate
                      ? "cursor-not-allowed border-rose-200 bg-rose-50/70 opacity-70"
                      : option.id === selectedOption?.id
                        ? "cursor-pointer border-sky-400 bg-sky-50"
                        : "cursor-pointer border-slate-200 bg-white"
                  }`}
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name="tourOption"
                      checked={option.id === selectedOption?.id}
                      onChange={() => {
                        if (disabledForDate) return;
                        setSelectedOptionId(option.id);
                      }}
                      disabled={disabledForDate}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      {option.imageUrl ? (
                        <div
                          className="mb-1.5 h-12 w-full max-w-[96px] rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${option.imageUrl})` }}
                        />
                      ) : null}
                      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">
                        {option.name}
                      </p>
                      {optionDays?.length ? (
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {formatDaysSummary(optionDays)}
                        </p>
                      ) : null}
                      {disabledForDate ? (
                        <p className="mt-0.5 text-[10px] font-semibold text-rose-600">
                          {option.unavailableReason ||
                            "Esta opción no opera en la fecha seleccionada."}
                        </p>
                      ) : null}
                    </div>
                  </label>
                  <div className="shrink-0 pl-1 text-right">
                    <span className="text-[13px] font-semibold leading-none text-slate-800">
                      {optionPricing.summaryLabel}
                    </span>
                  </div>
                </div>
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
        <p className="text-xs text-slate-600">{priceHeaderNote} - Confirmación inmediata</p>
      </div>

      {/* ESTIMATED TOTAL */}
      <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
        <span className="font-semibold">Estimated total:</span> ${estimatedTotal.toFixed(2)} for {totalTravelers} traveler
        {totalTravelers > 1 ? "s" : ""}
      </div>

      {agencyDirectDiscountPercent > 0 && (
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-800">
          <span className="font-semibold">Tarifa neta de agencia:</span> esta reserva aplica tu descuento directo del{" "}
          {agencyDirectDiscountPercent}%.
        </div>
      )}

      {/* DATE + TRAVELERS + START TIME */}
      <div className="rounded-xl border border-slate-200">
      <div className="grid grid-cols-[1.15fr,1fr] divide-x divide-slate-200">
          {/* DATE */}
          <div className="flex flex-col px-4 py-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Date</span>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setBookingNotice("");
              }}
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

      {operatingDayBlocked ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          Esta actividad no opera el dia seleccionado. Disponible:{" "}
          <span className="font-semibold">{formatDaysSummary(normalizedOperatingDays)}</span>.
        </div>
      ) : null}

      {!operatingDayBlocked && date && selectedWeekday && !selectedOptionAvailable ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          La opción elegida no opera ese día. Cambia de ticket o elige una fecha compatible.
        </div>
      ) : null}

      {!operatingDayBlocked && hasConfiguredOptions && date && selectedWeekday && availableOptionsCount === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No hay tickets disponibles para el dia seleccionado.
        </div>
      ) : null}

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
      {bookingNotice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {bookingNotice}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleCheckAvailability}
        aria-disabled={!canContinue}
        className="w-full rounded-full bg-blue-600 px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        Reservar ahora
      </button>

      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex gap-3 text-sm">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">
            ✓
          </span>
          <div>
            <p className="font-black text-slate-900">Cancelación gratis</p>
            <p className="text-xs leading-relaxed text-slate-600">
              Reembolso íntegro si cancelas con 24 horas de antelación.
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">
            ✓
          </span>
          <div>
            <p className="font-black text-slate-900">Reserva sin pagar ahora</p>
            <p className="text-xs leading-relaxed text-slate-600">
              Asegura tu cupo y confirma los detalles antes del pago final.
            </p>
          </div>
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
