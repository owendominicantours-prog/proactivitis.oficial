"use client";

import { useCallback, useMemo, useState } from "react";

const DEFAULT_ROUND_TRIP_DISCOUNT = 5;
const ROUND_TRIP_DISCOUNT_PERCENT = (() => {
  const value = Number(
    process.env.NEXT_PUBLIC_ROUND_TRIP_DISCOUNT_PERCENT ?? process.env.ROUND_TRIP_DISCOUNT_PERCENT ?? DEFAULT_ROUND_TRIP_DISCOUNT
  );
  if (Number.isNaN(value)) return DEFAULT_ROUND_TRIP_DISCOUNT;
  return Math.min(100, Math.max(0, value));
})();

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

export default function TrasladoSearchV2() {
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [originOptions, setOriginOptions] = useState<LocationSummary[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<LocationSummary[]>([]);
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<LocationSummary | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<LocationSummary | null>(null);
  const [passengers, setPassengers] = useState(2);
  const [quote, setQuote] = useState<QuoteVehicle[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const isRoundTrip = tripType === "round-trip";
  const roundTripMultiplier = isRoundTrip
    ? 2 * (1 - ROUND_TRIP_DISCOUNT_PERCENT / 100)
    : 1;
  const normalizedDiscountPercent = Math.round(ROUND_TRIP_DISCOUNT_PERCENT);
  const handleTripTypeChange = (type: "one-way" | "round-trip") => {
    setTripType(type);
    if (type === "one-way") {
      setReturnDate("");
      setReturnTime("");
    }
  };

  const fetchLocations = useCallback(async (query: string, setter: (items: LocationSummary[]) => void, setLoading: (value: boolean) => void) => {
    if (!query.trim()) {
      setter([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/transfers/v2/locations?query=${encodeURIComponent(query.trim())}`);
      if (!response.ok) return;
      const data = await response.json();
      setter(data.locations ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOriginChange = (value: string) => {
    setOriginQuery(value);
    setSelectedOrigin(null);
    fetchLocations(value, setOriginOptions, setOriginLoading);
  };

  const handleDestinationChange = (value: string) => {
    setDestinationQuery(value);
    setSelectedDestination(null);
    fetchLocations(value, setDestinationOptions, setDestinationLoading);
  };

  const handleQuote = async () => {
    if (!selectedOrigin || !selectedDestination) {
      setQuoteError("Selecciona origen y destino válidos.");
      return;
    }
    if (isRoundTrip && (!returnDate || !returnTime)) {
      setQuoteError("Agrega fecha y hora de regreso para encontrar tarifas redondas.");
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    const requestBody: Record<string, unknown> = {
      origin_location_id: selectedOrigin.id,
      destination_location_id: selectedDestination.id,
      passengers,
      trip_type: tripType
    };
    const returnDatetime = returnDate && returnTime ? `${returnDate}T${returnTime}` : null;
    if (returnDatetime) {
      requestBody.return_datetime = returnDatetime;
    }
    try {
      const response = await fetch("/api/transfers/v2/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo calcular la tarifa.");
      }
      const data = await response.json();
      setQuote(data.vehicles ?? []);
    } catch (error) {
      setQuote([]);
      setQuoteError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setQuoteLoading(false);
    }
  };

  const originDisplay = useMemo(
    () => selectedOrigin?.name ?? originQuery,
    [selectedOrigin, originQuery]
  );
  const destinationDisplay = useMemo(
    () => selectedDestination?.name ?? destinationQuery,
    [selectedDestination, destinationQuery]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleTripTypeChange("one-way")}
            className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              tripType === "one-way"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
            }`}
          >
            Solo ida
          </button>
          <button
            type="button"
            onClick={() => handleTripTypeChange("round-trip")}
            className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              tripType === "round-trip"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
            }`}
          >
            Ida y vuelta
          </button>
          <span className="text-xs text-slate-500">
            Round trip = doble tarifa con {normalizedDiscountPercent}% de descuento
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Origen / Hotel o aeropuerto</label>
            <input
              className="w-full rounded-lg border border-slate-200 p-3 text-sm"
              value={originDisplay}
              onChange={(event) => handleOriginChange(event.target.value)}
              placeholder="Ej. Aeropuerto PUJ o Hard Rock"
            />
            {originLoading ? (
              <p className="text-xs text-slate-500">Buscando...</p>
            ) : (
              originOptions.length > 0 && !selectedOrigin && (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
                  {originOptions.map((location) => (
                    <button
                      type="button"
                      key={location.id}
                      onClick={() => {
                        setSelectedOrigin(location);
                        setOriginQuery(location.name);
                      }}
                      className="block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-100"
                    >
                      {location.name} · {location.zoneName ?? location.type}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Destino / Hotel o aeropuerto</label>
            <input
              className="w-full rounded-lg border border-slate-200 p-3 text-sm"
              value={destinationDisplay}
              onChange={(event) => handleDestinationChange(event.target.value)}
              placeholder="Ej. JW Marriott o Aeropuerto SDQ"
            />
            {destinationLoading ? (
              <p className="text-xs text-slate-500">Buscando...</p>
            ) : (
              destinationOptions.length > 0 &&
              !selectedDestination && (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
                  {destinationOptions.map((location) => (
                    <button
                      type="button"
                      key={location.id}
                      onClick={() => {
                        setSelectedDestination(location);
                        setDestinationQuery(location.name);
                      }}
                      className="block w-full rounded-lg px-2 py-1 text-left text-slate-700 hover:bg-slate-100"
                    >
                      {location.name} · {location.zoneName ?? location.type}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Pasajeros</label>
            <input
              type="number"
              min={1}
              value={passengers}
              onChange={(event) => setPassengers(Number(event.target.value))}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm"
            />
          </div>
        </div>
        {isRoundTrip && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Fecha de regreso
              <input
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Hora de regreso
              <input
                type="time"
                value={returnTime}
                onChange={(event) => setReturnTime(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
        <button
          onClick={handleQuote}
          className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
        >
          {quoteLoading ? "Buscando tarifas..." : "Buscar transfer"}
        </button>
        {quoteError && (
          <div
            role="alert"
            className="mt-3 flex items-start justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm"
          >
            <p>{quoteError}</p>
            <button
              type="button"
              onClick={() => setQuoteError(null)}
              className="ml-4 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {quote.length ? (
          quote.map((vehicle) => {
            const displayPrice = Number((vehicle.price * roundTripMultiplier).toFixed(2));
            return (
              <article key={vehicle.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex-1 space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{vehicle.category}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
                  <p className="text-sm text-slate-600">
                    {vehicle.minPax}–{vehicle.maxPax} pasajeros
                  </p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-sm text-slate-500">
                    Precio{isRoundTrip ? " ida y vuelta" : ""}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">${displayPrice.toFixed(2)}</p>
                  {isRoundTrip && (
                    <p className="text-[11px] text-slate-500">
                      Incluye {normalizedDiscountPercent}% de descuento sobre la tarifa doble
                    </p>
                  )}
                </div>
                {vehicle.imageUrl ? (
                  <img src={vehicle.imageUrl} alt={vehicle.name} className="h-20 w-20 rounded-lg object-cover" />
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
            {quoteError
              ? "Ajusta el origen o destino para encontrar una ruta disponible."
              : "Selecciona origen, destino y pasajeros para ver los vehículos disponibles."}
          </div>
        )}
      </div>
    </div>
  );
}
