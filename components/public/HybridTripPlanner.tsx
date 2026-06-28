"use client";

import { useEffect, useMemo, useState } from "react";
import type { HybridLanding, HybridTourProduct, HybridTransferOption } from "@/lib/hybridTripLandings";

type LocationSummary = {
  id: string;
  name: string;
  slug: string;
  type: string;
  zoneName: string | null;
};

type QuoteVehicle = {
  id: string;
  name: string;
  category: string;
  minPax: number;
  maxPax: number;
  price: number;
  imageUrl?: string | null;
};

type PlannerState = {
  transferId: string;
  destinationQuery: string;
  destinationLocation: LocationSummary | null;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  selectedTourSlugs: string[];
};

const money = (value: number) => `$${value.toFixed(2)} USD`;
const LOCATION_DEBOUNCE_MS = 350;
const DEFAULT_ROUND_TRIP_DISCOUNT = 5;
const ROUND_TRIP_DISCOUNT_PERCENT = (() => {
  const value = Number(process.env.NEXT_PUBLIC_ROUND_TRIP_DISCOUNT_PERCENT ?? DEFAULT_ROUND_TRIP_DISCOUNT);
  if (Number.isNaN(value)) return DEFAULT_ROUND_TRIP_DISCOUNT;
  return Math.min(100, Math.max(0, value));
})();
const ROUND_TRIP_MULTIPLIER = 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100);

const AIRPORT_QUERY_BY_ZONE: Record<string, string> = {
  "punta-cana": "puj-airport",
  "santo-domingo": "sdq-airport",
  "bayahibe-la-romana": "puj-airport"
};

const toRoundTripPrice = (oneWayPrice: number) => Number((oneWayPrice * ROUND_TRIP_MULTIPLIER).toFixed(2));

const findBestTransfer = (transfers: HybridTransferOption[], travelers: number) => {
  const normalizedTravelers = Math.max(1, travelers);
  const exactMatches = transfers.filter(
    (transfer) =>
      normalizedTravelers >= (transfer.minPax ?? 1) &&
      normalizedTravelers <= transfer.maxPax
  );
  const availableMatches = exactMatches.length
    ? exactMatches
    : transfers.filter((transfer) => normalizedTravelers <= transfer.maxPax);

  return [...availableMatches].sort((a, b) => a.price - b.price)[0] ?? transfers[transfers.length - 1] ?? null;
};

const buildInitialState = (landing: HybridLanding): PlannerState => {
  const adults = landing.audience.slug === "families" ? 4 : 2;
  return {
    transferId: "",
    destinationQuery: "",
    destinationLocation: null,
    arrivalDate: "",
    departureDate: "",
    adults,
    selectedTourSlugs: []
  };
};

const addDays = (dateValue: string, days: number) => {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const getVehicleUnits = (travelers: number, maxPax?: number) => Math.max(1, Math.ceil(Math.max(1, travelers) / Math.max(1, maxPax ?? 1)));

export default function HybridTripPlanner({
  landing,
  tours,
  transferOptions
}: {
  landing: HybridLanding;
  tours: HybridTourProduct[];
  transferOptions?: HybridTransferOption[];
}) {
  const availableTransfers = useMemo<HybridTransferOption[]>(
    () =>
      transferOptions?.length
        ? transferOptions
        : landing.zone.transferOptions.map((transfer) => ({ ...transfer })),
    [landing.zone.transferOptions, transferOptions]
  );
  const [selectedOrigin, setSelectedOrigin] = useState<LocationSummary | null>(null);
  const [destinationOptions, setDestinationOptions] = useState<LocationSummary[]>([]);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [quoteTransfers, setQuoteTransfers] = useState<HybridTransferOption[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const storageKey = `proactivitis-hybrid-planner:${landing.path}`;
  const recommendedSlugs = useMemo(
    () => tours.slice(0, landing.audience.slug === "families" ? 2 : 3).map((tour) => tour.slug),
    [landing.audience.slug, tours]
  );
  const waterOrAdventureSlugs = useMemo(
    () =>
      tours
        .filter((tour) => /buggy|catamaran|parasail|saona|water|beach|vip|adventure/i.test(`${tour.title} ${tour.category} ${tour.shortDescription}`))
        .slice(0, 3)
        .map((tour) => tour.slug),
    [tours]
  );
  const [state, setState] = useState<PlannerState>(() => ({
    ...buildInitialState(landing),
    selectedTourSlugs: recommendedSlugs
  }));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const normalizeState = (nextState: PlannerState) => {
      if (!nextState.destinationLocation) {
        return {
          ...nextState,
          destinationQuery: nextState.destinationQuery ?? "",
          transferId: ""
        };
      }
      const selectedTransferExists = availableTransfers.some((transfer) => transfer.id === nextState.transferId);
      if (selectedTransferExists) {
        return {
          ...nextState,
          destinationQuery: nextState.destinationQuery || nextState.destinationLocation.name
        };
      }
      return {
        ...nextState,
        destinationQuery: nextState.destinationQuery || nextState.destinationLocation.name,
        transferId: findBestTransfer(availableTransfers, nextState.adults)?.id ?? ""
      };
    };

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setState(
          normalizeState({
            ...buildInitialState(landing),
            selectedTourSlugs: recommendedSlugs,
            ...JSON.parse(stored)
          })
        );
      }
    } catch {
      setState(normalizeState({ ...buildInitialState(landing), selectedTourSlugs: recommendedSlugs }));
    } finally {
      setLoaded(true);
    }
  }, [availableTransfers, landing, recommendedSlugs, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [loaded, state, storageKey]);

  useEffect(() => {
    const airportQuery = AIRPORT_QUERY_BY_ZONE[landing.zone.slug] ?? "puj-airport";
    const controller = new AbortController();

    fetch(`/api/transfers/v2/locations?query=${encodeURIComponent(airportQuery)}`, {
      signal: controller.signal
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const locations = (data?.locations ?? []) as LocationSummary[];
        const origin =
          locations.find((location) => location.slug === airportQuery) ??
          locations.find((location) => location.type === "AIRPORT") ??
          locations[0] ??
          null;
        setSelectedOrigin(origin);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSelectedOrigin(null);
        }
      });

    return () => controller.abort();
  }, [landing.zone.slug]);

  useEffect(() => {
    const query = state.destinationQuery.trim();
    if (!query || query.length < 2 || state.destinationLocation?.name === query) {
      setDestinationOptions([]);
      setDestinationLoading(false);
      return;
    }

    const controller = new AbortController();
    setDestinationLoading(true);
    const timer = window.setTimeout(() => {
      fetch(`/api/transfers/v2/locations?query=${encodeURIComponent(query)}`, {
        signal: controller.signal
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!controller.signal.aborted) {
            setDestinationOptions((data?.locations ?? []) as LocationSummary[]);
            setDestinationOpen(true);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setDestinationOptions([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setDestinationLoading(false);
          }
        });
    }, LOCATION_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [state.destinationLocation?.name, state.destinationQuery]);

  useEffect(() => {
    if (!selectedOrigin || !state.destinationLocation) {
      setQuoteTransfers([]);
      setQuoteError(null);
      return;
    }

    const controller = new AbortController();
    const passengersForQuote = Math.min(Math.max(1, state.adults), 14);
    setQuoteLoading(true);
    setQuoteError(null);
    setQuoteTransfers([]);

    fetch("/api/transfers/v2/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin_location_id: selectedOrigin.id,
        destination_location_id: state.destinationLocation.id,
        passengers: passengersForQuote,
        trip_type: "round-trip"
      }),
      signal: controller.signal
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error ?? "No transfer rate found for this destination.");
        }
        return body as { vehicles?: QuoteVehicle[] };
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const nextTransfers = (data.vehicles ?? []).map((vehicle) => ({
          id: vehicle.id,
          label: `${vehicle.name} round trip`,
          vehicleName: vehicle.name,
          description: `Private round-trip transfer from ${selectedOrigin.name} to ${state.destinationLocation?.name}.`,
          oneWayPrice: vehicle.price,
          price: toRoundTripPrice(vehicle.price),
          minPax: vehicle.minPax,
          maxPax: vehicle.maxPax,
          pax: `${vehicle.minPax}-${vehicle.maxPax}`,
          vehicleCategory: vehicle.category as HybridTransferOption["vehicleCategory"]
        }));
        setQuoteTransfers(nextTransfers);
        setState((current) => ({
          ...current,
          transferId: findBestTransfer(nextTransfers, current.adults)?.id ?? ""
        }));
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setQuoteTransfers([]);
          setQuoteError(error instanceof Error ? error.message : "No transfer rate found for this destination.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedOrigin, state.adults, state.destinationLocation]);

  const liveTransferOptions = state.destinationLocation ? quoteTransfers : [];
  const selectedTransfer = liveTransferOptions.find((transfer) => transfer.id === state.transferId);
  const selectedTours = tours.filter((tour) => state.selectedTourSlugs.includes(tour.slug));
  const vehicleUnits = selectedTransfer ? getVehicleUnits(state.adults, selectedTransfer.maxPax) : 0;
  const transferTotal = selectedTransfer ? selectedTransfer.price * vehicleUnits : 0;
  const tourTotal = selectedTours.reduce((sum, tour) => sum + tour.price * Math.max(1, state.adults), 0);
  const total = transferTotal + tourTotal;
  const canCheckout = Boolean(selectedTransfer && state.destinationLocation && state.arrivalDate && state.departureDate);
  const completedCount = [
    selectedTransfer && state.destinationLocation,
    state.arrivalDate && state.departureDate,
    selectedTours.length > 0
  ].filter(Boolean).length;

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams({
      type: "transfer",
      tourTitle: `${landing.zone.mapName} custom package`,
      tourImage: landing.zone.heroImage,
      tourPrice: total.toFixed(2),
      totalPrice: total.toFixed(2),
      displayTotalPrice: total.toFixed(2),
      adults: String(Math.max(1, state.adults)),
      date: state.arrivalDate,
      time: "Arrival time",
      origin: selectedOrigin?.slug ?? "",
      hotelSlug: state.destinationLocation?.slug ?? "",
      originLabel: selectedOrigin?.name ?? landing.zone.name,
      originHotelName: state.destinationLocation?.name ?? landing.zone.name,
      vehicleId: selectedTransfer?.id ?? "",
      vehicleName: selectedTransfer?.vehicleName ?? landing.zone.transferType,
      vehicleCategory: selectedTransfer?.vehicleCategory ?? landing.zone.transferType,
      tripType: "round-trip",
      returnDatetime: state.departureDate ? `${state.departureDate}T11:00:00` : "",
      specialRequirements: [
        `Custom package: ${landing.title}`,
        selectedOrigin ? `Pickup airport: ${selectedOrigin.name}` : "",
        state.destinationLocation ? `Destination: ${state.destinationLocation.name}` : "",
        selectedTransfer ? `Transfer: ${selectedTransfer.label} (${vehicleUnits} vehicle${vehicleUnits > 1 ? "s" : ""})` : "",
        selectedTours.length ? `Tours: ${selectedTours.map((tour) => tour.title).join(", ")}` : "Tours: no extras"
      ]
        .filter(Boolean)
        .join(" | ")
    });
    return `/checkout?${params.toString()}`;
  }, [
    landing,
    selectedOrigin,
    selectedTours,
    selectedTransfer,
    state.adults,
    state.arrivalDate,
    state.departureDate,
    state.destinationLocation,
    total,
    vehicleUnits
  ]);

  const updateTravelers = (travelers: number) => {
    const nextTravelers = Math.max(1, travelers);
    const bestTransfer = findBestTransfer(liveTransferOptions, nextTravelers);
    setState((current) => ({
      ...current,
      adults: nextTravelers,
      transferId: bestTransfer?.id ?? current.transferId
    }));
  };

  const updateDestinationQuery = (value: string) => {
    setState((current) => ({
      ...current,
      destinationQuery: value,
      destinationLocation: current.destinationLocation?.name === value ? current.destinationLocation : null,
      transferId: ""
    }));
    if (!value.trim()) {
      setDestinationOptions([]);
      setDestinationOpen(false);
    }
  };

  const selectDestination = (location: LocationSummary) => {
    setDestinationOptions([]);
    setDestinationOpen(false);
    setState((current) => ({
      ...current,
      destinationQuery: location.name,
      destinationLocation: location,
      transferId: ""
    }));
  };

  const setTourPreset = (slugs: string[]) => {
    setState((current) => ({ ...current, selectedTourSlugs: Array.from(new Set(slugs)) }));
  };

  const toggleTour = (slug: string) => {
    setState((current) => ({
      ...current,
      selectedTourSlugs: current.selectedTourSlugs.includes(slug)
        ? current.selectedTourSlugs.filter((item) => item !== slug)
        : [...current.selectedTourSlugs, slug]
    }));
  };

  const setStayLength = (days: number) => {
    setState((current) => ({ ...current, departureDate: addDays(current.arrivalDate, days) || current.departureDate }));
  };

  return (
    <section id="plan" className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-12">
        <div className="space-y-6">
          <header className="grid gap-5 border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Customize your package</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Start with a ready plan, then change anything</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Choose your private transfer, travel dates and the tours you want. You can keep the recommended package or remove/add tours one by one.
              </p>
            </div>
            <div className="min-w-[190px] border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Package status</p>
              <p className="mt-2 text-2xl font-black text-emerald-700">{completedCount}/3</p>
              <p className="text-xs font-semibold text-slate-500">parts selected</p>
            </div>
          </header>

          <section className="border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StepTitle number="1" title="Destination and private transfer" />
              <span className="text-sm font-black text-emerald-700">
                {selectedTransfer ? `${money(transferTotal)} estimated` : "Choose destination"}
              </span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <div className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pickup airport</p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {selectedOrigin?.name ?? `Loading ${landing.zone.mapName} airport...`}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Round-trip airport transfer is quoted from the real transfer system.</p>
              </div>
              <label className="relative text-sm font-semibold text-slate-700">
                Hotel or final destination
                <input
                  type="text"
                  value={state.destinationQuery}
                  onChange={(event) => updateDestinationQuery(event.target.value)}
                  onFocus={() => setDestinationOpen(destinationOptions.length > 0)}
                  placeholder="Type hotel, resort, airport or area"
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm"
                />
                {destinationOpen && destinationOptions.length > 0 ? (
                  <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto border border-slate-200 bg-white shadow-xl">
                    {destinationOptions.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => selectDestination(location)}
                        className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-emerald-50"
                      >
                        <span className="block text-sm font-black text-slate-950">{location.name}</span>
                        <span className="mt-1 block text-xs font-semibold text-slate-500">
                          {location.type} {location.zoneName ? `- ${location.zoneName}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {destinationLoading ? <span className="mt-2 block text-xs font-semibold text-slate-500">Searching destinations...</span> : null}
              </label>
            </div>
            {!state.destinationLocation ? (
              <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Choose the hotel or destination first so the transfer price is calculated with the real route.
              </div>
            ) : null}
            {quoteLoading ? (
              <div className="mt-5 border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                Calculating real transfer prices for {state.destinationLocation?.name}...
              </div>
            ) : null}
            {quoteError ? (
              <div className="mt-5 border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {quoteError}
              </div>
            ) : null}
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {liveTransferOptions.map((transfer) => {
                const selected = state.transferId === transfer.id;
                return (
                  <button
                    key={transfer.id}
                    type="button"
                    onClick={() => setState((current) => ({ ...current, transferId: transfer.id }))}
                    className={`border p-4 text-left transition ${
                      selected ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-base font-black text-slate-950">{transfer.label}</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-500">{transfer.vehicleName} - {transfer.pax} travelers</span>
                      </span>
                      <span className="text-sm font-black text-emerald-700">{money(transfer.price)} / vehicle</span>
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-slate-600">{transfer.description}</span>
                    <span className={`mt-4 inline-flex px-3 py-1 text-xs font-black ${selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {selected ? "Selected" : "Select"}
                    </span>
                  </button>
                );
              })}
            </div>
            {state.destinationLocation && !quoteLoading && !quoteError && liveTransferOptions.length === 0 ? (
              <p className="mt-4 text-sm font-semibold text-slate-500">No automatic vehicle price is available for this destination yet.</p>
            ) : null}
          </section>

          <section className="border border-slate-200 bg-white p-5">
            <StepTitle number="2" title="Dates and travelers" />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">
                Arrival date
                <input
                  type="date"
                  value={state.arrivalDate}
                  onChange={(event) => setState((current) => ({ ...current, arrivalDate: event.target.value }))}
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Return date
                <input
                  type="date"
                  value={state.departureDate}
                  onChange={(event) => setState((current) => ({ ...current, departureDate: event.target.value }))}
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Travelers
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={state.adults}
                  onChange={(event) => updateTravelers(Number(event.target.value) || 1)}
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm"
                />
              </label>
            </div>
            {selectedTransfer ? (
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Transfer estimate: {vehicleUnits} {selectedTransfer.vehicleName}{vehicleUnits > 1 ? "s" : ""} x {money(selectedTransfer.price)}.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {[4, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  disabled={!state.arrivalDate}
                  onClick={() => setStayLength(days)}
                  className="border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700 disabled:opacity-50"
                >
                  {days} nights
                </button>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StepTitle number="3" title="Tours and extras" />
              <span className="text-sm font-black text-emerald-700">{selectedTours.length} selected</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <PresetButton title="Recommended" body={`${recommendedSlugs.length} tours`} onClick={() => setTourPreset(recommendedSlugs)} />
              <PresetButton title="More adventure" body={`${(waterOrAdventureSlugs.length ? waterOrAdventureSlugs : recommendedSlugs).length} tours`} onClick={() => setTourPreset(waterOrAdventureSlugs.length ? waterOrAdventureSlugs : recommendedSlugs)} />
              <PresetButton title="Transfer only" body="No tours" onClick={() => setTourPreset([])} />
            </div>
            <div className="mt-5 grid gap-3">
              {tours.map((tour) => {
                const selected = state.selectedTourSlugs.includes(tour.slug);
                return (
                  <button
                    key={tour.slug}
                    type="button"
                    onClick={() => toggleTour(tour.slug)}
                    className={`grid gap-4 border p-4 text-left transition sm:grid-cols-[96px_1fr_auto] ${
                      selected ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <img src={tour.image} alt={tour.title} className="h-20 w-24 object-cover" />
                    <span>
                      <span className="block text-base font-black text-slate-950">{tour.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">{tour.shortDescription}</span>
                      <span className={`mt-3 inline-flex px-3 py-1 text-xs font-black ${selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {selected ? "Included" : "Add tour"}
                      </span>
                    </span>
                    <span className="text-sm font-black text-emerald-700">{money(tour.price)} pp</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="h-fit border border-slate-200 bg-slate-950 p-5 text-white lg:sticky lg:top-20">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Your package</p>
          <h3 className="mt-2 text-2xl font-black">{landing.zone.mapName}</h3>
          <div className="mt-5 space-y-3 text-sm text-slate-200">
            <SummaryLine label="Destination" value={state.destinationLocation?.name ?? "Choose destination"} />
            <SummaryLine label="Transfer" value={selectedTransfer?.label ?? "Not selected"} />
            <SummaryLine label="Dates" value={state.arrivalDate && state.departureDate ? `${state.arrivalDate} to ${state.departureDate}` : "Choose dates"} />
            <SummaryLine label="Travelers" value={String(state.adults)} />
            <SummaryLine label="Tours" value={selectedTours.length ? selectedTours.map((tour) => tour.title).join(", ") : "No tours added"} />
          </div>
          <div className="mt-6 border-t border-white/15 pt-5">
            <div className="flex justify-between text-sm text-slate-300">
              <span>Transfer{selectedTransfer ? ` (${vehicleUnits} vehicle${vehicleUnits > 1 ? "s" : ""})` : ""}</span>
              <span>{money(transferTotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-slate-300">
              <span>Tours</span>
              <span>{money(tourTotal)}</span>
            </div>
            <p className="mt-4 text-sm text-slate-300">Estimated total</p>
            <p className="mt-1 text-3xl font-black text-emerald-300">{money(total)}</p>
          </div>
          {canCheckout ? (
            <a href={checkoutHref} className="mt-6 block bg-emerald-400 px-5 py-4 text-center text-sm font-black text-slate-950 hover:bg-emerald-300">
              Continue to checkout
            </a>
          ) : (
            <button type="button" disabled className="mt-6 block w-full bg-slate-700 px-5 py-4 text-sm font-black text-slate-300">
              Choose destination and dates
            </button>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-400">You can book only the transfer or add tours before checkout.</p>
        </aside>
      </div>
    </section>
  );
}

function StepTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">{number}</span>
      <h3 className="text-xl font-black text-slate-950">{title}</h3>
    </div>
  );
}

function PresetButton({ title, body, onClick }: { title: string; body: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="border border-slate-200 bg-slate-50 p-4 text-left hover:border-emerald-400 hover:bg-emerald-50">
      <span className="block text-sm font-black text-slate-950">{title}</span>
      <span className="mt-1 block text-sm text-slate-600">{body}</span>
    </button>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
