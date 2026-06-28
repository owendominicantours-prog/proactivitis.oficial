"use client";

import { useEffect, useMemo, useState } from "react";
import type { HybridLanding, HybridTourProduct } from "@/lib/hybridTripLandings";

type PlannerState = {
  transferId: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  selectedTourSlugs: string[];
};

const money = (value: number) => `$${value.toFixed(2)} USD`;

const buildInitialState = (landing: HybridLanding): PlannerState => ({
  transferId: landing.zone.transferOptions[0]?.id ?? "",
  arrivalDate: "",
  departureDate: "",
  adults: landing.audience.slug === "families" ? 4 : 2,
  selectedTourSlugs: []
});

const addDays = (dateValue: string, days: number) => {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export default function HybridTripPlanner({ landing, tours }: { landing: HybridLanding; tours: HybridTourProduct[] }) {
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
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setState({ ...buildInitialState(landing), selectedTourSlugs: recommendedSlugs, ...JSON.parse(stored) });
      }
    } catch {
      setState({ ...buildInitialState(landing), selectedTourSlugs: recommendedSlugs });
    } finally {
      setLoaded(true);
    }
  }, [landing, recommendedSlugs, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [loaded, state, storageKey]);

  const selectedTransfer = landing.zone.transferOptions.find((transfer) => transfer.id === state.transferId);
  const selectedTours = tours.filter((tour) => state.selectedTourSlugs.includes(tour.slug));
  const transferTotal = selectedTransfer?.price ?? 0;
  const tourTotal = selectedTours.reduce((sum, tour) => sum + tour.price * Math.max(1, state.adults), 0);
  const total = transferTotal + tourTotal;
  const canCheckout = Boolean(selectedTransfer && state.arrivalDate && state.departureDate);
  const completedCount = [selectedTransfer, state.arrivalDate && state.departureDate, selectedTours.length > 0].filter(Boolean).length;

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
      originLabel: landing.zone.name,
      vehicleId: selectedTransfer?.id ?? "",
      vehicleName: selectedTransfer?.vehicleName ?? landing.zone.transferType,
      vehicleCategory: landing.zone.transferType,
      tripType: "round-trip",
      returnDatetime: state.departureDate ? `${state.departureDate}T11:00:00` : "",
      specialRequirements: [
        `Custom package: ${landing.title}`,
        selectedTransfer ? `Transfer: ${selectedTransfer.label}` : "",
        selectedTours.length ? `Tours: ${selectedTours.map((tour) => tour.title).join(", ")}` : "Tours: no extras"
      ]
        .filter(Boolean)
        .join(" | ")
    });
    return `/checkout?${params.toString()}`;
  }, [landing, selectedTours, selectedTransfer, state.adults, state.arrivalDate, state.departureDate, total]);

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
              <StepTitle number="1" title="Private transfer" />
              <span className="text-sm font-black text-emerald-700">{selectedTransfer ? money(transferTotal) : "Choose one"}</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {landing.zone.transferOptions.map((transfer) => {
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
                      <span className="text-sm font-black text-emerald-700">{money(transfer.price)}</span>
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-slate-600">{transfer.description}</span>
                    <span className={`mt-4 inline-flex px-3 py-1 text-xs font-black ${selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {selected ? "Selected" : "Select"}
                    </span>
                  </button>
                );
              })}
            </div>
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
                  onChange={(event) => setState((current) => ({ ...current, adults: Math.max(1, Number(event.target.value) || 1) }))}
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm"
                />
              </label>
            </div>
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
            <SummaryLine label="Transfer" value={selectedTransfer?.label ?? "Not selected"} />
            <SummaryLine label="Dates" value={state.arrivalDate && state.departureDate ? `${state.arrivalDate} to ${state.departureDate}` : "Choose dates"} />
            <SummaryLine label="Travelers" value={String(state.adults)} />
            <SummaryLine label="Tours" value={selectedTours.length ? selectedTours.map((tour) => tour.title).join(", ") : "No tours added"} />
          </div>
          <div className="mt-6 border-t border-white/15 pt-5">
            <div className="flex justify-between text-sm text-slate-300">
              <span>Transfer</span>
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
              Choose dates to continue
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
