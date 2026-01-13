import type { Metadata } from "next";
import { buildRecogidaPickupMetadata, RecogidaPage } from "@/components/public/RecogidaPage";

type RecogidaPickupPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildRecogidaPickupMetadata(slug, "en");
}

export default async function RecogidaPickupRouteEn(props: RecogidaPickupPageProps) {
  return RecogidaPage({ ...props, locale: "en" });
}
