import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import FeaturedToursSection from "@/components/public/FeaturedToursSection";
import StructuredData from "@/components/schema/StructuredData";
import { es, translate } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";

const buildTransferSlug = (hotelSlug: string) =>
  `punta-cana-international-airport-puj-to-${hotelSlug}`;

type Props = {
  params: Promise<{ hotelSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hotelSlug } = await params;
  const hotel = await prisma.transferLocation.findFirst({
    where: { slug: hotelSlug, type: "HOTEL" },
    select: { name: true }
  });
  if (!hotel) return {};
  const title = `Que hacer en ${hotel.name} | Tours y traslados Proactivitis`;
  const description = `Proactivitis recomienda ${hotel.name} y experiencias cercanas. Reserva tours y traslados con confirmacion inmediata.`;
  const canonical = `${BASE_URL}/things-to-do/${hotelSlug}`;
  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical
    }
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ThingsToDoHotelPage({ params }: Props) {
  const { hotelSlug } = await params;
  const locale = es;
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);

  const hotel = await prisma.transferLocation.findFirst({
    where: { slug: hotelSlug, type: "HOTEL" },
    select: { name: true, slug: true }
  });
  if (!hotel) return notFound();

  const transferSlug = buildTransferSlug(hotel.slug);
  const allTransferLandings = allLandings();
  const primaryTransfer =
    allTransferLandings.find((landing) => landing.hotelSlug === hotel.slug) ?? {
      landingSlug: transferSlug,
      hotelName: hotel.name,
      heroSubtitle: t("thingsToDo.transfers.fallback"),
      heroImage: "/transfer/mini van.png",
      heroImageAlt: `Transfer a ${hotel.name}`
    };
  const secondaryTransfers = allTransferLandings
    .filter((landing) => landing.hotelSlug !== hotel.slug)
    .slice(0, 2);
  const transferCards = [primaryTransfer, ...secondaryTransfers];

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: hotel.name,
    description: t("thingsToDo.schema.description", { hotel: hotel.name }),
    url: `${BASE_URL}/things-to-do/${hotel.slug}`,
    provider: {
      "@type": "Organization",
      name: "Proactivitis",
      url: BASE_URL
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
      <StructuredData data={schema} />
      <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
          {t("thingsToDo.title", { hotel: hotel.name })}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          {t("thingsToDo.subtitle", { hotel: hotel.name })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tours"
            className="rounded-2xl bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            {t("thingsToDo.cta.tours")}
          </Link>
          <Link
            href={`/transfer/${transferSlug}`}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
          >
            {t("thingsToDo.cta.transfers")}
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.tours.eyebrow")}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{t("thingsToDo.tours.title")}</h2>
        </div>
        <FeaturedToursSection locale={locale} />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("thingsToDo.transfers.eyebrow")}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">{t("thingsToDo.transfers.title")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {transferCards.map((landing) => (
            <Link
              key={landing.landingSlug}
              href={`/transfer/${landing.landingSlug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={landing.heroImage || "/transfer/mini van.png"}
                  alt={landing.heroImageAlt || landing.hotelName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("thingsToDo.transfers.cardTag")}</p>
                <h3 className="text-base font-semibold text-slate-900">{landing.hotelName}</h3>
                <p className="text-sm text-slate-600">{landing.heroSubtitle}</p>
                <span className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                  {t("thingsToDo.transfers.cardCta")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
