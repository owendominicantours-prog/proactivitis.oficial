import type { Metadata } from "next";
import RentCarDetailPage from "@/components/rentals/RentCarDetailPage";
import {
  buildRentCarDescription,
  buildRentCarH1,
  getRentCarOption,
  getRentCarOptionPath
} from "@/data/rentCarFleet";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ locationId: string; categorySlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locationId, categorySlug } = await params;
  const settings = await getRentCarFleetSettings();
  const option = getRentCarOption(locationId, categorySlug, settings);
  if (!option) return {};
  const title = `${buildRentCarH1(option, "en")} | Proactivitis`;
  const description = buildRentCarDescription(option, "en");
  const path = getRentCarOptionPath(option.locationId, option.categorySlug, "en");
  return {
    title,
    description,
    alternates: { canonical: `https://proactivitis.com${path}` },
    openGraph: {
      title,
      description,
      url: `https://proactivitis.com${path}`,
      siteName: "Proactivitis",
      type: "website",
      images: [{ url: `https://proactivitis.com${option.image}` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://proactivitis.com${option.image}`]
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { locationId, categorySlug } = await params;
  const settings = await getRentCarFleetSettings();
  return <RentCarDetailPage locationId={locationId} categorySlug={categorySlug} locale="en" settings={settings} />;
}
