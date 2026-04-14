"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SITE_CONFIG } from "@/lib/site-config";

const suggestions = ["Punta Cana", "Saona", "Buggy", "Snorkel", "Catamaran"];

export function PublicHeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isFunjet = SITE_CONFIG.variant === "funjet";

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
        aria-label="Open search"
        className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
          isFunjet
            ? "border border-white/20 bg-white/10 text-white hover:border-[#FFC300] hover:text-[#FFC300]"
            : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="11" cy="11" r="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute right-0 top-full z-30 mt-2 w-80 rounded-[26px] p-4 shadow-lg ${
            isFunjet
              ? "border border-white/10 bg-[linear-gradient(180deg,#4D0A7D_0%,#6A0DAD_100%)] text-white shadow-[0_24px_65px_rgba(49,7,79,0.38)]"
              : "border border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold outline-none ${
                isFunjet
                  ? "border border-white/15 bg-white/12 text-white placeholder:text-white/55"
                  : "border border-slate-200 bg-slate-50 text-slate-800"
              }`}
              placeholder={isFunjet ? "Busca Saona, buggy o snorkel" : "Buscar destino o tour"}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] transition ${
                isFunjet ? "bg-[#FFC300] text-[#4D0A7D] hover:bg-[#FFD24D]" : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {isFunjet ? "Go" : "Ir"}
            </button>
          </div>
          <div className={`mt-3 text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-white/65" : "text-slate-500"}`}>
            {isFunjet ? "Ideas rapidas" : "Sugerencias"}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] transition ${
                  isFunjet
                    ? "border border-white/15 bg-white/8 text-white/88 hover:border-[#FFC300] hover:text-[#FFC300]"
                    : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
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
