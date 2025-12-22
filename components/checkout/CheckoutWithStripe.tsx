'use client';

'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';
import CheckoutForm from './CheckoutForm';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

type PaymentIntentRequest = {
  tourId: string;
  date?: string | null;
  time?: string | null;
  adults?: string | null;
  youth?: string | null;
  child?: string | null;
};

export default function CheckoutWithStripe() {
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo<PaymentIntentRequest>(() => {
    return {
      tourId: searchParams.get('tourId') ?? '',
      date: searchParams.get('date'),
      time: searchParams.get('time'),
      adults: searchParams.get('adults'),
      youth: searchParams.get('youth'),
      child: searchParams.get('child')
    };
  }, [searchParams]);

  const missingTourError = useMemo(() => {
    return payload.tourId ? null : "Falta identificar el tour seleccionado.";
  }, [payload.tourId]);

  useEffect(() => {
    if (missingTourError) {
      return;
    }

    const controller = new AbortController();
    const fetchSecret = async () => {
      try {
        const response = await fetch('/api/checkout/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error ?? 'No se pudo generar el pago.');
        }
        setError(null);
        setClientSecret(data.clientSecret);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        console.error('Could not fetch client secret', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Error al generar el pago.');
      }
    };

    fetchSecret();
    return () => controller.abort();
  }, [payload, missingTourError]);

  const content = (
    <Suspense fallback={<div className='min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8' />}>
      <CheckoutForm />
    </Suspense>
  );

  if (!stripePromise) {
    return (
      <div className='min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8'>
        <p className='rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-rose-600'>
          Stripe no está configurado. Revisa la variable <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
        </p>
        {content}
      </div>
    );
  }

  const displayError = missingTourError ?? error;
  const effectiveClientSecret = missingTourError ? null : clientSecret;
  const isLoading = !effectiveClientSecret && !displayError;

  if (isLoading || !effectiveClientSecret) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10'>
        {displayError ? (
          <p className='rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600'>
            {displayError}
          </p>
        ) : (
          <p className='rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600'>
            Preparando el checkout seguro…
          </p>
        )}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: clientSecret ?? undefined }}>
      {content}
    </Elements>
  );
}
