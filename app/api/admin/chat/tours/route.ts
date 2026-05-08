import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupportDeskContext } from "@/lib/supportDesk";
import { buildWorkplaceTourWhere } from "@/lib/workplaceTours";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  const and: Prisma.TourWhereInput[] = [];

  if (session.user.role !== "ADMIN") {
    const supportContext = await getSupportDeskContext();
    if (!supportContext) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    and.push(
      buildWorkplaceTourWhere({
        ...supportContext.scope,
        niches: supportContext.scope.niches.length ? supportContext.scope.niches : ["tours"],
        modules: supportContext.scope.modules.length ? supportContext.scope.modules : ["tours"]
      })
    );
  }

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { slug: { contains: q, mode: Prisma.QueryMode.insensitive } }
      ]
    });
  }
  const where = and.length ? { AND: and } satisfies Prisma.TourWhereInput : undefined;

  const tours = await prisma.tour.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      duration: true,
      heroImage: true,
      gallery: true
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 12
  });

  return NextResponse.json({
    tours: tours.map((tour) => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      price: Math.round(tour.price),
      duration: tour.duration,
      image: tour.heroImage || (tour.gallery ? String(tour.gallery).split(",")[0]?.trim() : null) || null,
      url: `https://proactivitis.com/tours/${tour.slug}`
    }))
  });
}
