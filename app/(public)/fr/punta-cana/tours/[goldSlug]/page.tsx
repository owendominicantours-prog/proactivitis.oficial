import type { Metadata } from "next";
import {
  buildGoldenTourPageMetadata,
  renderGoldenTourPage
} from "@/components/public/GoldenTourPageRoute";
import { fr } from "@/lib/translations";

type Props = {
  params: Promise<{ goldSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { goldSlug } = await params;
  return buildGoldenTourPageMetadata(goldSlug, fr);
}

export default async function FrenchGoldenTourPage({ params }: Props) {
  const { goldSlug } = await params;
  return renderGoldenTourPage(goldSlug, fr);
}
