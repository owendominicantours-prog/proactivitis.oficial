"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export const Topbar = () => {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "Admin";

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <div className="flex items-center gap-3">
        <span className="inline-flex rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
          <Image src="/logo.png" alt="Proactivitis" width={155} height={46} className="h-8 w-auto object-contain" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin Control Center</p>
          <h1 className="text-2xl font-semibold text-slate-900">Panel de Operaciones</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
        >
          Ver web publica
        </Link>
        <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
          Notificaciones
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
          <span className="text-xs text-slate-500">{role}</span>
        </div>
      </div>
    </div>
  );
};
