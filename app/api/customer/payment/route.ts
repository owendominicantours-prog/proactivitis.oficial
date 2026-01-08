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
    select: { method: true, brand: true, last4: true, updatedAt: true }
  });

  return NextResponse.json({ payment }, { status: 200 });
}
