import Link from "next/link";
import { Suspense } from "react";
import TransferHeroNotices from "@/components/public/TransferHeroNotices";
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
  heroImageOverride?: string;
};

export default async function PublicTransferPage({
  locale,
  heroTitleOverride,
  heroDescriptionOverride,
  heroImageOverride
}: Props) {
  const transfersV2Enabled = process.env.TRANSFERS_V2_ENABLED === "true";
  const homeHref = locale === "es" ? "/" : `/${locale}`;
  const toursRootHref = locale === "es" ? "/tours" : `/${locale}/tours`;
  const hotelsRootHref = locale === "es" ? "/hoteles" : `/${locale}/hotels`;
  const puntaCanaHubHref = locale === "es" ? "/punta-cana/traslado" : `/${locale}/punta-cana/traslado`;
  const premiumVipHref =
    locale === "es"
      ? "/punta-cana/premium-transfer-services"
      : `/${locale}/punta-cana/premium-transfer-services`;
  const proDiscoveryTransfersHref =
    locale === "es" ? "/prodiscovery?type=transfer" : `/${locale}/prodiscovery?type=transfer`;
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
    <div className="travel-surface">
      <section
        className="relative flex min-h-[380px] w-full items-center overflow-hidden md:min-h-[520px]"
        style={{
          backgroundImage: `url('${heroImageOverride || "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/transfer/banner%20%20%20%20transfer.jpeg"}')`,
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
          <h2 className="mt-2 text-2xl font-black">Punta Cana Premium Transfer Services</h2>
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
            {locale === "es"
              ? "Planifica todo en un solo flujo"
              : locale === "fr"
                ? "Planifiez tout en un seul flux"
                : "Plan everything in one flow"}
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
            <Link
              href={proDiscoveryTransfersHref}
              className="rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-800 transition hover:bg-sky-100"
            >
              {locale === "es" ? "Ver en ProDiscovery" : locale === "fr" ? "Voir dans ProDiscovery" : "View in ProDiscovery"}
            </Link>
          </div>
        </section>

        <section id="transfer-search" className="rounded-[36px] border border-slate-100 bg-white/90 p-6 shadow-2xl">
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
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {locale === "es"
              ? "Explora rutas privadas ya preparadas para los hoteles y resorts con mayor demanda. Cada landing conecta mejor con la intencion de busqueda y lleva al viajero directo a una cotizacion real."
              : locale === "fr"
                ? "Explorez des trajets prives deja prepares pour les hotels et resorts les plus demandes. Chaque landing repond mieux a l'intention de recherche et mene le voyageur vers un devis reel."
                : "Explore private routes already prepared for the most requested hotels and resorts. Each landing matches search intent better and moves the traveler straight into a real quote."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PUNTA_CANA_TRANSFER_LINKS.map((item) => (
              <Link
                key={item.slug}
                href={transferHref(item.slug)}
                className="group rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/80 px-5 py-5 text-sm text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {locale === "es" ? "Ruta privada" : locale === "fr" ? "Trajet prive" : "Private route"}
                </p>
                <p className="mt-2 text-base font-bold leading-6 text-slate-900">{translate(locale, item.labelKey)}</p>
                {transferReviewSummary.has(item.slug) ? (
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                    ★ {transferReviewSummary.get(item.slug)!.avg.toFixed(1)} · {transferReviewSummary.get(item.slug)!.count}{" "}
                    {locale === "fr" ? "avis" : locale === "es" ? "resenas" : "reviews"}
                  </p>
                ) : (
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {locale === "es" ? "Ruta lista para cotizar" : locale === "fr" ? "Itineraire pret a chiffrer" : "Route ready to quote"}
                  </p>
                )}
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {locale === "es"
                    ? "Recogida puntual, confirmacion clara y traslado privado adaptado a tu llegada."
                    : locale === "fr"
                      ? "Prise en charge ponctuelle, confirmation claire et transfert prive adapte a votre arrivee."
                      : "Punctual pickup, clear confirmation, and private transportation matched to your arrival."}
                </p>
                <div className="mt-4 inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-800 transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                  {locale === "es" ? "Ver ruta" : locale === "fr" ? "Voir trajet" : "View route"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {translate(locale, "transfer.longform.eyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              {translate(locale, "transfer.longform.title")}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>{translate(locale, "transfer.longform.body1")}</p>
              <p>{translate(locale, "transfer.longform.body2")}</p>
              <p>{translate(locale, "transfer.longform.body3")}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {locale === "es" ? "Reserva clara" : locale === "fr" ? "Reservation claire" : "Clear booking"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {locale === "es"
                    ? "Confirmacion rapida y detalles visibles antes de pagar."
                    : locale === "fr"
                      ? "Confirmation rapide et details visibles avant paiement."
                      : "Fast confirmation and visible trip details before payment."}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {locale === "es" ? "Operacion real" : locale === "fr" ? "Operation reelle" : "Real operations"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {locale === "es"
                    ? "Conductores, rutas y seguimiento pensados para llegadas sin friccion."
                    : locale === "fr"
                      ? "Chauffeurs, trajets et suivi penses pour une arrivee sans friction."
                      : "Drivers, routes, and follow-up built for a frictionless arrival."}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {locale === "es" ? "Atencion real" : locale === "fr" ? "Assistance reelle" : "Real support"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {locale === "es"
                    ? "Ideal para familias, parejas y grupos que quieren llegar bien desde el minuto uno."
                    : locale === "fr"
                      ? "Ideal pour familles, couples et groupes qui veulent bien arriver des la premiere minute."
                      : "Ideal for families, couples, and groups who want a smooth arrival from minute one."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-900 bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.32)]">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              {locale === "es" ? "Experiencia sin friccion" : locale === "fr" ? "Experience sans friction" : "Frictionless arrival"}
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              {locale === "es"
                ? "Un traslado que se siente organizado antes de salir del aeropuerto"
                : locale === "fr"
                  ? "Un transfert qui semble organise avant meme de quitter l'aeroport"
                  : "A transfer that feels organized before you even leave the airport"}
            </h2>
            <div className="mt-6 space-y-4">
              {[
                locale === "es"
                  ? {
                      title: "Cotizacion simple",
                      body: "Menos friccion al reservar, mas claridad sobre la ruta, el hotel y la operacion."
                    }
                  : locale === "fr"
                    ? {
                        title: "Devis simple",
                        body: "Moins de friction a la reservation, plus de clarte sur le trajet, l'hotel et l'operation."
                      }
                    : {
                        title: "Simple quoting",
                        body: "Less friction while booking, more clarity about the route, hotel, and operation."
                      },
                locale === "es"
                  ? {
                      title: "Llegada mejor resuelta",
                      body: "Desde PUJ hasta el resort, la experiencia debe verse seria, puntual y comoda."
                    }
                  : locale === "fr"
                    ? {
                        title: "Arrivee mieux geree",
                        body: "De PUJ jusqu'au resort, l'experience doit sembler serieuse, ponctuelle et confortable."
                      }
                    : {
                        title: "Better arrival flow",
                        body: "From PUJ to the resort, the experience should feel serious, punctual, and comfortable."
                      },
                locale === "es"
                  ? {
                      title: "Upsell natural",
                      body: "Si el viajero quiere un nivel mas alto, puede pasar a premium o seguir explorando en ProDiscovery."
                    }
                  : locale === "fr"
                    ? {
                        title: "Upsell naturel",
                        body: "Si le voyageur veut un niveau superieur, il peut passer au premium ou continuer dans ProDiscovery."
                      }
                    : {
                        title: "Natural upsell",
                        body: "If the traveler wants a higher tier, they can move into premium or keep exploring in ProDiscovery."
                      }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={premiumVipHref}
                className="rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-slate-200"
              >
                {locale === "es" ? "Ver premium" : locale === "fr" ? "Voir premium" : "View premium"}
              </Link>
              <Link
                href={proDiscoveryTransfersHref}
                className="rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/50 hover:bg-white/10"
              >
                {locale === "es" ? "Explorar mas rutas" : locale === "fr" ? "Explorer plus de trajets" : "Explore more routes"}
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {translate(locale, "transfer.longform2.eyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              {translate(locale, "transfer.longform2.title")}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>{translate(locale, "transfer.longform2.body1")}</p>
              <p>{translate(locale, "transfer.longform2.body2")}</p>
              <p>{translate(locale, "transfer.longform2.body3")}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              {translate(locale, "transfer.longform3.eyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              {translate(locale, "transfer.longform3.title")}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>{translate(locale, "transfer.longform3.body1")}</p>
              <p>{translate(locale, "transfer.longform3.body2")}</p>
              <p>{translate(locale, "transfer.longform3.body3")}</p>
            </div>
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
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{translate(locale, item.qKey)}</p>
                <p className="font-semibold text-slate-900">{translate(locale, item.aKey)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-[0_35px_90px_rgba(15,23,42,0.36)]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                {locale === "es" ? "Reserva con confianza" : locale === "fr" ? "Reserve avec confiance" : "Book with confidence"}
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                {locale === "es"
                  ? "Cotiza tu traslado privado y llega a Punta Cana con todo resuelto"
                  : locale === "fr"
                    ? "Demandez votre transfert prive et arrivez a Punta Cana avec tout bien organise"
                    : "Quote your private transfer and arrive in Punta Cana with everything organized"}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">{translate(locale, "transfer.note")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="#transfer-search"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-slate-200"
              >
                {locale === "es" ? "Cotizar ahora" : locale === "fr" ? "Demander un devis" : "Quote now"}
              </Link>
              <Link
                href={premiumVipHref}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:border-white/50 hover:bg-white/10"
              >
                {locale === "es" ? "Ver opcion premium" : locale === "fr" ? "Voir option premium" : "View premium option"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
