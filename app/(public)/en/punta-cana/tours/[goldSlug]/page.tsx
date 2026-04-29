import type { Metadata } from "next";
import {
  buildGoldenTourPageMetadata,
  renderGoldenTourPage
} from "@/components/public/GoldenTourPageRoute";
import { en } from "@/lib/translations";

type Props = {
  params: Promise<{ goldSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { goldSlug } = await params;
  return buildGoldenTourPageMetadata(goldSlug, en);
}

export default async function EnglishGoldenTourPage({ params }: Props) {
  const { goldSlug } = await params;
  return renderGoldenTourPage(goldSlug, en);
}
