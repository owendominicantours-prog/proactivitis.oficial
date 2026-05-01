"use client";

import { useState } from "react";

type ReserveFloatingButtonProps = {
  targetId: string;
  priceLabel?: string;
  label?: string;
  buttonLabel?: string;
};

export default function ReserveFloatingButton({
  targetId,
  priceLabel,
  label,
  buttonLabel
}: ReserveFloatingButtonProps) {
  const [hiddenAfterClick, setHiddenAfterClick] = useState(false);
  if (hiddenAfterClick) return null;

  const scroll = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHiddenAfterClick(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 rounded-t-[28px] border-t border-slate-200 bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-14px_35px_rgba(15,23,42,0.18)] lg:hidden">
      <div className="min-w-0">
        <p className="text-base font-semibold leading-5 text-slate-900">{label ?? "Desde"}</p>
        <p className="text-2xl font-black leading-7 text-slate-950">{priceLabel ?? "Consultar precio"}</p>
        <p className="text-sm font-semibold leading-4 text-slate-700">por persona</p>
      </div>
      <button
        onClick={scroll}
        className="min-h-14 shrink-0 rounded-full bg-sky-600 px-7 py-3 text-base font-black text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500"
      >
        {buttonLabel ?? "Reserva"}
      </button>
    </div>
  );
}
