import type { Metadata } from "next";
import { RecogidaPage, buildRecogidaMetadata } from "@/app/(public)/recogida/[slug]/page";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildRecogidaMetadata(slug, "fr");
}

export default async function RecogidaPageFr(props: Props) {
  return RecogidaPage({ ...props, locale: "fr" });
}
