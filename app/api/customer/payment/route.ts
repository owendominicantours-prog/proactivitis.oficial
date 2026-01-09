import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
