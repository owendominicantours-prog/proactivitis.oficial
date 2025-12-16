"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "Destinos", href: "/destinations" },
  { label: "Contacto", href: "/contact" }
];

export function PublicNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full items-center gap-6 text-sm font-medium">
      <div className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
        {navLinks.map((item) => (
          <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
            {item.label}
          </Link>
        ))}
      </div>

      <div className="relative flex-1 md:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 p-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menú
          <span className={`h-2 w-2 rounded-full bg-slate-700 transition ${open ? "rotate-45" : ""}`} />
        </button>
        {open && (
          <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg backdrop-blur-md">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block transition hover:text-slate-900"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
