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
      select: { id: true, name: true, email: true, accountStatus: true }
    });
    if (!user || user.accountStatus === "DELETED") {
      return withMobileCors(NextResponse.json({ error: "Sesion expirada." }, { status: 401 }), "POST, OPTIONS");
    }

    const stripe = getStripe();
    const payment = await prisma.customerPayment.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });

    let stripeCustomerId = payment.stripeCustomerId ?? null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id, source: "mobile-app" }
      });
      stripeCustomerId = customer.id;
      await prisma.customerPayment.update({
        where: { userId: user.id },
        data: { stripeCustomerId }
      });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      usage: "off_session"
    });

    await prisma.customerPayment.update({
      where: { userId: user.id },
      data: { stripeSetupIntentId: setupIntent.id }
    });

    return withMobileCors(NextResponse.json({ clientSecret: setupIntent.client_secret }), "POST, OPTIONS");
  } catch {
    return withMobileCors(NextResponse.json({ error: "No se pudo preparar Stripe." }, { status: 500 }), "POST, OPTIONS");
  }
}
