"use client";

import { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export type CustomerPaymentSummary = {
  method?: string | null;
  brand?: string | null;
  last4?: string | null;
  updatedAt?: string | null;
  isStripe?: boolean;
  stripePaymentMethodId?: string | null;
};

type CustomerPaymentMethodProps = {
  initialPayment?: CustomerPaymentSummary | null;
  title?: string;
};

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CustomerPaymentMethod({ initialPayment, title = "Metodo de pago" }: CustomerPaymentMethodProps) {
  const [savedPayment, setSavedPayment] = useState<CustomerPaymentSummary | null>(initialPayment ?? null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(!(initialPayment?.stripePaymentMethodId ?? false));
  const [removing, setRemoving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!stripePromise) return undefined;
    setLoading(true);
    fetch("/api/customer/payment/setup-intent", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setClientSecret(data?.clientSecret ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setFeedback("No pudimos iniciar Stripe. Intenta mas tarde.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Pagos</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        {savedPayment && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Guardada
          </span>
        )}
      </div>

      {savedPayment ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
          <div className="bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.3),transparent_30%),linear-gradient(135deg,#0f172a,#111827)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">Metodo seguro</p>
            <p className="mt-8 text-lg font-semibold tracking-[0.18em]">
              **** **** **** {savedPayment.last4 ?? "0000"}
            </p>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Marca</p>
                <p className="text-sm font-semibold uppercase text-white">{savedPayment.brand ?? "Tarjeta"}</p>
              </div>
              <p className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                Stripe
              </p>
            </div>
          </div>
          <div className="bg-white p-4 text-sm text-slate-700">
            <p className="text-xs text-slate-500">No almacenamos el numero completo. Puedes cambiarla o eliminarla cuando quieras.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing((current) => !current);
                  setFeedback(null);
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
              >
                {editing ? "Ocultar formulario" : "Cambiar tarjeta"}
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={async () => {
                  setRemoving(true);
                  setFeedback(null);
                  const response = await fetch("/api/customer/payment", { method: "DELETE" });
                  const data = (await response.json().catch(() => ({}))) as { error?: string };
                  if (!response.ok) {
                    setFeedback(data.error ?? "No pudimos eliminar la tarjeta guardada.");
                    setRemoving(false);
                    return;
                  }
                  setSavedPayment(null);
                  setEditing(true);
                  setRemoving(false);
                  setFeedback("Tarjeta eliminada correctamente.");
                }}
                className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 disabled:opacity-60"
              >
                {removing ? "Eliminando..." : "Eliminar tarjeta"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Aun no tienes un metodo de pago guardado.
        </div>
      )}

      {!stripePromise && <p className="text-sm text-rose-500">No se ha configurado la clave publica de Stripe.</p>}
      {loading && <p className="text-sm text-slate-500">Cargando formulario de pago...</p>}

      {clientSecret && stripePromise && editing && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentSetupForm
            onSaved={(payment) => {
              setSavedPayment(payment);
              setEditing(false);
              setFeedback("Metodo guardado correctamente.");
            }}
            onError={(message) => setFeedback(message)}
          />
        </Elements>
      )}

      {feedback && <p className="text-sm text-slate-500">{feedback}</p>}
    </div>
  );
}

type StripePaymentSetupFormProps = {
  onSaved: (payment: CustomerPaymentSummary) => void;
  onError: (message: string) => void;
};

function StripePaymentSetupForm({ onSaved, onError }: StripePaymentSetupFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) {
      onError("Stripe aun no esta listo.");
      return;
    }

    setSubmitting(true);
    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.href
      },
      redirect: "if_required"
    });

    if (result.error) {
      onError(result.error.message ?? "No pudimos guardar el metodo.");
      setSubmitting(false);
      return;
    }

    if (result.setupIntent?.status !== "succeeded") {
      onError("No pudimos confirmar el metodo. Intenta otra vez.");
      setSubmitting(false);
      return;
    }

    const saveResponse = await fetch("/api/customer/payment/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupIntentId: result.setupIntent.id })
    });

    if (!saveResponse.ok) {
      onError("No pudimos guardar el metodo en la cuenta.");
      setSubmitting(false);
      return;
    }

    const data = (await saveResponse.json()) as { payment?: CustomerPaymentSummary };
    if (data.payment) {
      onSaved(data.payment);
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {submitting ? "Guardando..." : "Guardar metodo"}
      </button>
      <p className="text-xs text-slate-400">
        Guardamos tu tarjeta en Stripe para futuras reservas. Puedes actualizarla cuando quieras.
      </p>
    </form>
  );
}
