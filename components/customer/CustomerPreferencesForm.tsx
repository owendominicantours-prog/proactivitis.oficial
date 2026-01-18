"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { name: string; slug: string; country?: string };

type InitialPreference = {
  preferredCountries?: string[];
  preferredDestinations?: string[];
  preferredProductTypes?: string[];
  consentMarketing?: boolean;
  completedAt?: string | null;
};

type CustomerPreferencesFormProps = {
  countries: Option[];
  destinations: Option[];
  initial?: InitialPreference | null;
};

const PRODUCT_TYPES = [
  { value: "tours", label: "Tours" },
  { value: "transfers", label: "Traslados" },
  { value: "combos", label: "Combos" }
];

const unique = (values: string[]) => Array.from(new Set(values));

export function CustomerPreferencesForm({
  countries,
  destinations,
  initial
}: CustomerPreferencesFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    initial?.preferredCountries ?? []
  );
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    initial?.preferredDestinations ?? []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initial?.preferredProductTypes ?? []
  );
  const [consentMarketing, setConsentMarketing] = useState(Boolean(initial?.consentMarketing));

  const destinationOptions = useMemo(() => {
    const lookup = new Map<string, Option[]>();
    destinations.forEach((destination) => {
      const list = lookup.get(destination.country ?? "Otros") ?? [];
      list.push(destination);
      lookup.set(destination.country ?? "Otros", list);
    });
    return Array.from(lookup.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [destinations]);

  const toggleSelection = (
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    setter(unique(next));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/customer/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countries: selectedCountries,
          destinations: selectedDestinations,
          productTypes: selectedTypes,
          consentMarketing
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "No pudimos guardar tus preferencias.");
      }
      setStatus("Listo, guardamos tus preferencias.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos guardar tus preferencias.";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Personaliza tu cuenta
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">
          Dinos que te interesa para mostrarte tours a tu medida
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Completa este formulario para desbloquear tu 10% de descuento y recibir solo opciones
          relevantes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Paises de interes
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {countries.slice(0, 16).map((country) => (
              <button
                key={country.slug}
                type="button"
                onClick={() => toggleSelection(country.slug, selectedCountries, setSelectedCountries)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  selectedCountries.includes(country.slug)
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Tipo de experiencia
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRODUCT_TYPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleSelection(item.value, selectedTypes, setSelectedTypes)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  selectedTypes.includes(item.value)
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Destinos favoritos
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {destinationOptions.slice(0, 6).map(([country, items]) => (
            <div key={country} className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {country}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.slice(0, 8).map((destination) => (
                  <button
                    key={destination.slug}
                    type="button"
                    onClick={() =>
                      toggleSelection(destination.slug, selectedDestinations, setSelectedDestinations)
                    }
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                      selectedDestinations.includes(destination.slug)
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {destination.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={consentMarketing}
          onChange={(event) => setConsentMarketing(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
        />
        Acepto recibir recomendaciones personalizadas y descuentos segun mis intereses.
      </label>

      {status && <p className="text-sm text-slate-600">{status}</p>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {saving ? "Guardando..." : "Activar mi descuento"}
      </button>
    </form>
  );
}
