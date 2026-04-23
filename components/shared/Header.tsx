"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
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
  const isActivePath = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[5.5rem] sm:px-6">
        <div className="flex min-w-0 items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Proactivitis"
              width={200}
              height={60}
              className="h-[8.5rem] w-auto max-w-[520px] origin-left object-contain transition-transform sm:h-[7rem] sm:max-w-[420px] lg:h-12 lg:max-w-none lg:scale-[var(--logo-scale)]"
              style={{ "--logo-scale": logoScale } as CSSProperties}
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-4 text-sm text-slate-700 lg:flex">
          {navDisplay === "inline" ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-sm">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    isActivePath(item.href)
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-100"
                  >
                    {dropdownNav.label}
                    <ChevronDown className={`h-4 w-4 transition ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className={`pointer-events-auto absolute left-0 z-50 mt-3 w-64 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl transition duration-150 ${
                      dropdownOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {dropdownNav.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                            isActivePath(item.href)
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50"
              >
                Secciones
                <ChevronDown className={`h-4 w-4 transition ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                className={`pointer-events-auto absolute left-0 z-50 mt-3 w-72 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl transition duration-150 ${
                  dropdownOpen ? "visible opacity-100" : "invisible opacity-0"
                }`}
              >
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className={`rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        isActivePath(item.href)
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            aria-expanded={mobileOpen}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {mobileOpen ? "Cerrar" : "Menu"}
          </button>
        </div>
      </div>

      <div className={`lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-expanded={mobileOpen}>
        <div
          className={`fixed inset-0 z-40 bg-slate-950/30 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`fixed inset-x-0 top-24 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto border-t border-slate-100 bg-white shadow-2xl transition duration-200 sm:top-[5.5rem] sm:max-h-[calc(100vh-5.5rem)] ${
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-400">Navegacion</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Menu principal</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                aria-label="Cerrar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {rightSlot ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">{rightSlot}</div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-3xl border px-4 py-4 transition ${
                    isActivePath(item.href)
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {dropdownNav ? (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {dropdownNav.label}
                </p>
                <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  {dropdownNav.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-3xl border px-4 py-4 transition ${
                        isActivePath(item.href)
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
