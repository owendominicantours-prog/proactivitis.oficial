"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const isConfirmMode = Boolean(token);

  const handleRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/auth/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const payload = await response.json().catch(() => ({}));
    setSending(false);

    if (!response.ok) {
      setError(payload?.error ?? "No se pudo procesar tu solicitud.");
      return;
    }

    setMessage(
      payload?.message ??
        "Si el correo existe en nuestra base de datos, recibiras un enlace para restablecer la contrasena."
    );
  };

  const handleConfirmSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword })
    });

    const payload = await response.json().catch(() => ({}));
    setSending(false);

    if (!response.ok) {
      setError(payload?.error ?? "No se pudo actualizar la contrasena.");
      return;
    }

    setMessage("Tu contrasena fue actualizada. Ya puedes iniciar sesion.");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-900">
          {isConfirmMode ? "Crear nueva contrasena" : "Restablecer contrasena"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isConfirmMode
            ? "Define una nueva contrasena para recuperar el acceso a tu cuenta."
            : "Indica la direccion de correo asociada a tu cuenta y te enviaremos un enlace para recuperar el acceso."}
        </p>
        <form onSubmit={isConfirmMode ? handleConfirmSubmit : handleRequestSubmit} className="mt-6 space-y-4">
          {isConfirmMode ? (
            <>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Nueva contrasena
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  minLength={8}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Confirmar contrasena
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  minLength={8}
                  required
                />
              </label>
            </>
          ) : (
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                required
              />
            </label>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white"
            disabled={sending}
          >
            {sending ? "Procesando..." : isConfirmMode ? "Guardar nueva contrasena" : "Enviar enlace"}
          </button>

          {error && <p className="pt-2 text-xs text-rose-600">{error}</p>}
          {message && <p className="pt-2 text-xs text-emerald-600">{message}</p>}

          {isConfirmMode && message ? (
            <Link href="/auth/login" className="inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Ir a iniciar sesion
            </Link>
          ) : null}
        </form>
      </div>
    </div>
  );
}
