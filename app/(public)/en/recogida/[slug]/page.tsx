import type { Metadata } from "next";
import { RecogidaPage, buildRecogidaMetadata } from "@/app/(public)/recogida/[slug]/page";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildRecogidaMetadata(slug, "en");
}

export default async function RecogidaPageEn(props: Props) {
  return RecogidaPage({ ...props, locale: "en" });
}
