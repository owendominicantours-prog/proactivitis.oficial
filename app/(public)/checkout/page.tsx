import { Suspense } from 'react';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8' />}>
      <CheckoutForm />
    </Suspense>
  );
}
