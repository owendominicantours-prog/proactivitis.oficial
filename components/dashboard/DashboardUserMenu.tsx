'use client';

import { signOut, useSession } from "next-auth/react";
import { SITE_CONFIG } from "@/lib/site-config";

export function DashboardUserMenu() {
  const { data: session, status } = useSession();
  const isFunjet = SITE_CONFIG.variant === "funjet";
  const userLabel = session?.user?.name || session?.user?.email || "Usuario";
  const initials = userLabel
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  if (status === "loading") {
    return <span className={`text-xs ${isFunjet ? "text-white/70" : "text-slate-500"}`}>Cargando...</span>;
  }

  if (!session) {
    return null;
  }

  return (
    <details className="relative">
      <summary
        className={`flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold transition ${
          isFunjet
            ? "border border-white/15 bg-white/8 text-white hover:border-white/25"
            : "border border-slate-200 text-slate-700 hover:border-slate-300"
        }`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.7rem] font-semibold ${
            isFunjet ? "bg-[#FFC300] text-[#4c0685]" : "bg-slate-900 text-white"
          }`}
        >
          {initials}
        </span>
      </summary>
      <div
        className={`absolute right-0 z-50 mt-2 w-52 rounded-2xl shadow-lg ${
          isFunjet
            ? "border border-white/10 bg-[#4c0685] text-white shadow-[0_18px_38px_rgba(20,2,35,0.24)]"
            : "border border-slate-200 bg-white"
        }`}
      >
        <div className="p-3 text-xs">
          <p className={`font-semibold ${isFunjet ? "text-white" : "text-slate-800"}`}>{userLabel}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`mt-3 w-full rounded-full px-3 py-2 text-xs font-semibold transition ${
              isFunjet
                ? "border border-[#FFC300] bg-[#FFC300] text-[#4c0685] hover:brightness-95"
                : "border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900"
            }`}
          >
            Cerrar sesiÃ³n
          </button>
        </div>
      </div>
    </details>
  );
}
