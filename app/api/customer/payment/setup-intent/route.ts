import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true }
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
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
      metadata: { userId: user.id }
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

  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
