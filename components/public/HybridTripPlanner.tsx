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

const buildInitialState = (landing: HybridLanding): PlannerState => ({
  transferId: landing.zone.transferOptions[0]?.id ?? "",
  arrivalDate: "",
  departureDate: "",
  adults: landing.audience.slug === "families" ? 4 : 2,
  selectedTourSlugs: []
});

const getMonthName = (dateValue: string) => {
  if (!dateValue) return "";
  const parsed = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("en-US", { month: "long" });
};

const money = (value: number) => `$${value.toFixed(2)} USD`;

export default function HybridTripPlanner({
  landing,
  tours
}: {
  landing: HybridLanding;
  tours: HybridTourProduct[];
}) {
  const storageKey = `proactivitis-hybrid-planner:${landing.path}`;
  const [state, setState] = useState<PlannerState>(() => buildInitialState(landing));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setState({ ...buildInitialState(landing), ...JSON.parse(stored) });
      }
    } catch {
      setState(buildInitialState(landing));
    } finally {
      setLoaded(true);
    }
  }, [landing, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [loaded, state, storageKey]);

  const selectedTransfer = landing.zone.transferOptions.find((transfer) => transfer.id === state.transferId);
  const selectedTours = tours.filter((tour) => state.selectedTourSlugs.includes(tour.slug));
  const selectedTourTotal = selectedTours.reduce((sum, tour) => sum + tour.price * Math.max(1, state.adults), 0);
  const transferTotal = selectedTransfer?.price ?? 0;
  const total = transferTotal + selectedTourTotal;
  const canPickDates = Boolean(selectedTransfer);
  const canPickTours = Boolean(state.arrivalDate && state.departureDate);
  const canCheckout = canPickTours;
  const selectedMonth = getMonthName(state.arrivalDate);
  const monthMismatch = selectedMonth && selectedMonth !== landing.month.label;
  const completedSteps = [Boolean(selectedTransfer), canPickTours, selectedTours.length > 0].filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / 3) * 100);
  const recommendedSlugs = useMemo(() => tours.slice(0, landing.audience.slug === "families" ? 2 : 3).map((tour) => tour.slug), [landing.audience.slug, tours]);
  const activeSlugs = useMemo(
    () =>
      tours
        .filter((tour) => /buggy|catamaran|parasail|saona|water|beach|vip|adventure/i.test(`${tour.title} ${tour.category} ${tour.shortDescription}`))
        .slice(0, 3)
        .map((tour) => tour.slug),
    [tours]
  );

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams({
      type: "transfer",
      tourTitle: `${landing.title} combo`,
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
        `Hybrid package: ${landing.title}`,
        selectedTransfer ? `Transfer: ${selectedTransfer.label}` : "",
        selectedTours.length ? `Tours: ${selectedTours.map((tour) => tour.title).join(", ")}` : "Tours: none selected yet"
      ]
        .filter(Boolean)
        .join(" | ")
    });
    return `/checkout?${params.toString()}`;
  }, [landing, selectedTours, selectedTransfer, state.adults, state.arrivalDate, state.departureDate, total]);

  const toggleTour = (slug: string) => {
    setState((current) => ({
      ...current,
      selectedTourSlugs: current.selectedTourSlugs.includes(slug)
        ? current.selectedTourSlugs.filter((item) => item !== slug)
        : [...current.selectedTourSlugs, slug]
    }));
  };
  const setTourPreset = (slugs: string[]) => {
    setState((current) => ({ ...current, selectedTourSlugs: Array.from(new Set(slugs)) }));
  };

  return (
    <section id="plan" className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">Build your trip</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Private transfer first, dates second, tours last</h2>
            <div className="mt-5 h-2 overflow-hidden bg-slate-100">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <section className="border border-slate-200 p-5">
            <StepHeader number="1" title="Choose the transfer anchor" active />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {landing.zone.transferOptions.map((transfer) => (
                <button
                  key={transfer.id}
                  type="button"
                  onClick={() => setState((current) => ({ ...current, transferId: transfer.id }))}
                  className={`min-h-[150px] border p-4 text-left transition ${
                    state.transferId === transfer.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-950">{transfer.label}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{transfer.vehicleName} - {transfer.pax} pax</p>
                    </div>
                    <span className="text-sm font-black text-emerald-700">{money(transfer.price)}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{transfer.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className={`border p-5 ${canPickDates ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"}`}>
            <StepHeader number="2" title="Set arrival and return dates" active={canPickDates} />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">
                Arrival
                <input
                  type="date"
                  disabled={!canPickDates}
                  value={state.arrivalDate}
                  onChange={(event) => setState((current) => ({ ...current, arrivalDate: event.target.value }))}
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm disabled:bg-slate-100"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Return
                <input
                  type="date"
                  disabled={!canPickDates}
                  value={state.departureDate}
                  onChange={(event) => setState((current) => ({ ...current, departureDate: event.target.value }))}
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm disabled:bg-slate-100"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Travelers
                <input
                  type="number"
                  min={1}
                  max={40}
                  disabled={!canPickDates}
                  value={state.adults}
                  onChange={(event) =>
                    setState((current) => ({ ...current, adults: Math.max(1, Number(event.target.value) || 1) }))
                  }
                  className="mt-2 w-full border border-slate-300 px-3 py-3 text-sm disabled:bg-slate-100"
                />
              </label>
            </div>
            {monthMismatch ? (
              <p className="mt-3 text-sm font-semibold text-amber-700">
                Your selected arrival is in {selectedMonth}. This page is optimized for {landing.month.label}; recommendations still work, but the seasonal copy changes by URL.
              </p>
            ) : null}
          </section>

          <section className={`border p-5 ${canPickTours ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"}`}>
            <StepHeader number="3" title="Add modular tours" active={canPickTours} />
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canPickTours}
                onClick={() => setTourPreset(recommendedSlugs)}
                className="border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 disabled:opacity-50"
              >
                Smart package
              </button>
              <button
                type="button"
                disabled={!canPickTours}
                onClick={() => setTourPreset(activeSlugs.length ? activeSlugs : recommendedSlugs)}
                className="border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-black text-sky-800 disabled:opacity-50"
              >
                Adventure mix
              </button>
              <button
                type="button"
                disabled={!canPickTours}
                onClick={() => setTourPreset(tours.map((tour) => tour.slug))}
                className="border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 disabled:opacity-50"
              >
                Add all
              </button>
              <button
                type="button"
                disabled={!canPickTours}
                onClick={() => setTourPreset([])}
                className="border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-500 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {tours.map((tour) => {
                const checked = state.selectedTourSlugs.includes(tour.slug);
                return (
                  <label
                    key={tour.slug}
                    className={`grid cursor-pointer gap-4 border p-4 transition sm:grid-cols-[auto_96px_1fr_auto] ${
                      checked ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-400"
                    } ${!canPickTours ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!canPickTours}
                      onChange={() => toggleTour(tour.slug)}
                      className="mt-1 h-5 w-5"
                    />
                    <img src={tour.image} alt={tour.title} className="h-20 w-24 object-cover" />
                    <span>
                      <span className="block text-sm font-black text-slate-950">{tour.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">{tour.shortDescription}</span>
                    </span>
                    <span className="text-sm font-black text-emerald-700">{money(tour.price)} pp</span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="h-fit border border-slate-200 bg-slate-950 p-5 text-white lg:sticky lg:top-20">
          <p className="text-sm font-semibold uppercase text-emerald-300">Trip summary</p>
          <h3 className="mt-2 text-2xl font-black">{landing.zone.mapName} package</h3>
          <div className="mt-4 border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-300">
              <span>Ready</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 bg-white/10">
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-200">
            <SummaryLine label="Transfer" value={selectedTransfer?.label ?? "Select first"} />
            <SummaryLine label="Dates" value={state.arrivalDate && state.departureDate ? `${state.arrivalDate} to ${state.departureDate}` : "Pending"} />
            <SummaryLine label="Travelers" value={String(state.adults)} />
            <SummaryLine label="Tours" value={selectedTours.length ? `${selectedTours.length} selected` : "Optional extras"} />
          </div>
          <div className="mt-6 border-t border-white/15 pt-5">
            <p className="text-sm text-slate-300">Estimated modular total</p>
            <p className="mt-1 text-3xl font-black text-emerald-300">{money(total)}</p>
          </div>
          {canCheckout ? (
            <a href={checkoutHref} className="mt-6 block bg-emerald-400 px-5 py-4 text-center text-sm font-black text-slate-950 hover:bg-emerald-300">
              Continue to checkout
            </a>
          ) : (
            <button type="button" disabled className="mt-6 block w-full bg-slate-700 px-5 py-4 text-sm font-black text-slate-300">
              Complete steps 1 and 2
            </button>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Final availability is confirmed after checkout. Date changes follow the published flexibility policy.
          </p>
        </aside>
      </div>
    </section>
  );
}

function StepHeader({ number, title, active }: { number: string; title: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
        {number}
      </span>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
