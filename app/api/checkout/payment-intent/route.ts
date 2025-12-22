"use server";

import type Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

const parsePositive = (input: string | string[] | undefined, fallback = 0) => {
  if (!input) return fallback;
  const item = Array.isArray(input) ? input[0] : input;
  const parsed = Number.parseInt(item, 10);
  return Number.isNaN(parsed) ? fallback : Math.max(fallback, parsed);
};

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as {
    tourId?: string;
    adults?: string;
    youth?: string;
    child?: string;
    date?: string;
    time?: string;
  };

  if (!payload.tourId) {
    return NextResponse.json({ error: 'Falta el identificador del tour.' }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({
    where: { id: payload.tourId },
    include: { SupplierProfile: true }
  });

  if (!tour) {
    return NextResponse.json({ error: 'Tour no encontrado.' }, { status: 404 });
  }

  const adults = parsePositive(payload.adults, 1);
  const youth = parsePositive(payload.youth, 0);
  const child = parsePositive(payload.child, 0);
  const passengerCount = Math.max(1, adults + youth + child);
  const totalAmount = tour.price * passengerCount;
  const centsAmount = Math.round(totalAmount * 100);
  const currency = (process.env.STRIPE_CURRENCY ?? 'usd').toLowerCase();
  const platformFeePercent = Math.min(Math.max(tour.platformSharePercent ?? 20, 20), 50);
  const applicationFeeAmount = Math.round((centsAmount * platformFeePercent) / 100);
  const supplierAccountId = tour.SupplierProfile?.stripeAccountId;

  const description = [tour.title, payload.date, payload.time].filter(Boolean).join(' · ');

  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount: centsAmount,
    currency,
    description,
    metadata: {
      tourId: tour.id,
      passengerCount: passengerCount.toString(),
      date: payload.date ?? '',
      time: payload.time ?? ''
    },
    application_fee_amount: applicationFeeAmount
  };

  if (supplierAccountId) {
    intentParams.transfer_data = { destination: supplierAccountId };
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create(intentParams);

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, amount: totalAmount });
}
