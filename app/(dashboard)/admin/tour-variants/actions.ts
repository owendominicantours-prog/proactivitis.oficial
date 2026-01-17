"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { findStaticVariant } from "@/lib/tourVariantCatalog";

const splitLines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const parseFaqLines = (value: FormDataEntryValue | null) =>
  splitLines(value).map((line) => {
    const [q, a] = line.split("|").map((part) => part.trim());
    return { q: q ?? "", a: a ?? "" };
  }).filter((faq) => faq.q && faq.a);

export async function saveTourVariant(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const tourSlug = String(formData.get("tourSlug") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT").trim();

  const titles = {
    es: String(formData.get("titles_es") ?? "").trim(),
    en: String(formData.get("titles_en") ?? "").trim(),
    fr: String(formData.get("titles_fr") ?? "").trim()
  };
  const heroSubtitles = {
    es: String(formData.get("heroSubtitles_es") ?? "").trim(),
    en: String(formData.get("heroSubtitles_en") ?? "").trim(),
    fr: String(formData.get("heroSubtitles_fr") ?? "").trim()
  };
  const metaDescriptions = {
    es: String(formData.get("metaDescriptions_es") ?? "").trim(),
    en: String(formData.get("metaDescriptions_en") ?? "").trim(),
    fr: String(formData.get("metaDescriptions_fr") ?? "").trim()
  };
  const bodyBlocks = {
    es: splitLines(formData.get("bodyBlocks_es")),
    en: splitLines(formData.get("bodyBlocks_en")),
    fr: splitLines(formData.get("bodyBlocks_fr"))
  };
  const ctas = {
    es: splitLines(formData.get("ctas_es")),
    en: splitLines(formData.get("ctas_en")),
    fr: splitLines(formData.get("ctas_fr"))
  };
  const faqs = {
    es: parseFaqLines(formData.get("faqs_es")),
    en: parseFaqLines(formData.get("faqs_en")),
    fr: parseFaqLines(formData.get("faqs_fr"))
  };

  const payload = {
    slug,
    type,
    tourSlug,
    status,
    titles,
    heroSubtitles,
    metaDescriptions,
    bodyBlocks,
    faqs,
    ctas
  };

  if (id) {
    await prisma.tourVariant.update({
      where: { id },
      data: payload
    });
  } else {
    await prisma.tourVariant.create({ data: payload });
  }

  revalidatePath("/thingtodo/tours");
  revalidatePath("/sitemap-tour-variants.xml");
  revalidatePath("/admin/tour-variants");
}

export async function importStaticVariant(slug: string) {
  const entry = findStaticVariant(slug);
  if (!entry) return;
  const existing = await prisma.tourVariant.findUnique({ where: { slug } });
  if (existing) return;

  await prisma.tourVariant.create({
    data: {
      slug: entry.slug,
      type: entry.type,
      tourSlug: entry.tourSlug,
      status: "DRAFT",
      titles: entry.titles,
      heroSubtitles: entry.heroSubtitles,
      metaDescriptions: entry.metaDescriptions,
      bodyBlocks: entry.bodyBlocks,
      faqs: entry.faqs,
      ctas: entry.ctas
    }
  });

  revalidatePath("/admin/tour-variants");
  revalidatePath("/sitemap-tour-variants.xml");
}

export async function deleteTourVariant(id: string) {
  await prisma.tourVariant.delete({ where: { id } });
  revalidatePath("/admin/tour-variants");
  revalidatePath("/sitemap-tour-variants.xml");
}
