"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");

  const redirectMap: Record<string, string> = {
    ADMIN: "/admin",
    SUPPLIER: "/supplier",
    AGENCY: "/agency",
    CUSTOMER: "/customer"
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/"
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    if (!sessionResponse.ok) {
      router.push("/");
      return;
    }

    const sessionData = await sessionResponse.json();
    const role = sessionData?.user?.role ?? "CUSTOMER";
    router.push(redirectMap[role] || "/portal");
  };

  const allowPublicLogin = process.env.NEXT_PUBLIC_ALLOW_PUBLIC_LOGIN !== "false";
  if (!allowPublicLogin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-card">
          <Link
            href="/"
            className="mb-6 inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Volver a inicio
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Acceso restringido</h1>
          <p className="mt-4 text-sm text-slate-600">
            El inicio de sesion esta temporalmente cerrado al publico por razones de seguridad. Si perteneces al
            equipo o eres un cliente autorizado, contacta a{" "}
            <a className="text-brand underline" href="mailto:info@proactivitis.com">
              info@proactivitis.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-8 py-5">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Volver a inicio
          </Link>
        </div>
        <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Iniciar sesion</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Accede a tu cuenta para revisar reservas, pagos, notificaciones y herramientas segun tu perfil dentro de Proactivitis.
          </p>
        </div>
        <div className="mt-6 space-y-3">
          <GoogleAuthButton label="Entrar con Google" callbackUrl="/portal" />
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            O usa tu correo
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Email
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Contrasena
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
          </label>
          {error && <p className="text-xs text-red-600">{decodeURIComponent(error)}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Validando..." : "Acceder"}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
          <Link
            href="/auth/reset"
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-slate-400"
          >
            Restablecer contrasena
          </Link>
          <Link
            href="/auth/register"
            className="rounded-2xl border border-brand px-4 py-2 font-semibold text-brand hover:bg-brand/10"
          >
            Crear cuenta de cliente
          </Link>
        </div>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            Acceso oficial de plataforma
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-600">
            Este formulario pertenece al sistema oficial de acceso de Proactivitis. Utiliza una conexion segura para la autenticacion
            de clientes, agencias, suppliers y personal autorizado. No compartas tus credenciales con terceros.
          </p>
          <p className="mt-3 text-[11px] leading-6 text-slate-500">
            Si recibiste un enlace para iniciar sesion o restablecer tu contrasena, verifica siempre que el dominio visible sea
            <span className="font-semibold text-slate-700"> proactivitis.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
