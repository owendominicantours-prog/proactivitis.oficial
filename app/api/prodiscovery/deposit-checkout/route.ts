import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ??
  "https://proactivitis.com";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    const loginUrl = new URL("/auth/login", APP_BASE_URL);
    loginUrl.searchParams.set("callbackUrl", "/dashboard/customer");
    return NextResponse.redirect(loginUrl);
  }

  const opportunityId = request.nextUrl.searchParams.get("opportunityId") ?? "";
  if (!opportunityId) {
    return NextResponse.json({ error: "Falta la oportunidad ProDiscovery." }, { status: 400 });
  }

  const opportunity = await prisma.proDiscoveryGroupOpportunity.findFirst({
    where: {
      id: opportunityId,
      contactEmail: email
    },
    select: {
      id: true,
      requestCode: true,
      city: true,
      groupSize: true,
      contactEmail: true,
      acceptedBudget: true,
      depositAmount: true,
      depositPercent: true
    }
  });

  if (!opportunity) {
    return NextResponse.json({ error: "No encontramos esta propuesta en tu cuenta." }, { status: 404 });
  }

  const deposit =
    opportunity.depositAmount ??
    (opportunity.acceptedBudget ? opportunity.acceptedBudget * (opportunity.depositPercent / 100) : null);

  if (!deposit || deposit <= 0) {
    return NextResponse.json({ error: "La propuesta aun no tiene deposito disponible." }, { status: 400 });
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: opportunity.contactEmail,
    line_items: [
      {
        price_data: {
          currency: process.env.STRIPE_CURRENCY ?? "usd",
          product_data: {
            name: `Deposito ProDiscovery ${opportunity.requestCode}`,
            description: `${opportunity.city} - ${opportunity.groupSize} personas`
          },
          unit_amount: Math.round(deposit * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${APP_BASE_URL}/dashboard/customer?prodiscoveryPaid=${encodeURIComponent(opportunity.requestCode)}`,
    cancel_url: `${APP_BASE_URL}/dashboard/customer?prodiscoveryCancel=${encodeURIComponent(opportunity.requestCode)}`,
    metadata: {
      type: "PRODISCOVERY_DEPOSIT",
      opportunityId: opportunity.id,
      requestCode: opportunity.requestCode
    }
  });

  await prisma.proDiscoveryGroupOpportunity.update({
    where: { id: opportunity.id },
    data: { status: "PAYMENT_STARTED" }
  });

  return NextResponse.redirect(checkout.url ?? `${APP_BASE_URL}/dashboard/customer`);
}
