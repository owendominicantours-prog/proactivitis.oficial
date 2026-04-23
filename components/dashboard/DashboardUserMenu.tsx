"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function DashboardUserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userLabel = session?.user?.name || session?.user?.email || "Usuario";
  const initials = userLabel
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <span className="text-xs text-slate-500">Cargando...</span>;
  }

  if (!session) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[0.7rem] font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate pr-1 text-left text-[11px] font-semibold text-slate-600 sm:block">
          {userLabel}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`absolute right-0 z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-slate-200 bg-white shadow-xl transition duration-150 ${
          isOpen ? "visible pointer-events-auto opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-400">Cuenta</p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-900">{userLabel}</p>
            </div>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4 text-xs">
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-3 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
