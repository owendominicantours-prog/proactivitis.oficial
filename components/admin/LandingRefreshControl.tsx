"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { refreshTransferLandingsAction } from "@/app/(dashboard)/admin/landings/actions";

export default function LandingRefreshControl() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPending, startTransition] = useTransition();

  const triggerRefresh = useCallback(() => {
    startTransition(async () => {
      const comboSlugs = await refreshTransferLandingsAction();
      setSlugs(comboSlugs.slice(0, 5));
      if (comboSlugs.length) {
        setMessage(`Se revalidaron ${comboSlugs.length} landings. Aquí unas rutas nuevas:`);
      } else {
        setMessage("No se detectaron cambios nuevos.");
      }
      setSecondsLeft(120);
    });
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Verificación manual</p>
          <h2 className="text-lg font-semibold text-slate-900">Validar landings faltantes</h2>
          <p className="text-sm text-slate-600">
            Usa este botón cuando crees o edites rutas para forzar la regeneración y ver qué slugs quedaron listos.
          </p>
        </div>
        <button
          disabled={isPending}
          onClick={triggerRefresh}
          className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:bg-emerald-400"
        >
          {isPending ? "Generando…" : "Revisar landings"}
        </button>
      </div>
      {message ? (
        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-slate-700">
          <p>{message}</p>
          {slugs.length ? (
            <div className="flex flex-wrap gap-2">
              {slugs.map((slug) => (
                <a
                  key={slug}
                  href={`https://proactivitis.com/transfer/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-emerald-200 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:border-emerald-400"
                >
                  Ver {slug}
                </a>
              ))}
            </div>
          ) : null}
          {secondsLeft > 0 ? (
            <p className="text-xs text-emerald-600">
              Los links estarán activos ~{secondsLeft}s.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
