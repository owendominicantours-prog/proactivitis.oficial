import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProDiscoveryPlannerPage from "@/components/public/ProDiscoveryPlannerPage";
import {
  buildProDiscoveryPlannerMetadata,
  isProDiscoveryPlannerSlug,
  titleFromPlannerSlug
} from "@/lib/prodiscoveryPlannerLanding";
import { en } from "@/lib/translations";

type Params = {
  plannerSlug: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { plannerSlug } = await params;
  return buildProDiscoveryPlannerMetadata(en, plannerSlug);
}

export default async function ProDiscoveryEnglishGroupPlannerLanding({ params }: { params: Promise<Params> }) {
  const { plannerSlug } = await params;
  if (!isProDiscoveryPlannerSlug(plannerSlug)) notFound();

  return <ProDiscoveryPlannerPage locale={en} initialCity={titleFromPlannerSlug(plannerSlug)} landingSlug={plannerSlug} />;
}
