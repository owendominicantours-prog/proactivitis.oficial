import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const offers = await prisma.offer.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
      description: true,
      discountType: true,
      discountValue: true,
      active: true,
      OfferTours: {
        select: {
          Tour: {
            select: {
              id: true,
              slug: true,
              title: true,
              price: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({ offers });
}

