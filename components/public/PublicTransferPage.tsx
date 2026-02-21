import Link from "next/link";
import { Suspense } from "react";
import TrasladoSearch, { LocationOption } from "@/components/traslado/TrasladoSearch";
import TrasladoSearchV2 from "@/components/traslado/TrasladoSearchV2";
import TransferHeroNotices from "@/components/public/TransferHeroNotices";
import { prisma } from "@/lib/prisma";
import { getTransferPointsForCountry, TransferPointOption } from "@/lib/transfers";
import { Locale, translate } from "@/lib/translations";

const heroStats = [
  { labelKey: "transfer.hero.stat.transfers", value: "5.000+" },
  { labelKey: "transfer.hero.stat.drivers", value: "120" },
  { labelKey: "transfer.hero.stat.support", valueKey: "transfer.hero.stat.supportValue" }
] as const;

const faqItems = [
  { qKey: "transfer.faq.where.q", aKey: "transfer.faq.where.a" },
  { qKey: "transfer.faq.delay.q", aKey: "transfer.faq.delay.a" },
  { qKey: "transfer.faq.cancel.q", aKey: "transfer.faq.cancel.a" }
] as const;

const PUNTA_CANA_TRANSFER_LINKS = [
  { slug: "punta-cana-international-airport-to-hard-rock-hotel-punta-cana", labelKey: "transfer.links.item.1" },
  { slug: "punta-cana-international-airport-to-barcelo-bavaro-palace", labelKey: "transfer.links.item.2" },
  { slug: "punta-cana-international-airport-to-riu-republica", labelKey: "transfer.links.item.3" },
  { slug: "punta-cana-international-airport-to-majestic-mirage", labelKey: "transfer.links.item.4" },
  { slug: "punta-cana-international-airport-to-melia-caribe-beach", labelKey: "transfer.links.item.5" },
  { slug: "punta-cana-international-airport-to-royalton-bavaro", labelKey: "transfer.links.item.6" },
  { slug: "punta-cana-international-airport-to-secrets-cap-cana", labelKey: "transfer.links.item.7" },
  { slug: "punta-cana-international-airport-to-dreams-flora", labelKey: "transfer.links.item.8" },
  { slug: "punta-cana-international-airport-to-dreams-onyx", labelKey: "transfer.links.item.9" },
  { slug: "punta-cana-international-airport-to-breathless-punta-cana", labelKey: "transfer.links.item.10" }
] as const;
type Props = {
  locale: Locale;
  heroTitleOverride?: string;
  heroDescriptionOverride?: string;
};

export default async function PublicTransferPage({ locale, heroTitleOverride, heroDescriptionOverride }: Props) {
  const transfersV2Enabled = process.env.TRANSFERS_V2_ENABLED === "true";
  const homeHref = locale === "es" ? "/" : `/${locale}`;
  const toursRootHref = locale === "es" ? "/tours" : `/${locale}/tours`;
  const hotelsRootHref = locale === "es" ? "/hoteles" : `/${locale}/hotels`;
  const puntaCanaHubHref = locale === "es" ? "/punta-cana/traslado" : `/${locale}/punta-cana/traslado`;
  const premiumVipHref =
    locale === "es"
      ? "/punta-cana/premium-transfer-services"
      : `/${locale}/punta-cana/premium-transfer-services`;
  const transferHref = (slug: string) => (locale === "es" ? `/transfer/${slug}` : `/${locale}/transfer/${slug}`);
  let options: LocationOption[] = [];
  let originPoints: TransferPointOption[] = [];
  const transferLandingSlugs = PUNTA_CANA_TRANSFER_LINKS.map((item) => item.slug);
  const transferReviewRows = await prisma.transferReview.groupBy({
    by: ["transferLandingSlug"],
    where: {
      status: "APPROVED",
      transferLandingSlug: { in: transferLandingSlugs }
    },
    _count: { _all: true },
    _avg: { rating: true }
  });
  const transferReviewSummary = new Map(
    transferReviewRows
      .filter((row) => Boolean(row.transferLandingSlug))
      .map((row) => [
        row.transferLandingSlug as string,
        { count: row._count._all, avg: Number(row._avg.rating ?? 0) }
      ])
  );

  if (!transfersV2Enabled) {
    const hotels = await prisma.location.findMany({
      where: {
        countryId: "RD",
        authorized: true
      },
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        destination: { select: { name: true } },
        microZone: { select: { name: true, slug: true } }
      }
    });

    const transferDestinations = await prisma.transferDestination.findMany({
      where: {
        zone: {
          countryCode: "RD"
        }
      },
      select: {
        id: true,
        slug: true
      }
    });
    const destinationMap = new Map(transferDestinations.map((destination) => [destination.slug, destination.id]));

    options = hotels.map((hotel) => ({
      name: hotel.name,
      slug: hotel.slug,
      destinationName: hotel.destination?.name ?? null,
      microZoneName: hotel.microZone?.name ?? null,
      microZoneSlug: hotel.microZone?.slug ?? null,
      transferDestinationId: destinationMap.get(hotel.slug) ?? null
    }));

    originPoints = await getTransferPointsForCountry("RD");
  }

  return (
    <div className="bg-gradient-to-b from-[#E2FFF8] via-white to-[#F8FAFC]">
      <section
        className="relative flex min-h-[380px] w-full items-center overflow-hidden md:min-h-[520px]"
        style={{
          backgroundImage:
            "url('https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-slate-900/55 md:bg-slate-900/65" />
        <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4 py-14">
          <p className="text-xs uppercase tracking-[0.5em] text-white/70">
            {translate(locale, "transfer.hero.label")}
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
                {heroTitleOverride ?? translate(locale, "transfer.hero.title")}
              </h1>
              <p className="text-base text-white/90">
                {heroDescriptionOverride ?? translate(locale, "transfer.hero.description")}
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                <Link
                  href={homeHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/90 px-4 py-2 text-slate-900 shadow-sm transition hover:bg-white"
                >
                  {translate(locale, "transfer.link.home")}
                </Link>
                <Link
                  href={toursRootHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/80 bg-transparent px-4 py-2 text-white transition hover:bg-white/10"
                >
                  {translate(locale, "transfer.link.tours")}
                </Link>
                <Link
                  href={puntaCanaHubHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
                >
                  {translate(locale, "transfer.link.puntaCana")}
                </Link>
              </div>
              <TransferHeroNotices locale={locale} />
            </div>
            <div className="grid w-full max-w-xs grid-cols-1 gap-3 rounded-[28px] border border-white/20 bg-white/10 p-4 text-center text-white shadow-sm backdrop-blur md:max-w-[320px]">
              {heroStats.map((stat) => (
                <div key={stat.labelKey} className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {translate(locale, stat.labelKey)}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {"valueKey" in stat ? translate(locale, stat.valueKey) : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10">
        <section className="rounded-[32px] border border-amber-300/30 bg-gradient-to-r from-[#1f2937] via-[#111827] to-[#0f172a] p-6 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">
            {locale === "es" ? "Elite Collection" : locale === "fr" ? "Collection Elite" : "Elite Collection"}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {locale === "es"
              ? "Punta Cana Premium Transfer Services"
              : locale === "fr"
              ? "Punta Cana Premium Transfer Services"
              : "Punta Cana Premium Transfer Services"}
          </h2>
          <p className="mt-2 text-sm text-slate-200">
            {locale === "es"
              ? "Flota VIP con Cadillac y Suburban para clientes premium."
              : locale === "fr"
              ? "Flotte VIP avec Cadillac et Suburban pour clients premium."
              : "VIP fleet with Cadillac and Suburban for premium clients."}
          </p>
          <Link
            href={premiumVipHref}
            className="mt-4 inline-flex rounded-full bg-amber-300 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-amber-200"
          >
            {locale === "es" ? "Ver Landing VIP" : locale === "fr" ? "Voir Landing VIP" : "Open VIP Landing"}
          </Link>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            {locale === "es" ? "Planifica todo en un solo flujo" : locale === "fr" ? "Planifiez tout en un seul flux" : "Plan everything in one flow"}
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {locale === "es"
              ? "Combina traslado + hotel + tours sin salir de Proactivitis"
              : locale === "fr"
              ? "Combinez transfert + hotel + excursions sans quitter Proactivitis"
              : "Bundle transfer + hotel + tours without leaving Proactivitis"}
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={hotelsRootHref}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
            >
              {locale === "es" ? "Ver hoteles" : locale === "fr" ? "Voir hotels" : "View hotels"}
            </Link>
            <Link
              href={toursRootHref}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
            >
              {locale === "es" ? "Ver tours" : locale === "fr" ? "Voir excursions" : "View tours"}
            </Link>
            <Link
              href={premiumVipHref}
              className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 transition hover:bg-amber-100"
            >
              {locale === "es" ? "VIP transfer" : locale === "fr" ? "Transfert VIP" : "VIP transfer"}
            </Link>
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-100 bg-white/90 p-6 shadow-2xl">
          <Suspense fallback={<div />}>
            {transfersV2Enabled ? (
              <TrasladoSearchV2 />
            ) : (
              <TrasladoSearch hotels={options} originPoints={originPoints} />
            )}
          </Suspense>
        </section>

        <section className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "transfer.links.subtitle")}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {translate(locale, "transfer.links.title")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PUNTA_CANA_TRANSFER_LINKS.map((item) => (
              <Link
                key={item.slug}
                href={transferHref(item.slug)}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
              >
                <p>{translate(locale, item.labelKey)}</p>
                {transferReviewSummary.has(item.slug) ? (
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-600">
                    ★ {transferReviewSummary.get(item.slug)!.avg.toFixed(1)} · {transferReviewSummary.get(item.slug)!.count}{" "}
                    {locale === "fr" ? "avis" : "resenas"}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {locale === "es" ? "Sin resenas aun" : locale === "fr" ? "Pas encore d'avis" : "No reviews yet"}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "transfer.longform.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {translate(locale, "transfer.longform.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{translate(locale, "transfer.longform.body1")}</p>
            <p>{translate(locale, "transfer.longform.body2")}</p>
            <p>{translate(locale, "transfer.longform.body3")}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "transfer.longform2.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {translate(locale, "transfer.longform2.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{translate(locale, "transfer.longform2.body1")}</p>
            <p>{translate(locale, "transfer.longform2.body2")}</p>
            <p>{translate(locale, "transfer.longform2.body3")}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "transfer.longform3.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {translate(locale, "transfer.longform3.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{translate(locale, "transfer.longform3.body1")}</p>
            <p>{translate(locale, "transfer.longform3.body2")}</p>
            <p>{translate(locale, "transfer.longform3.body3")}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            {translate(locale, "transfer.seo.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {translate(locale, "transfer.seo.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{translate(locale, "transfer.seo.body1")}</p>
            <p>{translate(locale, "transfer.seo.body2")}</p>
            <p>{translate(locale, "transfer.seo.body3")}</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                {translate(locale, "transfer.seo.list.label")}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>{translate(locale, "transfer.seo.list.item1")}</li>
                <li>{translate(locale, "transfer.seo.list.item2")}</li>
                <li>{translate(locale, "transfer.seo.list.item3")}</li>
                <li>{translate(locale, "transfer.seo.list.item4")}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                {translate(locale, "transfer.seo.tip.label")}
              </p>
              <p className="mt-2">{translate(locale, "transfer.seo.tip.body")}</p>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{translate(locale, "transfer.faq.label")}</p>
            <h2 className="text-2xl font-bold text-slate-900">{translate(locale, "transfer.faq.heading")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <div
                key={item.qKey}
                className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-sm text-slate-600"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {translate(locale, item.qKey)}
                </p>
                <p className="font-semibold text-slate-900">{translate(locale, item.aKey)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <p>{translate(locale, "transfer.note")}</p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
          >
            {translate(locale, "transfer.contact")}
          </button>
        </section>
      </div>
    </div>
  );
}
