import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateTourById } from "@/lib/translationWorker";

const EXPECTED_TOKEN = process.env.TRANSLATION_CRON_TOKEN;

async function authorize(req: NextRequest) {
  if (!EXPECTED_TOKEN) {
    return false;
  }

  const token = req.headers.get("x-translation-token");
  return token === EXPECTED_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    select: { id: true }
  });

  for (const tour of tours) {
    try {
      await translateTourById(tour.id);
    } catch (error) {
      console.error("auto translate failed for", tour.id, error);
    }
  }

  return NextResponse.json({ message: "translation run completed" });
}
