import type { Metadata } from "next";
import SosuaPartyBoatVariantLanding, {
  buildSosuaPartyBoatVariantMetadata
} from "@/components/public/SosuaPartyBoatVariantLanding";
import { SOSUA_PARTY_BOAT_VARIANTS } from "@/data/sosua-party-boat-variants";
import { en } from "@/lib/translations";

export async function generateStaticParams() {
  return SOSUA_PARTY_BOAT_VARIANTS.map((variant) => ({ variantSlug: variant.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ variantSlug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const variant = SOSUA_PARTY_BOAT_VARIANTS.find((item) => item.slug === resolved.variantSlug);
  if (!variant) {
    return { title: "Landing no encontrada" };
  }
  return buildSosuaPartyBoatVariantMetadata(en, variant);
}

export default async function SosuaPartyBoatVariantPage({
  params
}: {
  params: Promise<{ variantSlug: string }>;
}) {
  const resolved = await params;
  return <SosuaPartyBoatVariantLanding locale={en} variantSlug={resolved.variantSlug} />;
}
