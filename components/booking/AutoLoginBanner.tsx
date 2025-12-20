"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AutoLoginBannerProps = {
  bookingId: string;
  sessionId?: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function AutoLoginBanner({ bookingId, sessionId }: AutoLoginBannerProps) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let active = true;
    const payload = { bookingId, sessionId };

    const login = async () => {
      setStatus("loading");
      try {
        const response = await fetch("/api/session/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!active) return;
        setStatus(data.ok ? "success" : "error");
      } catch (error) {
        if (active) {
          setStatus("error");
        }
      }
    };

    login();

    return () => {
      active = false;
    };
  }, [bookingId, sessionId]);

  if (status === "idle") {
    return null;
  }

  if (status === "loading") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-600 shadow-sm">
        Iniciando sesión automáticamente...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-semibold text-rose-700 shadow-sm">
        No pudimos iniciar sesión automáticamente. Intenta <Link href="/auth/login" className="underline text-rose-800">ingresar manualmente</Link>.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-900 shadow-sm">
      Sesión iniciada. ¿Querés cambiar tu contraseña?{" "}
      <Link href="/auth/reset" className="font-semibold text-emerald-800 underline">
        Haz clic aquí
      </Link>
      .
    </div>
  );
}
