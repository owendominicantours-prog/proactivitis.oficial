"use client";

import { FormEvent, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

type PaymentElementStepProps = {
  bookingId: string;
  clientSecret: string;
  amount: number;
};

export default function PaymentElementStep({ bookingId, clientSecret, amount }: PaymentElementStepProps) {
  const appearanceOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "flat",
        variables: {
          colorPrimary: "#047857",
          colorBackground: "#f8fafc",
          borderRadius: "16px",
          paddingBlock: "8px",
          spacingGridRow: "12px"
        }
      }
    }),
    [clientSecret]
  );

  if (!stripePromise) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">
        No se ha configurado la clave pública de Stripe.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <Elements stripe={stripePromise} options={appearanceOptions}>
        <PaymentElementForm bookingId={bookingId} amount={amount} />
      </Elements>
    </div>
  );
}

function PaymentElementForm({ bookingId, amount }: { bookingId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const successBase =
    (process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL ?? "https://proactivitis.com/booking/confirmed").replace(/\/$/, "");
  const returnUrl = `${successBase}/${bookingId}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Estamos preparando el formulario de pago...");
      return;
    }

    setStatus("processing");
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl
      }
    });

    if (error) {
      setErrorMessage(error.message ?? "No pudimos confirmar el pago.");
      setStatus("error");
      return;
    }

    setStatus("idle");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total a pagar</p>
        <p className="text-2xl font-bold text-slate-900">
          {new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(amount)}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
      <button
        type="submit"
        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-700 disabled:bg-emerald-300"
        disabled={!stripe || status === "processing"}
      >
        {status === "processing" ? "Procesando..." : "Pagar ahora"}
      </button>
      <p className="text-xs text-slate-500">
        Serás redirigido a la confirmación cuando se complete el pago.
      </p>
    </form>
  );
}
