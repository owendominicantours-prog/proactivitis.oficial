import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { translateTourById } from "@/lib/translationWorker";
import { infoPages } from "@/lib/infoPages";
import { translateInfoPage } from "@/lib/infoTranslationService";

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
    select: { id: true, slug: true }
  });

  for (const tour of tours) {
    try {
      await translateTourById(tour.id);
      if (tour.slug) {
        await revalidatePath(`/en/tours/${tour.slug}`);
        await revalidatePath(`/fr/tours/${tour.slug}`);
      }
    } catch (error) {
      console.error("auto translate failed for", tour.id, error);
    }
  }

  for (const page of infoPages) {
    try {
      await translateInfoPage(page.key, "en");
      await translateInfoPage(page.key, "fr");
      await revalidatePath(`/en${page.path}`);
      await revalidatePath(`/fr${page.path}`);
    } catch (error) {
      console.error("auto translate failed for info page", page.key, error);
    }
  }

  return NextResponse.json({ message: "translation run completed" });
}
