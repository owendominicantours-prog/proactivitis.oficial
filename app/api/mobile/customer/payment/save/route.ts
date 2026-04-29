import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { readMobileUserId, withMobileCors } from "@/lib/mobileAuth";

export function OPTIONS() {
  return withMobileCors(new NextResponse(null, { status: 204 }), "POST, OPTIONS");
}

export async function POST(request: Request) {
  try {
    const userId = readMobileUserId(request);
    if (!userId) {
      return withMobileCors(NextResponse.json({ error: "Sesion requerida." }, { status: 401 }), "POST, OPTIONS");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, accountStatus: true }
    });
    if (!user || user.accountStatus === "DELETED") {
      return withMobileCors(NextResponse.json({ error: "Sesion expirada." }, { status: 401 }), "POST, OPTIONS");
    }

    const body = (await request.json().catch(() => ({}))) as { setupIntentId?: string };
    const setupIntentId = body.setupIntentId?.trim();
    if (!setupIntentId) {
      return withMobileCors(NextResponse.json({ error: "Falta el setup intent." }, { status: 400 }), "POST, OPTIONS");
    }

    const paymentRecord = await prisma.customerPayment.findUnique({
      where: { userId: user.id }
    });
    if (!paymentRecord?.stripeCustomerId) {
      return withMobileCors(NextResponse.json({ error: "Cliente Stripe no encontrado." }, { status: 400 }), "POST, OPTIONS");
    }

    const stripe = getStripe();
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    if (setupIntent.status !== "succeeded") {
      return withMobileCors(NextResponse.json({ error: "La tarjeta aun no fue confirmada." }, { status: 400 }), "POST, OPTIONS");
    }

    const customerId = typeof setupIntent.customer === "string" ? setupIntent.customer : null;
    if (customerId !== paymentRecord.stripeCustomerId) {
      return withMobileCors(NextResponse.json({ error: "La tarjeta no pertenece a esta cuenta." }, { status: 403 }), "POST, OPTIONS");
    }

    const paymentMethodId = typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : null;
    if (!paymentMethodId) {
      return withMobileCors(NextResponse.json({ error: "Metodo no encontrado." }, { status: 400 }), "POST, OPTIONS");
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const card = paymentMethod.card;

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    const updated = await prisma.customerPayment.update({
      where: { userId: user.id },
      data: {
        method: paymentMethod.type ?? "card",
        brand: card?.brand ?? null,
        last4: card?.last4 ?? null,
        stripePaymentMethodId: paymentMethodId,
        stripeSetupIntentId: setupIntentId
      }
    });

    return withMobileCors(
      NextResponse.json({
        payment: {
          method: updated.method,
          brand: updated.brand,
          last4: updated.last4,
          hasStripeCustomer: Boolean(updated.stripeCustomerId),
          hasSavedMethod: Boolean(updated.stripePaymentMethodId || updated.last4),
          updatedAt: updated.updatedAt
        }
      }),
      "POST, OPTIONS"
    );
  } catch {
    return withMobileCors(NextResponse.json({ error: "No se pudo guardar la tarjeta." }, { status: 500 }), "POST, OPTIONS");
  }
}
