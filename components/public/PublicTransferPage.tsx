import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import TrasladoSearch, { LocationOption } from "@/components/traslado/TrasladoSearch";
import TrasladoSearchV2 from "@/components/traslado/TrasladoSearchV2";
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
type Props = {
  locale: Locale;
  heroTitleOverride?: string;
  heroDescriptionOverride?: string;
};

export default async function PublicTransferPage({ locale, heroTitleOverride, heroDescriptionOverride }: Props) {
  const transfersV2Enabled = process.env.TRANSFERS_V2_ENABLED === "true";
  let options: LocationOption[] = [];
  let originPoints: TransferPointOption[] = [];

  if (!transfersV2Enabled) {
    const hotels = await prisma.location.findMany({
      where: { countryId: "RD", authorized: true },
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
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10">
        <section className="relative overflow-hidden space-y-6 rounded-[36px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
          <Image
            src="/transfer/sedan.png"
            alt="Traslado premium Proactivitis"
            fill
            sizes="100vw"
            priority
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/90" />
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-600">
            {translate(locale, "transfer.hero.label")}
          </p>
          <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                {heroTitleOverride ?? translate(locale, "transfer.hero.title")}
              </h1>
              <p className="text-base text-slate-600">
                {heroDescriptionOverride ?? translate(locale, "transfer.hero.description")}
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.4em]">
                <Link
                  href="/"
                  className="text-emerald-600 underline decoration-emerald-300 decoration-2 underline-offset-4 transition hover:text-emerald-500"
                >
                  {translate(locale, "transfer.link.home")}
                </Link>
                <Link href="/tours" className="text-slate-500 transition hover:text-slate-900">
                  {translate(locale, "transfer.link.tours")}
                </Link>
              </div>
            </div>
            <div className="grid w-full max-w-xs grid-cols-1 gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-center text-slate-700 shadow-sm md:max-w-[320px]">
              {heroStats.map((stat) => (
                <div key={stat.labelKey} className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  {translate(locale, stat.labelKey)}
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {"valueKey" in stat ? translate(locale, stat.valueKey) : stat.value}
                  </p>
                </div>
              ))}
            </div>
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
