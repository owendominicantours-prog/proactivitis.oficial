"use client";

import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import type { RentCarOption } from "@/data/rentCarFleet";

type RentCarLeadCardProps = {
  option: RentCarOption;
  compact?: boolean;
};

export default function RentCarLeadCard({ option, compact = false }: RentCarLeadCardProps) {
  const whatsappText = encodeURIComponent(
    `I want to reserve ${option.model} in ${option.locationName}. Proactivitis Price: $${option.price} ${option.currency}/day.`
  );

  return (
    <aside
      className={
        compact
          ? "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          : "rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60"
      }
    >
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
          Proactivitis Price
        </p>
        <p className="mt-2 text-3xl font-black">${option.price.toFixed(option.price % 1 ? 2 : 0)}</p>
        <p className="mt-1 text-xs font-semibold text-slate-300">per day - VIP Support included</p>
      </div>

      <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-800">
          Modelo 2024/2025 garantizado o similar confirmado.
        </p>
        <p className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sky-800">
          Google News Approved Publisher trust layer.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Before reservation</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">Continue with Google to save this vehicle.</p>
        <div className="mt-3">
          <GoogleAuthButton
            label="Continue with Google"
            callbackUrl={option.href}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
          />
        </div>
      </div>

      <a
        href={`https://wa.me/18293939757?text=${whatsappText}`}
        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-emerald-700"
      >
        Request vehicle
      </a>
      <p className="mt-3 text-center text-xs text-slate-500">Final confirmation is handled by Proactivitis support.</p>
    </aside>
  );
}
