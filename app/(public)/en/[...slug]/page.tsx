import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InfoRenderer } from "@/components/public/InfoRenderer";
import { resolveInfoPageContent } from "@/lib/infoTranslationService";
import { findInfoPage } from "@/lib/infoRoutes";
import { translateText } from "@/lib/translationService";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const LOCALE = "en";
const MAX_TITLE_LENGTH = 58;

const trimSeoTitle = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length <= MAX_TITLE_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_TITLE_LENGTH - 3).trimEnd()}...`;
};

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const slugSegments = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const page = findInfoPage(slugSegments);
  if (!page) return {};
  const baseTitle = page.seoTitle ?? page.title;
  const baseDescription = page.seoDescription ?? "";
  try {
    const [translatedTitle, translatedDescription] = await Promise.all([
      translateText(baseTitle, LOCALE),
      translateText(baseDescription, LOCALE)
    ]);
    return {
      title: trimSeoTitle(translatedTitle),
      description: translatedDescription
    };
  } catch {
    return {
      title: trimSeoTitle(baseTitle),
      description: baseDescription
    };
  }
}

export default async function InfoPageEnglish({ params }: Props) {
  const resolved = await params;
  const slugSegments = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const page = findInfoPage(slugSegments);
  if (!page) {
    notFound();
  }
  const resolvedPage = (await resolveInfoPageContent(page.key, LOCALE)) ?? page;

  return (
    <div className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <InfoRenderer page={resolvedPage} />
      </div>
    </div>
  );
}
