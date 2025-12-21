"use client";

import { useAccount } from "@/components/AccountProvider";
import { useEffect, useMemo, useState } from "react";

type AccountSessionResponse = {
  accountId: string;
  accountSessionSecret: string;
};

const theme = {
  colorPrimary: "#2373c8",
  fontFamily: "Geist"
};

type SupplierFinanceScreenProps = {
  supplierName: string;
  initialAccountId?: string | null;
};

export default function SupplierFinanceScreen({ supplierName, initialAccountId }: SupplierFinanceScreenProps) {
  const { accountId, setAccountId } = useAccount();
  const [accountSession, setAccountSession] = useState<AccountSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/embedded.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (initialAccountId && !accountId) {
      setAccountId(initialAccountId);
    }
  }, [initialAccountId, accountId, setAccountId]);

  useEffect(() => {
    if (!accountId) {
      setAccountSession(null);
      setLoading(false);
      return;
    }

    let active = true;

    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/create-account-session", {
          method: "POST"
        });
        const payload = (await response.json()) as AccountSessionResponse | { error: string };
        if (!response.ok || "error" in payload) {
          throw new Error((payload as { error: string }).error ?? "Error al crear la sesión de Stripe");
        }
        if (!active) return;
        setAccountId(payload.accountId);
        setAccountSession(payload);
      } catch (cause) {
        if (!active) return;
        setError((cause as Error).message || "No fue posible conectar con Stripe");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      active = false;
    };
  }, [accountId, setAccountId]);

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    setError(null);

    try {
      const response = await fetch("/api/create-supplier-account", {
        method: "POST"
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "No pudimos iniciar el onboarding de Stripe");
      }
      window.location.assign(payload.url);
    } catch (cause) {
      setError((cause as Error).message || "No pudimos iniciar Stripe");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const themeAttr = useMemo(() => JSON.stringify(theme), []);
  const returnUrl = typeof window !== "undefined" ? `${window.location.origin}/supplier/finance` : undefined;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Finanzas</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Gestión de payouts · {supplierName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra ingresos, retiros y datos de pagos sin salir de Proactivitis.
        </p>
      </header>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Conectando con Stripe...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-sm">
          <p className="font-semibold">No pudimos cargar Stripe.</p>
          <p>{error}</p>
          <button
            disabled={isCreatingAccount}
            onClick={handleCreateAccount}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCreatingAccount ? "Cargando..." : "Configurar mi cuenta de Stripe ahora"}
          </button>
        </div>
      )}

      {!accountId && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Stripe Connect</p>
          <p className="mt-2 text-sm text-slate-600">
            Parece que aún no tienes una cuenta conectada. Para recibir pagos en Proactivitis primero debes configurar tu cuenta
            de Stripe.
          </p>
          <button
            disabled={isCreatingAccount}
            onClick={handleCreateAccount}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingAccount ? "Abriendo Stripe..." : "Configurar cuenta de Stripe"}
          </button>
        </div>
      )}

      {accountSession && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Stripe Connect</p>
          <div className="mt-6 min-h-[600px]">
            <stripe-payouts
              style={{ width: "100%", minHeight: "100%" }}
              account-session={accountSession.accountSessionSecret}
              theme={themeAttr}
              return-url={returnUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
}
