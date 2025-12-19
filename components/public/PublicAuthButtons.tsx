"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export function PublicAuthButtons() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const showPortalButton = session && (pathname === "/" || pathname === "/home");

  if (status === "loading") {
    return <div className="text-sm text-slate-500">Cargando...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {showPortalButton ? (
          <Link
            href="/portal"
            className="flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white p-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Portal
          </Link>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 19.5a6.5 6.5 0 0113 0" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11.5a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn(undefined, { callbackUrl: "/" })}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 19.5a6.5 6.5 0 0113 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11.5a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    </button>
  );
}
