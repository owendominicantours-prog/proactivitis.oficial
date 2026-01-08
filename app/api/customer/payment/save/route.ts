import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { setupIntentId?: string };
  const setupIntentId = body.setupIntentId?.trim();
  if (!setupIntentId) {
    return NextResponse.json({ error: "Falta el setup intent" }, { status: 400 });
  }

  const paymentRecord = await prisma.customerPayment.findUnique({
    where: { userId: session.user.id }
  });

  const stripe = getStripe();
  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
  if (setupIntent.status !== "succeeded") {
    return NextResponse.json({ error: "El metodo aun no esta confirmado" }, { status: 400 });
  }

  const paymentMethodId = typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : null;
  if (!paymentMethodId) {
    return NextResponse.json({ error: "Metodo no encontrado" }, { status: 400 });
  }

  const customerId = typeof setupIntent.customer === "string" ? setupIntent.customer : paymentRecord?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
  }

  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  const card = paymentMethod.card;

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId }
  });

  const updated = await prisma.customerPayment.upsert({
    where: { userId: session.user.id },
    update: {
      method: paymentMethod.type ?? "card",
      brand: card?.brand ?? null,
      last4: card?.last4 ?? null,
      stripeCustomerId: customerId,
      stripePaymentMethodId: paymentMethodId,
      stripeSetupIntentId: setupIntentId
    },
    create: {
      userId: session.user.id,
      method: paymentMethod.type ?? "card",
      brand: card?.brand ?? null,
      last4: card?.last4 ?? null,
      stripeCustomerId: customerId,
      stripePaymentMethodId: paymentMethodId,
      stripeSetupIntentId: setupIntentId
    }
  });

  return NextResponse.json({
    payment: {
      method: updated.method,
      brand: updated.brand,
      last4: updated.last4,
      updatedAt: updated.updatedAt
    }
  });
}
