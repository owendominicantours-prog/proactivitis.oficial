"use server";

import type Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const parsePositive = (input: string | string[] | null | undefined, fallback = 0) => {
  if (Array.isArray(input)) {
    input = input[0];
  }
  if (!input) {
    return fallback;
  }
  const parsed = Number.parseInt(input, 10);
  return Number.isNaN(parsed) ? fallback : Math.max(fallback, parsed);
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    tourId?: string;
    date?: string;
    time?: string;
    adults?: string;
    youth?: string;
    child?: string;
  };

  if (!body.tourId) {
    return NextResponse.json({ error: "Falta la referencia del tour." }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({
    where: { id: body.tourId },
    include: {
      SupplierProfile: true
    }
  });

  if (!tour) {
    return NextResponse.json({ error: "Tour no encontrado." }, { status: 404 });
  }

  const adults = parsePositive(body.adults, 1);
  const youth = parsePositive(body.youth, 0);
  const child = parsePositive(body.child, 0);
  const passengerCount = Math.max(1, adults + youth + child);

  const totalAmount = tour.price * passengerCount;
  const centsAmount = Math.round(totalAmount * 100);
  const currency = (process.env.STRIPE_CURRENCY ?? "usd").toLowerCase();
  const platformSharePercent = Math.min(Math.max(tour.platformSharePercent ?? 20, 20), 50);
  const applicationFeeAmount = Math.round((centsAmount * platformSharePercent) / 100);
  const supplierAccountId = tour.SupplierProfile?.stripeAccountId;

  const descriptionSegments = [tour.title];
  if (body.date) descriptionSegments.push(body.date);
  if (body.time) descriptionSegments.push(body.time);

  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount: centsAmount,
    currency,
    description: descriptionSegments.join(" · "),
    metadata: {
      tourId: tour.id,
      passengerCount: passengerCount.toString(),
      date: body.date ?? "",
      time: body.time ?? ""
    },
    application_fee_amount: applicationFeeAmount
  };

  if (supplierAccountId) {
    intentParams.transfer_data = {
      destination: supplierAccountId
    };
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create(intentParams);

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    amount: totalAmount
  });
}
