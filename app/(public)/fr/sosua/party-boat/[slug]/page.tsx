import type { Metadata } from "next";
import SosuaPartyBoatAliasPage, {
  buildSosuaPartyBoatAliasMetadata
} from "@/components/public/SosuaPartyBoatAliasPage";
import type { TourDetailSearchParams } from "@/components/public/PublicTourDetailPage";
import { fr } from "@/lib/translations";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<TourDetailSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildSosuaPartyBoatAliasMetadata(slug, fr);
}

export default async function FrenchSosuaPartyBoatAliasRoute({ params, searchParams }: Props) {
  const { slug } = await params;
  return <SosuaPartyBoatAliasPage slug={slug} locale={fr} searchParams={searchParams} />;
}
