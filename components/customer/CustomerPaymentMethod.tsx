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
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {savedPayment && (
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Metodo guardado
          </span>
        )}
      </div>

      {savedPayment ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">
            {savedPayment.brand ?? "Metodo"} ? **** {savedPayment.last4 ?? "0000"}
          </p>
          <p className="text-xs text-slate-500">Guardado en Stripe. No almacenamos el numero completo.</p>
        </div>
      ) : (
        <p className="text-sm text-slate-600">Aun no tienes un metodo de pago guardado.</p>
      )}

      {!stripePromise && (
        <p className="text-sm text-rose-500">No se ha configurado la clave publica de Stripe.</p>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando formulario de pago...</p>}

      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentSetupForm
            onSaved={(payment) => {
              setSavedPayment(payment);
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {submitting ? "Guardando..." : "Guardar metodo"}
      </button>
      <p className="text-xs text-slate-400">
        Guardamos tu tarjeta en Stripe para futuras reservas. Puedes actualizarla cuando quieras.
      </p>
    </form>
  );
}
