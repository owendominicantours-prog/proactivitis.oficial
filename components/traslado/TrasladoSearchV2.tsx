"use client";

import { useCallback, useMemo, useState } from "react";

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
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const response = await fetch("/api/transfers/v2/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_location_id: selectedOrigin.id,
          destination_location_id: selectedDestination.id,
          passengers
        })
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
        <button
          onClick={handleQuote}
          className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
        >
          {quoteLoading ? "Buscando tarifas..." : "Buscar transfer"}
        </button>
        {quoteError && <p className="text-xs text-rose-600">{quoteError}</p>}
      </div>

      <div className="space-y-5">
        {quote.length ? (
          quote.map((vehicle) => (
            <article key={vehicle.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex-1 space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{vehicle.category}</p>
                <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
                <p className="text-sm text-slate-600">
                  {vehicle.minPax}–{vehicle.maxPax} pasajeros
                </p>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-sm text-slate-500">Precio</p>
                <p className="text-2xl font-bold text-slate-900">${vehicle.price.toFixed(2)}</p>
              </div>
              {vehicle.imageUrl ? (
                <img src={vehicle.imageUrl} alt={vehicle.name} className="h-20 w-20 rounded-lg object-cover" />
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-500">Selecciona origen, destino y pasajeros para ver vehículos.</p>
        )}
      </div>
    </div>
  );
}
