"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type HeaderProps = {
  navItems: { label: string; href: string }[];
  rightSlot?: ReactNode;
};

export const Header = ({ navItems, rightSlot }: HeaderProps) => {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const currencyOptions = ["USD", "EUR"];
  const languageOptions = ["ES", "EN"];
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex h-16 items-center">
            <Image src="/logo.png" alt="Proactivitis" width={200} height={60} className="h-16 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-700">
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
              onClick={() => setCurrencyOpen((prev) => !prev)}
            >
              {selectedCurrency}
              <span>▾</span>
            </button>
            {currencyOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                {currencyOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setSelectedCurrency(option);
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
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
              onClick={() => setLanguageOpen((prev) => !prev)}
            >
              {selectedLanguage}
              <span>▾</span>
            </button>
            {languageOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                {languageOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setSelectedLanguage(option);
                      setLanguageOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {rightSlot}
        </div>
      </div>
    </header>
  );
};
