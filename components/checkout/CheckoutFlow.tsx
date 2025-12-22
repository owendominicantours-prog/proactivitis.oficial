"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { recommendedReservation } from "@/lib/checkout";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Props = {
  params: { [key: string]: string | string[] | undefined };
};

type Step = 0 | 1 | 2;

type ContactForm = {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
};

const defaultForm: ContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  confirmEmail: "",
  phone: ""
};

const normalize = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value ?? "";
};

const parseIntSafe = (value: string | string[] | undefined, fallback = 0) => {
  const raw = normalize(value);
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : Math.max(fallback, parsed);
};

const buildSummary = (params: Props["params"]) => {
  const tourId = normalize(params.tourId);
  const tourTitle = normalize(params.tourTitle) || recommendedReservation.tourName;
  const tourImage = normalize(params.tourImage) || recommendedReservation.imageUrl;
  const tourPrice = Number.parseFloat(normalize(params.tourPrice)) || recommendedReservation.price;
  const date = normalize(params.date) || recommendedReservation.date;
  const time = normalize(params.time) || recommendedReservation.time;
  const adults = parseIntSafe(params.adults, 1);
  const youth = parseIntSafe(params.youth, 0);
  const children = parseIntSafe(params.child, 0);
  const totalTravelers = Math.max(1, adults + youth + children);
  const totalPrice = totalTravelers * tourPrice;
  return { tourId, tourTitle, tourImage, tourPrice, date, time, totalTravelers, totalPrice, adults, youth, children };
};

const ContactStep = ({ onNext }: { onNext: () => void }) => {
  const [form, setForm] = useState<ContactForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  const handleChange = (field: keyof ContactForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = () => {
    const nextErrors: Partial<ContactForm> = {};
    if (!form.firstName) nextErrors.firstName = "Ingresa tu nombre";
    if (!form.lastName) nextErrors.lastName = "Ingresa tu apellido";
    if (!form.email) nextErrors.email = "Ingresa tu correo";
    if (form.email !== form.confirmEmail) nextErrors.confirmEmail = "Los correos deben coincidir";
    if (!form.phone) nextErrors.phone = "Agrega tu teléfono";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4">
      {(
        [
          { label: "Nombre", key: "firstName" },
          { label: "Apellido", key: "lastName" },
          { label: "Correo", key: "email" },
          { label: "Confirmar correo", key: "confirmEmail" },
          { label: "Teléfono", key: "phone" }
        ] as const
      ).map((field) => (
        <label key={field.key} className="block text-xs uppercase tracking-[0.3em] text-slate-500">
          {field.label}
          <input
            type={field.key.includes("email") ? "email" : "text"}
            value={form[field.key]}
            onChange={handleChange(field.key)}
            className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm ${
              errors[field.key] ? "border-rose-500" : "border-slate-200"
            }`}
          />
          {errors[field.key] && <p className="text-rose-500 text-[11px]">{errors[field.key]}</p>}
        </label>
      ))}
      <button
        type="button"
        onClick={submit}
        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
      >
        Continuar
      </button>
    </div>
  );
};

const TravelStep = ({ summary }: { summary: ReturnType<typeof buildSummary>; onNext: () => void }) => (
  <div className="space-y-4">
    <p className="text-sm text-slate-600">
      {summary.totalTravelers} viajeros · {summary.date} · {summary.time}
    </p>
    <button
      type="button"
      onClick={summary.onNext}
      className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
    >
      Continuar al pago
    </button>
  </div>
);

const PaymentStep = ({
  clientSecret,
  onBack,
  onError
}: {
  clientSecret: string;
  onBack: () => void;
  onError: (message: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      onError("Stripe no está listo");
      return;
    }
    if (!email.includes("@")) {
      onError("Ingresa un correo válido");
      return;
    }
    setLoading(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL ?? "https://proactivitis.com/booking/confirmed"
      },
      redirect: "if_required"
    });
    if (result.error) {
      onError(result.error.message ?? "Error procesando el pago");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
        placeholder="tucorreo@proactivitis.com"
      />
      <PaymentElement />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <span className="inline-block">Regresar</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
        >
          {loading ? "Procesando…" : "Pagar ahora"}
        </button>
      </div>
    </form>
  );
};

export default function CheckoutFlow({ params }: Props) {
  const summary = buildSummary(params);
  const [step, setStep] = useState<Step>(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!summary.tourId) {
      setError("Falta el tour seleccionado");
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/checkout/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(summary),
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error ?? "No se pudo preparar el pago");
        }
        setClientSecret(data.clientSecret);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Error interno");
      }
    })();
    return () => controller.abort();
  }, [summary]);

  const next = () => setStep((prev) => Math.min(2, (prev + 1) as Step));

  if (!stripePromise) {
    return <p>Stripe no configurado</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-100 bg-white p-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-slate-600">
          {summary.tourTitle} · {summary.date} · {summary.totalTravelers} viajeros
        </p>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="space-y-4">
          {step === 0 && <ContactStep onNext={next} />}
          {step === 1 && (
            <div>
              <p className="text-sm text-slate-600">Confirma los detalles antes de avanzar.</p>
              <button
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                onClick={next}
                type="button"
              >
                Continuar al pago
              </button>
            </div>
          )}
          {step === 2 && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentStep clientSecret={clientSecret} onBack={() => setStep(1)} onError={setError} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
