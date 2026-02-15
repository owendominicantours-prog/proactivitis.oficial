import type { Metadata } from "next";
import { en } from "@/lib/translations";
import { buildThingsToDoMetadata, ThingsToDoHotelPage } from "@/components/public/ThingsToDoHotelPage";

type Props = {
  params: Promise<{ hotelSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hotelSlug } = await params;
  return buildThingsToDoMetadata(hotelSlug, en, "hoteles");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EnglishHotelsPage({ params }: Props) {
  const { hotelSlug } = await params;
  return ThingsToDoHotelPage({ hotelSlug, locale: en, routeBase: "hoteles" });
}
