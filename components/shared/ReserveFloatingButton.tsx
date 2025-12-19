"use client";

import { useEffect, useState } from "react";

type ReserveFloatingButtonProps = {
  targetId: string;
  priceLabel?: string;
};

export default function ReserveFloatingButton({ targetId, priceLabel }: ReserveFloatingButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hiddenAfterClick, setHiddenAfterClick] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 200;
      if (window.scrollY < 200 && hiddenAfterClick) {
        setHiddenAfterClick(false);
      }
      setIsVisible(shouldShow && !hiddenAfterClick);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hiddenAfterClick]);

  if (!isVisible) return null;

  const scroll = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHiddenAfterClick(true);
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-2xl shadow-slate-900/30 backdrop-blur lg:hidden">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Desde</p>
        <p className="text-lg font-semibold text-slate-900">{priceLabel ?? "Consultar precio"}</p>
      </div>
      <button
        onClick={scroll}
        className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold uppercase text-white transition hover:bg-sky-500"
      >
        Reserva
      </button>
    </div>
  );
}
