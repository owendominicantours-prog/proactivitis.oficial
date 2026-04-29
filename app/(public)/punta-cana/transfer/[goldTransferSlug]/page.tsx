import type { Metadata } from "next";
import {
  buildGoldenTransferPageMetadata,
  renderGoldenTransferPage
} from "@/components/public/GoldenTransferPageRoute";
import { es } from "@/lib/translations";

type Props = {
  params: Promise<{ goldTransferSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { goldTransferSlug } = await params;
  return buildGoldenTransferPageMetadata(goldTransferSlug, es);
}

export default async function SpanishGoldenTransferPage({ params }: Props) {
  const { goldTransferSlug } = await params;
  return renderGoldenTransferPage(goldTransferSlug, es);
}
