import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import { buildTransferMetadata, TransferLandingPage } from "@/components/public/TransferLandingPage";

export async function generateMetadata({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}): Promise<Metadata> {
  const { landingSlug } = await params;
  return buildTransferMetadata(landingSlug, fr);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FrenchTransferLandingPage({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  return TransferLandingPage({ landingSlug, locale: fr });
}
