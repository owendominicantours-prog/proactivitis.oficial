"use client";

import { useState } from "react";

export function PublicCurrencyLanguage() {
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("ES");

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setCurrency(currency === "USD" ? "EUR" : currency === "EUR" ? "DOP" : "USD")}
        className="flex h-10 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
      >
        {currency} ▾
      </button>
      <button
        type="button"
        onClick={() => setLanguage(language === "ES" ? "EN" : "ES")}
        className="flex h-10 items-center justify-center rounded-full border border-slate-200 px-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
      >
        {language} ▾
      </button>
    </div>
  );
}
