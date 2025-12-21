"use server";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

type Body = {
  amount: number;
  currency?: string;
  supplierAccountId: string;
  successUrl: string;
  cancelUrl: string;
  description?: string;
  metadata?: Record<string, string>;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const { amount, supplierAccountId, successUrl, cancelUrl, currency = process.env.STRIPE_CURRENCY ?? "usd", description, metadata } = body;

  if (!amount || !supplierAccountId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: "Datos incompletos para el pago" }, { status: 400 });
  }

  const stripe = getStripe();
  const feePercent = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? 15);
  const applicationFeeAmount = Math.max(0, Math.round((amount * feePercent) / 100));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: description ?? "Reserva Proactivitis"
          },
          unit_amount: Math.round(amount)
        },
        quantity: 1
      }
    ],
    payment_intent_data: {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: supplierAccountId
      }
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...(metadata ?? {})
    }
  });

  return NextResponse.json({ url: session.url });
}
