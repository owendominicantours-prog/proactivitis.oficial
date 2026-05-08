import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProDiscoveryPlannerPage from "@/components/public/ProDiscoveryPlannerPage";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { es } from "@/lib/translations";

type Params = {
  plannerSlug: string;
};

const PREFIX = "planificador-grupos-";

const titleFromSlug = (slug: string) =>
  slug
    .slice(PREFIX.length)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const isPlannerSlug = (slug: string) => slug.startsWith(PREFIX) && slug.length > PREFIX.length;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { plannerSlug } = await params;
  if (!isPlannerSlug(plannerSlug)) return {};
  const city = titleFromSlug(plannerSlug);
  const canonical = `${PROACTIVITIS_URL}/prodiscovery/${plannerSlug}`;

  return {
    title: `Planificador de grupos en ${city} | ProDiscovery`,
    description: `Solicita itinerarios privados, guia lider y logistica de grupo en ${city} con ProDiscovery.`,
    alternates: { canonical },
    openGraph: {
      title: `Planificador de grupos en ${city} | ProDiscovery`,
      description: `Custom itinerary builder, private guide and group travel logistics in ${city}.`,
      url: canonical,
      type: "website"
    },
    robots: { index: true, follow: true }
  };
}

export default async function ProDiscoveryGroupPlannerLanding({ params }: { params: Promise<Params> }) {
  const { plannerSlug } = await params;
  if (!isPlannerSlug(plannerSlug)) notFound();

  return <ProDiscoveryPlannerPage locale={es} initialCity={titleFromSlug(plannerSlug)} landingSlug={plannerSlug} />;
}
