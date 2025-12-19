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
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-600">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setCurrencyOpen((prev) => !prev);
            setLanguageOpen(false);
          }}
          className="flex h-10 items-center justify-center gap-1 rounded-full border border-slate-200 px-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-600"
        >
          {currency}
          <svg className="h-3 w-3" viewBox="0 0 8 6" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 1l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {currencyOpen && (
          <div className="absolute left-0 mt-1 w-24 rounded-2xl border border-slate-200 bg-white shadow-lg">
            {currencyOptions.map((option) => (
              <button
                type="button"
                key={option}
                className="w-full px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-600 hover:bg-slate-50"
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
          className="flex h-10 items-center justify-center gap-1 rounded-full border border-slate-200 px-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-600"
        >
          {language}
          <svg className="h-3 w-3" viewBox="0 0 8 6" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 1l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {languageOpen && (
          <div className="absolute left-0 mt-1 w-28 rounded-2xl border border-slate-200 bg-white shadow-lg">
            {languageOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className="w-full px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-600 hover:bg-slate-50"
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
