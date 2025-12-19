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
            className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Portal
          </Link>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-700 transition hover:border-slate-400"
          >
            👤
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn(undefined, { callbackUrl: "/" })}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-700 transition hover:border-slate-400"
    >
      👤
    </button>
  );
}
