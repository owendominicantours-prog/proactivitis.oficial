"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CSSProperties, ReactNode, useEffect, useState } from "react";

type HeaderProps = {
  navItems: { label: string; href: string }[];
  navDisplay?: "inline" | "dropdown";
  rightSlot?: ReactNode;
  logoScale?: number;
  dropdownNav?: { label: string; items: { label: string; href: string }[] };
  logoSrc?: string;
  logoAlt?: string;
  homeHref?: string;
  brandVariant?: "proactivitis" | "funjet";
};

export const Header = ({
  navItems,
  navDisplay = "inline",
  rightSlot,
  logoScale = 3,
  dropdownNav,
  logoSrc = "/logo.png",
  logoAlt = "Proactivitis",
  homeHref = "/",
  brandVariant = "proactivitis"
}: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const isFunjet = brandVariant === "funjet";

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  if (isFunjet) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/15 bg-[linear-gradient(90deg,rgba(58,6,98,0.98),rgba(106,13,173,0.97),rgba(126,39,198,0.96))] text-white shadow-[0_18px_48px_rgba(58,6,98,0.38)] backdrop-blur">
        <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={homeHref} className="flex min-w-0 items-center">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={220}
              height={74}
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-3 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/20 hover:bg-white/10 hover:text-[#FFC300]"
                style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF", textShadow: "0 1px 12px rgba(0,0,0,0.18)" }}
              >
                {item.label}
              </Link>
            ))}
            {dropdownNav ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/20 hover:bg-white/15 hover:text-[#FFC300]"
                  style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF", textShadow: "0 1px 12px rgba(0,0,0,0.18)" }}
                >
                  {dropdownNav.label}
                  <span className="text-sm leading-none">▾</span>
                </button>
                {dropdownOpen ? (
                  <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-56 rounded-[22px] border border-white/10 bg-[#4A0A76] p-2 shadow-[0_22px_56px_rgba(25,3,40,0.45)]">
                    {dropdownNav.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="block rounded-2xl px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-white/10 hover:text-[#FFC300]"
                        style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF" }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">{rightSlot}</div>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/15 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-[#4B0A79] lg:hidden">
            <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
              {rightSlot ? <div className="border-b border-white/10 pb-4">{rightSlot}</div> : null}
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10 hover:text-[#FFC300]"
                    style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              {dropdownNav ? (
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">{dropdownNav.label}</p>
                  <div className="grid gap-2">
                    {dropdownNav.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10 hover:text-[#FFC300]"
                        style={{ color: "#FFFFFF", opacity: 1, WebkitTextFillColor: "#FFFFFF" }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header
      className={
        isFunjet
          ? "sticky top-0 z-40 border-b border-white/20 bg-[linear-gradient(90deg,rgba(74,10,122,0.96),rgba(106,13,173,0.94))] text-white shadow-[0_18px_40px_rgba(106,13,173,0.22)] backdrop-blur"
          : "border-b bg-white shadow-sm"
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
        <div className="flex min-w-0 items-center overflow-visible">
          <Link href={homeHref} className={`flex items-center ${isFunjet ? "gap-3" : ""}`}>
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={200}
              height={60}
              className="h-10 max-w-[150px] w-auto origin-left object-contain transition-transform sm:h-14 sm:max-w-[190px] md:h-12 md:max-w-none md:scale-[var(--logo-scale)]"
              style={{ "--logo-scale": logoScale } as CSSProperties}
            />
            {isFunjet && logoSrc === "/logo.png" ? (
              <span className="hidden font-[var(--font-brand)] text-2xl text-[#FFC300] md:inline">{logoAlt}</span>
            ) : null}
          </Link>
        </div>

        <nav className={`hidden items-center gap-8 text-sm md:flex ${isFunjet ? "text-white" : "text-slate-700"}`}>
          {navDisplay === "inline" ? (
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isFunjet ? "text-white hover:text-[#FFC300]" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {dropdownNav ? (
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      isFunjet
                        ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {dropdownNav.label}
                    <span className="text-base leading-4">▾</span>
                  </button>
                  <div
                    className={`pointer-events-auto absolute left-0 z-50 mt-2 w-48 rounded-lg transition duration-150 ${
                      isFunjet
                        ? "border border-white/10 bg-[#4D0A7D] shadow-[0_20px_45px_rgba(45,6,70,0.35)]"
                        : "border border-slate-200 bg-white shadow-lg"
                    } ${dropdownOpen ? "visible opacity-100" : "invisible opacity-0"}`}
                  >
                    <div className="flex flex-col">
                      {dropdownNav.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                    className={`block px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                      isFunjet
                        ? "text-white hover:bg-white/10 hover:text-[#FFC300]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  isFunjet
                    ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Menu
                <span className="text-base leading-4">▾</span>
              </button>
              <div
                className={`pointer-events-auto absolute left-0 z-50 mt-2 w-56 rounded-lg transition duration-150 ${
                  isFunjet
                    ? "border border-white/10 bg-[#4D0A7D] shadow-[0_20px_45px_rgba(45,6,70,0.35)]"
                    : "border border-slate-200 bg-white shadow-lg"
                } ${dropdownOpen ? "visible opacity-100" : "invisible opacity-0"}`}
              >
                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                          className={`block px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                            isFunjet
                              ? "text-white hover:bg-white/10 hover:text-[#FFC300]"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
          {rightSlot}
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
              isFunjet ? "border border-white/20 bg-white/10 text-white" : "border border-slate-200 text-slate-700"
            }`}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>
      </div>

      <div
        className={`${isFunjet ? "border-t border-white/10 bg-[#5A1192]" : "border-t border-slate-100 bg-white"} md:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
        aria-expanded={mobileOpen}
      >
        <div className="space-y-3 px-4 py-4">
          {rightSlot ? (
            <div className={`${isFunjet ? "border-b border-white/10" : "border-b border-slate-100"} pb-3`}>
              <div className="flex flex-wrap items-center justify-between gap-3">{rightSlot}</div>
            </div>
          ) : null}

          <div className={`flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-white" : "text-slate-600"}`}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-3 py-3 transition ${isFunjet ? "text-white hover:bg-white/10 hover:text-[#FFC300]" : "hover:bg-slate-50 hover:text-slate-900"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {dropdownNav ? (
            <div className={`space-y-2 pt-3 ${isFunjet ? "border-t border-white/10" : "border-t border-slate-100"}`}>
              <p className={`px-3 text-[10px] font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-white/50" : "text-slate-400"}`}>
                {dropdownNav.label}
              </p>
              <div className={`flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] ${isFunjet ? "text-white" : "text-slate-600"}`}>
                {dropdownNav.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-3 py-3 transition ${isFunjet ? "text-white hover:bg-white/10 hover:text-[#FFC300]" : "hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
