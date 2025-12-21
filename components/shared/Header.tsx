 "use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useState } from "react";

type HeaderProps = {
  navItems: { label: string; href: string }[];
  navDisplay?: "inline" | "dropdown";
  rightSlot?: ReactNode;
  logoScale?: number;
};

export const Header = ({ navItems, navDisplay = "inline", rightSlot, logoScale = 3 }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center overflow-visible">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Proactivitis"
              width={200}
              height={60}
              className="h-12 w-auto object-contain origin-left"
              style={{ transform: `scale(${logoScale})`, transformOrigin: "left" }}
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-700 md:flex">
          {navDisplay === "inline" ? (
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
              >
                Menú
                <span className="text-base leading-4">▾</span>
              </button>
              <div
                className={`pointer-events-auto absolute left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg transition duration-150 ${
                  dropdownOpen ? "visible opacity-100" : "invisible opacity-0"
                }`}
              >
                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 hover:bg-slate-50"
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

        <div className="flex items-center gap-4 md:hidden">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            Menú
          </button>
          {rightSlot}
        </div>
      </div>

      <div
        className={`md:hidden ${mobileOpen ? "block" : "hidden"} bg-white border-t border-slate-100`}
        aria-expanded={mobileOpen}
      >
        <div className="flex flex-col px-6 py-4 gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};
