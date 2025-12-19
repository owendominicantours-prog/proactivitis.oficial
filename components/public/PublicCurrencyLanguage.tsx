"use client";

import { useState } from "react";

export function PublicCurrencyLanguage() {
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("Español");

  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
      <label className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1">
        <span>Moneda:</span>
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="bg-transparent text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-slate-700 outline-none"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="DOP">DOP</option>
        </select>
      </label>
      <label className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1">
        <span>Idioma:</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="bg-transparent text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-slate-700 outline-none"
        >
          <option value="Español">Español</option>
          <option value="English">English</option>
        </select>
      </label>
    </div>
  );
}
