 "use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CSSProperties, ReactNode, useEffect, useState } from "react";

type HeaderProps = {
  navItems: { label: string; href: string }[];
  navDisplay?: "inline" | "dropdown";
  rightSlot?: ReactNode;
  logoScale?: number;
  dropdownNav?: { label: string; items: { label: string; href: string }[] };
};

export const Header = ({
  navItems,
  navDisplay = "inline",
  rightSlot,
  logoScale = 3,
  dropdownNav
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
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center overflow-visible">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Proactivitis"
              width={200}
              height={60}
              className="h-14 max-w-[190px] w-auto object-contain origin-left scale-100 transition-transform md:h-12 md:max-w-none md:scale-[var(--logo-scale)]"
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
                          className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 hover:bg-slate-50"
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
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
          {dropdownNav ? (
            <div className="mt-2 space-y-2">
              <p className="px-3 text-[10px] tracking-[0.3em] text-slate-400">{dropdownNav.label}</p>
              {dropdownNav.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
