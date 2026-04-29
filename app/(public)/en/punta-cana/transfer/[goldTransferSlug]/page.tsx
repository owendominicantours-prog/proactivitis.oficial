import type { Metadata } from "next";
import {
  buildGoldenTransferPageMetadata,
  renderGoldenTransferPage
} from "@/components/public/GoldenTransferPageRoute";
import { en } from "@/lib/translations";

type Props = {
  params: Promise<{ goldTransferSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { goldTransferSlug } = await params;
  return buildGoldenTransferPageMetadata(goldTransferSlug, en);
}

export default async function EnglishGoldenTransferPage({ params }: Props) {
  const { goldTransferSlug } = await params;
  return renderGoldenTransferPage(goldTransferSlug, en);
}
