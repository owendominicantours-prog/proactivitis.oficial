"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const suggestions = ["Punta Cana", "Cancún", "Safari", "Tours gastronómicos", "Aventura"];

export function PublicHeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (query) params.set("destination", query);
    router.push(params.toString() ? `/tours?${params}` : "/tours");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Abrir búsqueda"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        onClick={() => setOpen((prev) => !prev)}
      >
        🔍
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none"
              placeholder="Buscar destino o tour"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-800"
            >
              Ir
            </button>
          </div>
          <div className="mt-3 space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Sugerencias
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                onClick={() => {
                  setQuery(item);
                  router.push(`/tours?destination=${encodeURIComponent(item)}`);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
