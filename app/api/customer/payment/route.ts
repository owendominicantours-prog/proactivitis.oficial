import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ payment: null }, { status: 200 });
  }

  const payment = await prisma.customerPayment.findUnique({
    where: { userId: session.user.id },
    select: {
      method: true,
      brand: true,
      last4: true,
      updatedAt: true,
      stripePaymentMethodId: true
    }
  });

  return NextResponse.json(
    {
      payment: payment
        ? {
            method: payment.method,
            brand: payment.brand,
            last4: payment.last4,
            updatedAt: payment.updatedAt,
            isStripe: Boolean(payment.stripePaymentMethodId),
            stripePaymentMethodId: payment.stripePaymentMethodId
          }
        : null
    },
    { status: 200 }
  );
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payment = await prisma.customerPayment.findUnique({
    where: { userId: session.user.id },
    select: {
      stripeCustomerId: true,
      stripePaymentMethodId: true
    }
  });

  if (!payment) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (payment.stripeCustomerId && payment.stripePaymentMethodId) {
    const stripe = getStripe();
    try {
      await stripe.customers.update(payment.stripeCustomerId, {
        invoice_settings: { default_payment_method: "" as unknown as string }
      });
    } catch {}

    try {
      await stripe.paymentMethods.detach(payment.stripePaymentMethodId);
    } catch {}
  }

  await prisma.customerPayment.update({
    where: { userId: session.user.id },
    data: {
      method: null,
      brand: null,
      last4: null,
      stripePaymentMethodId: null,
      stripeSetupIntentId: null
    }
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
