"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

export const CustomerTopbar = () => {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "Cliente";
  const name = session?.user?.name ?? "Cliente Proactivitis";

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <div className="flex items-center gap-3">
        <span className="inline-flex rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
          <Image src="/logo.png" alt="Proactivitis" width={150} height={45} className="h-8 w-auto object-contain" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Hola, {name}</p>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Customer Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Notificaciones</button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-900">{role}</span>
          <div className="h-10 w-10 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
};
