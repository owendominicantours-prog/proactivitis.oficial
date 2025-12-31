import type { Metadata } from "next";
import PublicTourDetailPage, { type TourDetailSearchParams } from "@/components/public/PublicTourDetailPage";
import { generateTourMetadata } from "@/lib/tourDetailUtils";
import { en } from "@/lib/translations";

type TourDetailPageProps = {
  params: Promise<{ slug?: string }>;
  searchParams?: Promise<TourDetailSearchParams>;
};

export async function generateMetadata({ params }: TourDetailPageProps): Promise<Metadata> {
  return generateTourMetadata({ params }, en);
}

export default function EnglishTourDetailPage({ params, searchParams }: TourDetailPageProps) {
  return <PublicTourDetailPage params={params} searchParams={searchParams} locale={en} />;
}
