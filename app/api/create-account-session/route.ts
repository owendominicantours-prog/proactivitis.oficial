"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: user.id }
  });
  if (!supplier || !supplier.stripeAccountId) {
    return NextResponse.json(
      { error: "Para ver tus payouts debes primero configurar tu cuenta de Stripe" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const accountId = supplier.stripeAccountId;

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
