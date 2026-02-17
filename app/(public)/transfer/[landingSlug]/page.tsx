import type { Metadata } from "next";
import { es } from "@/lib/translations";
import {
  buildTransferMetadata,
  generateTransferStaticParams,
  TransferLandingPage
} from "@/components/public/TransferLandingPage";

export async function generateStaticParams() {
  return generateTransferStaticParams();
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}): Promise<Metadata> {
  const { landingSlug } = await params;
  return buildTransferMetadata(landingSlug, es);
}

export const revalidate = 3600;

export default async function SpanishTransferLandingPage({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  return TransferLandingPage({ landingSlug, locale: es });
}
