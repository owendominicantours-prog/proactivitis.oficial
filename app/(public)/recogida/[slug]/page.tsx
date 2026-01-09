import type { Metadata } from "next";
import { buildRecogidaMetadata, RecogidaPage } from "@/components/public/RecogidaPage";

type RecogidaPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildRecogidaMetadata(slug, "es");
}

export default async function RecogidaRoute(props: RecogidaPageProps) {
  return RecogidaPage({ ...props, locale: "es" });
}
