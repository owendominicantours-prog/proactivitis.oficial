"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

type Body = {
  accountId?: string | null;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const userId = user.id;

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId }
  });
  if (!supplier) {
    return NextResponse.json({ error: "Perfil de proveedor no encontrado" }, { status: 404 });
  }

  const stripe = getStripe();
  const defaultCountry = process.env.STRIPE_ACCOUNT_DEFAULT_COUNTRY ?? "US";
  let accountId = body.accountId ?? supplier.stripeAccountId;
  if (accountId && supplier.stripeAccountId && accountId !== supplier.stripeAccountId) {
    return NextResponse.json({ error: "AccountId inválido" }, { status: 403 });
  }

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: defaultCountry,
      email: user.email ?? undefined,
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

  await stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          interval: "weekly",
          weekly_anchor: "saturday"
        },
        delay_days: 7
      }
    }
  });

  const accountSession = await stripe.accountSessions.create({
    account: accountId,
    components: {
      payouts: {
        enabled: true
      },
      account_onboarding: {
        enabled: true
      }
    }
  });

  return NextResponse.json({
    accountId,
    accountSessionSecret: accountSession.client_secret
  });
}
