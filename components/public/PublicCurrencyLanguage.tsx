"use client";

import { useState } from "react";

const currencyOptions = ["USD", "EUR", "DOP"];
const languageOptions = [
  { label: "Español", value: "ES" },
  { label: "English", value: "EN" }
];

export function PublicCurrencyLanguage() {
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("ES");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setCurrencyOpen((prev) => !prev);
            setLanguageOpen(false);
          }}
          className="flex h-10 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
        >
          {currency}
          <span className="ml-1 text-[11px]">▾</span>
        </button>
        {currencyOpen && (
          <div className="absolute left-0 mt-1 w-24 rounded-2xl border border-slate-200 bg-white shadow-lg">
            {currencyOptions.map((option) => (
              <button
                type="button"
                key={option}
                className="w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setCurrency(option);
                  setCurrencyOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setLanguageOpen((prev) => !prev);
            setCurrencyOpen(false);
          }}
          className="flex h-10 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
        >
          {language}
          <span className="ml-1 text-[11px]">▾</span>
        </button>
        {languageOpen && (
          <div className="absolute left-0 mt-1 w-28 rounded-2xl border border-slate-200 bg-white shadow-lg">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setLanguage(option.value);
                  setLanguageOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
