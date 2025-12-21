"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId }
  });

  if (!supplier) {
    return NextResponse.json({ error: "Perfil de proveedor no encontrado" }, { status: 404 });
  }

  const stripe = getStripe();
  const defaultCountry = process.env.STRIPE_ACCOUNT_DEFAULT_COUNTRY ?? "US";
  let accountId = supplier.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: defaultCountry,
      email: session.user?.email ?? undefined,
      business_type: "company",
      company: {
        name: supplier.company
      }
    });
    accountId = account.id;
    await prisma.supplierProfile.update({
      where: { id: supplier.id },
      data: { stripeAccountId: accountId }
    });
  }

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const accountSession = await stripe.accountSessions.create({
    account: accountId,
    type: "payouts",
    return_url: `${baseUrl}/supplier/finance`
  });

  return NextResponse.json({
    accountId,
    accountSessionId: accountSession.id,
    accountSessionSecret: accountSession.client_secret
  });
}
