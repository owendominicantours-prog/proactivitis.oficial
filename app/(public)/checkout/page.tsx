import { Suspense } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/checkout/CheckoutForm';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function CheckoutPage() {
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

  return <Elements stripe={stripePromise}>{content}</Elements>;
}
