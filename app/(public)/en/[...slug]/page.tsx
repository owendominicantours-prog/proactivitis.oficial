import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InfoRenderer } from "@/components/public/InfoRenderer";
import { findInfoPage } from "@/lib/infoRoutes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const slugSegments = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const page = findInfoPage(slugSegments);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription
  };
}

export default async function InfoPageEnglish({ params }: Props) {
  const resolved = await params;
  const slugSegments = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const page = findInfoPage(slugSegments);
  if (!page) {
    notFound();
  }

  return (
    <div className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <InfoRenderer page={page} />
      </div>
    </div>
  );
}
