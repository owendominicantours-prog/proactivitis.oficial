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
};

export const Header = ({
  navItems,
  navDisplay = "inline",
  rightSlot,
  logoScale = 3,
  dropdownNav,
  logoSrc = "/logo.png",
  logoAlt = "Proactivitis",
  homeHref = "/"
}: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
        <div className="flex min-w-0 items-center overflow-visible">
          <Link href={homeHref} className="flex items-center">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={200}
              height={60}
              className="h-10 max-w-[150px] w-auto origin-left object-contain transition-transform sm:h-14 sm:max-w-[190px] md:h-12 md:max-w-none md:scale-[var(--logo-scale)]"
              style={{ "--logo-scale": logoScale } as CSSProperties}
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
              {dropdownNav ? (
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
                  >
                    {dropdownNav.label}
                    <span className="text-base leading-4">▾</span>
                  </button>
                  <div
                    className={`pointer-events-auto absolute left-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg transition duration-150 ${
                      dropdownOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                  >
                    <div className="flex flex-col">
                      {dropdownNav.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
              >
                Menú
                <span className="text-base leading-4">▾</span>
              </button>
              <div
                className={`pointer-events-auto absolute left-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg transition duration-150 ${
                  dropdownOpen ? "visible opacity-100" : "invisible opacity-0"
                }`}
              >
                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            Menú
          </button>
        </div>
      </div>

      <div
        className={`border-t border-slate-100 bg-white md:hidden ${mobileOpen ? "block" : "hidden"}`}
        aria-expanded={mobileOpen}
      >
        <div className="space-y-3 px-4 py-4">
          {rightSlot ? (
            <div className="border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">{rightSlot}</div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {dropdownNav ? (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                {dropdownNav.label}
              </p>
              <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                {dropdownNav.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 transition hover:bg-slate-50 hover:text-slate-900"
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
