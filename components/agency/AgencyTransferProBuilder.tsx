"use client";

import { FormEvent, useMemo, useState } from "react";

type AgencyTransferProBuilderProps = {
  originLocationId: string;
  destinationLocationId: string;
  originLabel: string;
  destinationLabel: string;
  vehicleId: string;
  vehicleName: string;
  passengers: number;
  tripType: "one-way" | "round-trip";
  basePrice: number;
};

type LinkResult = {
  slug: string;
  url: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export function AgencyTransferProBuilder(props: AgencyTransferProBuilderProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState<number>(props.basePrice);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<LinkResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const markup = useMemo(() => Math.max(0, price - props.basePrice), [price, props.basePrice]);

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
    setCopied(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setResult(null);
    setCopied(false);
    if (price < props.basePrice) {
      setStatus("El precio debe ser igual o mayor al precio base.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/agency/transfer-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originLocationId: props.originLocationId,
          destinationLocationId: props.destinationLocationId,
          vehicleId: props.vehicleId,
          passengers: props.passengers,
          tripType: props.tripType,
          price,
          basePrice: props.basePrice,
          note
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "No se pudo crear el enlace AgencyPro de traslado.");
      }
      const payload = (await response.json()) as LinkResult;
      setResult(payload);
      setStatus("Enlace de traslado listo para compartir.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrio un error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setStatus("Enlace copiado.");
    } catch {
      setStatus("No pudimos copiar el enlace. Puedes copiarlo manualmente.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
      >
        Crear link AgencyPro
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6" onClick={closeModal}>
          <div
            className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_35%),linear-gradient(135deg,#0f172a,#111827)] px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.35em] text-sky-200">AgencyPro Transfer</p>
                  <h3 className="mt-2 text-2xl font-semibold">{props.originLabel} → {props.destinationLabel}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-slate-200">
                    Crea una version comercial del traslado con tu propio precio final sin exponer el neto de la web.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.2fr,0.8fr]">
              <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Precio base</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(props.basePrice)}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">Tu precio final</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-900">{formatCurrency(price || 0)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Vehiculo</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{props.vehicleName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Pasajeros</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{props.passengers} pax</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Trayecto</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {props.tripType === "round-trip" ? "Ida y vuelta" : "Solo ida"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Precio que vera el cliente
                  </label>
                  <input
                    type="number"
                    min={props.basePrice}
                    step="1"
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Mensaje para tu cliente
                  </label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400"
                    placeholder="Ejemplo: traslado privado confirmado por nuestra agencia con asistencia directa."
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {status ? <span className="font-semibold text-slate-700">{status}</span> : "Configura el precio y crea el enlace."}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Generando enlace..." : "Crear enlace AgencyPro"}
                  </button>
                </div>
              </form>

              <aside className="border-t border-slate-100 bg-slate-50 px-6 py-6 lg:border-l lg:border-t-0">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Vista comercial</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{props.originLabel} → {props.destinationLabel}</h4>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Precio mostrado</p>
                      <p className="mt-1 text-2xl font-bold text-sky-700">{formatCurrency(price || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Margen estimado</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(markup)}</p>
                    </div>
                  </div>
                </div>

                {result ? (
                  <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">Enlace listo</p>
                    <p className="mt-2 break-all text-sm font-medium text-slate-800">{result.url}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 hover:border-emerald-400"
                      >
                        {copied ? "Copiado" : "Copiar"}
                      </button>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-emerald-500"
                      >
                        Abrir
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                    Cuando lo generes, el enlace aparecera aqui listo para abrir o copiar.
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
