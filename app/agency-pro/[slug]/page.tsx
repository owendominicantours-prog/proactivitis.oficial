import { notFound } from "next/navigation";
import PublicTourDetailPage from "@/components/public/PublicTourDetailPage";
import { findAgencyProLinkBySlug } from "@/lib/agencyPro";
import { es } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function AgencyProLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const link = await findAgencyProLinkBySlug(resolvedParams.slug);
  if (!link || !link.active) {
    notFound();
  }

  return (
    <PublicTourDetailPage
      params={Promise.resolve({ slug: link.Tour.slug })}
      searchParams={Promise.resolve({ agencyLink: link.slug })}
      locale={es}
    />
  );
}
