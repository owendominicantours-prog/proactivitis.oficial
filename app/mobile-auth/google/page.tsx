"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function MobileGoogleAuthPage() {
  const [message, setMessage] = useState("Abriendo Google...");

  useEffect(() => {
    signIn("google", { callbackUrl: "/api/mobile/auth/google/complete" }).catch(() => {
      setMessage("No pudimos abrir Google. Vuelve a la app e intenta otra vez.");
    });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Proactivitis</p>
        <h1 className="mt-4 text-2xl font-semibold">Login seguro</h1>
        <p className="mt-3 text-sm leading-6 text-slate-200">{message}</p>
      </section>
    </main>
  );
}
