import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } }
        ]
      }
    : undefined;

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
