import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InfoRenderer } from "@/components/public/InfoRenderer";
import { resolveInfoPageContent } from "@/lib/infoTranslationService";
import { findInfoPage, parseInfoSlug } from "@/lib/infoRoutes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const { locale, normalizedSegments } = parseInfoSlug(slugSegments);
  const page = findInfoPage(normalizedSegments);
  if (!page) return {};
  return {
    title: trimSeoTitle(page.seoTitle ?? page.title),
    description: page.seoDescription
  };
}

export default async function InfoPage({ params }: Props) {
  const resolved = await params;
  const slugSegments = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const { locale, normalizedSegments } = parseInfoSlug(slugSegments);
  const page = findInfoPage(normalizedSegments);
  if (!page) {
    notFound();
  }
  const resolvedPage = (await resolveInfoPageContent(page.key, locale)) ?? page;

  return (
    <div className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <InfoRenderer page={resolvedPage} />
      </div>
    </div>
  );
}
