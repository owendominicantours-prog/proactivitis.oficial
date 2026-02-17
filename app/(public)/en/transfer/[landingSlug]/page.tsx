import type { Metadata } from "next";
import { en } from "@/lib/translations";
import { buildTransferMetadata, TransferLandingPage } from "@/components/public/TransferLandingPage";

export async function generateMetadata({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}): Promise<Metadata> {
  const { landingSlug } = await params;
  return buildTransferMetadata(landingSlug, en);
}

export const revalidate = 3600;

export default async function EnglishTransferLandingPage({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  return TransferLandingPage({ landingSlug, locale: en });
}
