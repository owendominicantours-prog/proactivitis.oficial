#!/usr/bin/env ts-node

/**
 * Worker script that translates tours automatically using libretranslate.
 * Run `TRANSLATION_API_URL=https://libretranslate.de/translate node scripts/translateTours.ts`
 * or hook it into a queue when a tour is created/updated.
 */

import { PrismaClient, TourTranslationStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const LOCALES: { code: string; target: string }[] = [
  { code: "en", target: "en" },
  { code: "fr", target: "fr" }
];

const TRANSLATION_URL = process.env.TRANSLATION_API_URL ?? "https://libretranslate.de/translate";

function hashSource(tour: { title: string; description: string; subtitle?: string | null; shortDescription?: string | null }) {
  const payload = [tour.title, tour.subtitle ?? "", tour.shortDescription ?? "", tour.description].join("||");
  return crypto.createHash("sha256").update(payload).digest("hex");
}

async function translateText(text: string, target: string) {
  if (!text) return text;

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

async function upsertTourTranslation(tourId: string, locale: string, hash: string, translation: { title?: string; subtitle?: string; shortDescription?: string; description?: string }) {
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

async function translateTour(tourId: string) {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { translations: true }
  });
  if (!tour) {
    console.warn("tour not found", tourId);
    return;
  }

  const sourceHash = hashSource(tour);

  for (const locale of LOCALES) {
    const existing = tour.translations.find((translation) => translation.locale === locale.code);
    if (existing?.sourceHash === sourceHash && existing.status === TourTranslationStatus.TRANSLATED) {
      console.log(`skipping ${tourId} ${locale.code} (hash up to date)`);
      continue;
    }

    console.log(`translating ${tourId} => ${locale.code}`);
    const [title, subtitle, shortDescription, description] = await Promise.all([
      translateText(tour.title, locale.target),
      translateText(tour.subtitle ?? "" , locale.target),
      translateText(tour.shortDescription ?? "", locale.target),
      translateText(tour.description, locale.target)
    ]);

    await upsertTourTranslation(tourId, locale.code, sourceHash, {
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

async function main() {
  const [tourId] = process.argv.slice(2);
  if (tourId) {
    await translateTour(tourId);
    return;
  }

  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    include: { translations: true }
  });

  for (const tour of tours) {
    await translateTour(tour.id);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
