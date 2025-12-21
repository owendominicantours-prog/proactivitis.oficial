"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const appOrigin =
  process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function POST(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: user.id }
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
      email: user.email ?? undefined,
      business_type: "company",
      company: {
        name: supplier.company || user.name || "Proactivitis Supplier"
      }
    });
    accountId = account.id;
    await prisma.supplierProfile.update({
      where: { id: supplier.id },
      data: {
        stripeAccountId: accountId
      }
    });
  }

  await stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          interval: "weekly",
          weekly_anchor: "saturday"
        }
      }
    }
  });

  const returnUrl = `${appOrigin}/supplier/finance`;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: returnUrl,
    return_url: returnUrl,
    type: "account_onboarding"
  });

  return NextResponse.json({
    url: accountLink.url ?? returnUrl,
    accountId
  });
}
