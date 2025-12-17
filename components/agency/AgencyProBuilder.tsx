"use client";

import { FormEvent, useState } from "react";

type AgencyProBuilderProps = {
  tourId: string;
  tourTitle: string;
  basePrice: number;
};

type LinkResult = {
  slug: string;
  url: string;
};

export const AgencyProBuilder = ({ tourId, tourTitle, basePrice }: AgencyProBuilderProps) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState<number>(basePrice);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<LinkResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setResult(null);
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
      setStatus("Enlace creado con éxito. Compártelo con tu cliente.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-300"
      >
        AgencyPro
      </button>
      {open && (
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-lg">
          <p className="text-xs uppercase text-slate-500">Precio AgencyPro</p>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Precio final al cliente
              </label>
              <div>
                <input
                  type="number"
                  min={basePrice}
                  step="1"
                  value={price}
                  onChange={(event) => setPrice(Number(event.target.value))}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Nota para tu cliente
              </label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                placeholder="Ej: Precio preferencial exclusivo para tu grupo."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-sky-500 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {loading ? "Generando..." : "Crear enlace AgencyPro"}
            </button>
          </form>
          {result && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <p className="font-semibold">Enlace listo</p>
              <a href={result.url} target="_blank" rel="noreferrer" className="text-sky-600 underline">
                {result.url}
              </a>
            </div>
          )}
          {status && (
            <p className="text-xs text-amber-600">{status}</p>
          )}
        </div>
      )}
    </div>
  );
};
