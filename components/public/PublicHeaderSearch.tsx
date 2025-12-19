"use client";

import { useState } from "react";

const suggestions = ["Punta Cana", "Cancún", "Safari", "Tours gastronómicos"];

export function PublicHeaderSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <label className="flex h-12 w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-sm transition hover:border-slate-300">
        <span className="text-slate-400">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar destino, tour o experiencia"
          className="flex-1 border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
        >
          Buscar
        </button>
      </label>
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-lg">
          <p className="mb-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            Sugerencias
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                onMouseDown={() => setQuery(item)}
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
