import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { TourTranslationStatus } from "@prisma/client";

type LocaleConfig = { code: string; target: string };

const LOCALES: LocaleConfig[] = [
  { code: "en", target: "en" },
  { code: "fr", target: "fr" }
];

const TRANSLATION_URL = process.env.TRANSLATION_API_URL;

function hashSource(payload: { title: string; subtitle?: string | null; shortDescription?: string | null; description: string }) {
  const normalized = [payload.title, payload.subtitle ?? "", payload.shortDescription ?? "", payload.description].join("||");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

async function translateText(text: string, target: string) {
  if (!text) return text;

  if (TRANSLATION_URL) {
    const response = await fetch(TRANSLATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "es",
        target
      })
    });
    if (!response.ok) {
      throw new Error(`translation failed: ${response.statusText}`);
    }
    const json = await response.json();
    return json.translatedText as string;
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: "es",
    tl: target,
    dt: "t",
    q: text
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`translation failed: ${response.statusText}`);
  }
  const body = await response.text();
  const json = JSON.parse(body);
  const segments = json[0];
  return segments.map((segment: unknown[]) => segment[0]).join("");
}

async function upsertTranslationEntry(
  tourId: string,
  locale: string,
  hash: string,
  translation: { title?: string; subtitle?: string; shortDescription?: string; description?: string }
) {
  await prisma.tourTranslation.upsert({
    where: {
      tourId_locale: {
        tourId,
        locale
      }
    },
    create: {
      tourId,
      locale,
      title: translation.title,
      subtitle: translation.subtitle,
      shortDescription: translation.shortDescription,
      description: translation.description,
      status: TourTranslationStatus.TRANSLATED,
      sourceHash: hash
    },
    update: {
      title: translation.title,
      subtitle: translation.subtitle,
      shortDescription: translation.shortDescription,
      description: translation.description,
      status: TourTranslationStatus.TRANSLATED,
      sourceHash: hash
    }
  });
}

export async function translateTourById(tourId: string) {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { translations: true }
  });
  if (!tour) {
    throw new Error("Tour not found");
  }

  const sourceHash = hashSource(tour);
  for (const locale of LOCALES) {
    const existing = tour.translations.find((translation) => translation.locale === locale.code);
    if (existing?.sourceHash === sourceHash && existing.status === TourTranslationStatus.TRANSLATED) {
      continue;
    }

    const [title, subtitle, shortDescription, description] = await Promise.all([
      translateText(tour.title, locale.target),
      translateText(tour.subtitle ?? "", locale.target),
      translateText(tour.shortDescription ?? "", locale.target),
      translateText(tour.description, locale.target)
    ]);

    await upsertTranslationEntry(tourId, locale.code, sourceHash, {
      title,
      subtitle,
      shortDescription,
      description
    });
  }

  await prisma.tour.update({
    where: { id: tourId },
    data: { translationHash: sourceHash }
  });
}
