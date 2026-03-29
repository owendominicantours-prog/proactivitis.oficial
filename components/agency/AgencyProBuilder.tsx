"use client";

import { FormEvent, useMemo, useState } from "react";

type AgencyProBuilderProps = {
  tourId: string;
  tourTitle: string;
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

export const AgencyProBuilder = ({ tourId, tourTitle, basePrice }: AgencyProBuilderProps) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState<number>(basePrice);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<LinkResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const markup = useMemo(() => Math.max(0, price - basePrice), [price, basePrice]);

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
    if (price < basePrice) {
      setStatus("El precio debe ser igual o mayor al precio base.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/agency/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tourId,
          price,
          note
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "No se pudo crear el enlace AgencyPro.");
      }
      const payload = (await response.json()) as LinkResult;
      setResult(payload);
      setStatus("Enlace listo para compartir con tu cliente.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error.");
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
        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
      >
        AgencyPro
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
                  <p className="text-[11px] font-black uppercase tracking-[0.35em] text-sky-200">AgencyPro</p>
                  <h3 className="mt-2 text-2xl font-semibold">{tourTitle}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-slate-200">
                    Crea una versión comercial del tour con tu propio precio final y una nota privada para tu cliente.
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Precio base web</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(basePrice)}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">Tu precio final</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-900">{formatCurrency(price || 0)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Precio que verá el cliente
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      USD
                    </span>
                    <input
                      type="number"
                      min={basePrice}
                      step="1"
                      value={price}
                      onChange={(event) => setPrice(Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 px-14 py-3 text-base font-semibold text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    El precio de tu enlace AgencyPro nunca debe ser menor al precio base del tour.
                  </p>
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
                    placeholder="Ejemplo: tarifa preferencial para tu grupo, incluye gestión directa con nuestra agencia."
                  />
                  <p className="text-xs text-slate-500">
                    Esta nota aparece dentro de la ficha comercial que verá el cliente.
                  </p>
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
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{tourTitle}</h4>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Precio mostrado</p>
                      <p className="mt-1 text-2xl font-bold text-sky-700">{formatCurrency(price || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Margen estimado</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(markup)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">Nota visible</p>
                      <p className="mt-1">{note.trim() || "Todavía no has agregado una nota para el cliente."}</p>
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
                    Cuando lo generes, el enlace aparecerá aquí listo para abrir o copiar.
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
