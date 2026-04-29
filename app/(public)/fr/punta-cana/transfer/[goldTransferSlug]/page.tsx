import type { Metadata } from "next";
import {
  buildGoldenTransferPageMetadata,
  renderGoldenTransferPage
} from "@/components/public/GoldenTransferPageRoute";
import { fr } from "@/lib/translations";

type Props = {
  params: Promise<{ goldTransferSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { goldTransferSlug } = await params;
  return buildGoldenTransferPageMetadata(goldTransferSlug, fr);
}

export default async function FrenchGoldenTransferPage({ params }: Props) {
  const { goldTransferSlug } = await params;
  return renderGoldenTransferPage(goldTransferSlug, fr);
}
