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
  return buildRecogidaPickupMetadata(slug, "fr");
}

export default async function RecogidaPickupRouteFr(props: RecogidaPickupPageProps) {
  return RecogidaPage({ ...props, locale: "fr" });
}
