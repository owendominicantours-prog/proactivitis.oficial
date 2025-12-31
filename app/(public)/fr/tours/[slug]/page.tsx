import type { Metadata } from "next";
import PublicTourDetailPage, { type TourDetailSearchParams } from "@/components/public/PublicTourDetailPage";
import { generateTourMetadata } from "@/lib/tourDetailUtils";
import { fr } from "@/lib/translations";

type TourDetailPageProps = {
  params: Promise<{ slug?: string }>;
  searchParams?: Promise<TourDetailSearchParams>;
};

export async function generateMetadata({ params }: TourDetailPageProps): Promise<Metadata> {
  return generateTourMetadata({ params }, fr);
}

export default function FrenchTourDetailPage({ params, searchParams }: TourDetailPageProps) {
  return <PublicTourDetailPage params={params} searchParams={searchParams} locale={fr} />;
}
