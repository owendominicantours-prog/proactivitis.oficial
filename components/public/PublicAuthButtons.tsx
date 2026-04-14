"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { SITE_CONFIG } from "@/lib/site-config";

export function PublicAuthButtons() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const showPortalButton = session && (pathname === "/" || pathname === "/home");
  const isFunjet = SITE_CONFIG.variant === "funjet";

  if (status === "loading") {
    return <div className="text-sm text-slate-500">Cargando...</div>;
  }

  if (isFunjet && !session) {
    return null;
  }

  if (session) {
    const isAdmin = session.user?.role === "ADMIN";
    const portalHref = isFunjet ? (isAdmin ? "/admin" : "/") : "/portal";
    return (
      <div className="flex items-center gap-2">
        {showPortalButton || isFunjet ? (
          <Link
            href={portalHref}
            className="flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            {isFunjet ? (isAdmin ? "Admin" : SITE_CONFIG.name) : "Portal"}
          </Link>
        ) : (
          <Link
            href={portalHref}
            aria-label="Abrir portal"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 19.5a6.5 6.5 0 0113 0" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11.5a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Cerrar sesion"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H9"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn(undefined, { callbackUrl: "/" })}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-400"
      aria-label="Iniciar sesion"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 19.5a6.5 6.5 0 0113 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11.5a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    </button>
  );
}
