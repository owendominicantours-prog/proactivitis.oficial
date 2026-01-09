import type { Metadata } from "next";
import { buildTourPickupMetadata, TourHotelLanding } from "@/app/tours/[slug]/recogida/[locationSlug]/page";

type Props = {
  params: Promise<{ slug: string; locationSlug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locationSlug } = await params;
  return buildTourPickupMetadata(slug, locationSlug, "fr");
}

export default async function TourPickupLandingFr(props: Props) {
  return TourHotelLanding({ ...props, locale: "fr" });
}
