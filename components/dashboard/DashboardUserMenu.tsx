'use client';

import { useEffect, useRef, useState } from "react";
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
        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[0.7rem] font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate pr-1 text-left text-[11px] font-semibold text-slate-600 sm:block">
          {userLabel}
        </span>
      </button>
      <div
        className={`absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-3xl border border-slate-200 bg-white shadow-lg transition duration-150 ${
          isOpen ? "visible pointer-events-auto opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div className="p-4 text-xs">
          <p className="break-words font-semibold text-slate-800">{userLabel}</p>
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
