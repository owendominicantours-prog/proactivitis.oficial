import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import {
  buildCanonical,
  buildMarketTransferTitles,
  localizeLanding,
  resolveLanding,
  resolveLocationByAlias,
  toAbsoluteImageUrl
} from "@/components/public/TransferLandingPage";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import { TransferLocationType } from "@prisma/client";
import { normalizeTextDeep } from "@/lib/text-format";
import { getPriceValidUntil } from "@/lib/seo";
import {
  applyTransferSchemaOverride,
  getTransferSchemaOverride,
  stringifyBreadcrumbItems,
  stringifyFaqItems
} from "@/lib/schemaManager";
import type { Locale } from "@/lib/translations";
import {
  clearTransferSchemaOverrideAction,
  saveTransferSchemaOverrideAction
} from "./actions";

type SearchParams = {
  slug?: string;
  locale?: Locale;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const localeLabel = (locale: Locale) =>
  locale === "es" ? "Espanol" : locale === "en" ? "English" : "Francais";

const textByLocale = {
  es: { home: "Inicio", transfers: "Transfers" },
  en: { home: "Home", transfers: "Transfers" },
  fr: { home: "Accueil", transfers: "Transferts" }
} satisfies Record<Locale, { home: string; transfers: string }>;

async function buildTransferSchemaPreview(slug: string, locale: Locale) {
  const landing = await resolveLanding(slug);
  if (!landing) return null;

  const localizedLanding = normalizeTextDeep(await localizeLanding(landing, locale));
  const [originSlugRaw, destinationSlugRaw] = landing.landingSlug.includes("-to-")
    ? landing.landingSlug.split("-to-")
    : ["puj-airport", landing.hotelSlug];

  const [originLocation, destinationLocation, approvedTransferReviews, totalApprovedTransferReviews, override] =
    await Promise.all([
      resolveLocationByAlias(originSlugRaw || "puj-airport", TransferLocationType.AIRPORT),
      resolveLocationByAlias(destinationSlugRaw || landing.hotelSlug),
      prisma.transferReview.findMany({
        where: { status: "APPROVED", transferLandingSlug: landing.landingSlug },
        orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
        take: 7
      }),
      prisma.transferReview.count({
        where: { status: "APPROVED", transferLandingSlug: landing.landingSlug }
      }),
      getTransferSchemaOverride(landing.landingSlug, locale)
    ]);

  const originLabel = originLocation?.name ?? "Punta Cana International Airport (PUJ)";
  const destinationLabel = destinationLocation?.name ?? localizedLanding.hotelName;
  const marketTitles = buildMarketTransferTitles(locale, localizedLanding.hotelName, originLabel);
  const transferReviewAverage =
    approvedTransferReviews.length > 0
      ? Math.round((approvedTransferReviews.reduce((sum, review) => sum + review.rating, 0) / approvedTransferReviews.length) * 10) / 10
      : 0;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: marketTitles.heroTitle,
    description: localizedLanding.metaDescription,
    serviceType:
      locale === "es"
        ? `Transfer privado al hotel ${localizedLanding.hotelName}`
        : locale === "fr"
        ? `Transfert prive vers ${localizedLanding.hotelName}`
        : `Private transfer to ${localizedLanding.hotelName}`,
    provider: {
      "@type": "TravelAgency",
      name: "Proactivitis",
      url: "https://proactivitis.com",
      logo: "https://proactivitis.com/icon.png",
      sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"]
    },
    areaServed: {
      "@type": "Place",
      name: locale === "fr" ? "Punta Cana" : "Punta Cana"
    },
    image: [toAbsoluteImageUrl(localizedLanding.heroImage)],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name:
        locale === "es"
          ? "Transfers desde Punta Cana"
          : locale === "fr"
          ? "Transferts depuis Punta Cana"
          : "Transfers from Punta Cana",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name:
              locale === "es"
                ? `Transfer privado a ${localizedLanding.hotelName}`
                : locale === "fr"
                ? `Transfert prive vers ${localizedLanding.hotelName}`
                : `Private transfer to ${localizedLanding.hotelName}`
          },
          priceCurrency: "USD",
          price: localizedLanding.priceFrom,
          availability: "https://schema.org/InStock",
          priceValidUntil: getPriceValidUntil()
        }
      ]
    },
    ...(totalApprovedTransferReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: transferReviewAverage,
            reviewCount: totalApprovedTransferReviews
          }
        }
      : {})
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Proactivitis",
    url: "https://proactivitis.com",
    logo: "https://proactivitis.com/icon.png",
    image: [toAbsoluteImageUrl(localizedLanding.heroImage)],
    sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localizedLanding.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: textByLocale[locale].home,
        item: "https://proactivitis.com/"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: textByLocale[locale].transfers,
        item: buildCanonical("", locale).replace(/\/$/, "")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: marketTitles.heroTitle,
        item: buildCanonical(landing.landingSlug, locale)
      }
    ]
  };

  return {
    graph: applyTransferSchemaOverride({
      businessSchema,
      serviceSchema,
      faqSchema,
      breadcrumbSchema,
      override
    }),
    landing,
    localizedLanding,
    originLabel,
    destinationLabel,
    override
  };
}

export default async function AdminSchemaManagerPage({ searchParams }: Props) {
  const resolved = searchParams ? await searchParams : undefined;
  const locale = resolved?.locale ?? "es";
  const dynamicCombos = await getDynamicTransferLandingCombos();
  const availableSlugs = Array.from(
    new Set([
      ...allLandings().map((item) => item.landingSlug),
      ...dynamicCombos.map((item) => item.landingSlug)
    ])
  ).sort((a, b) => a.localeCompare(b));
  const selectedSlug =
    resolved?.slug && availableSlugs.includes(resolved.slug) ? resolved.slug : availableSlugs[0] ?? "";
  const preview = selectedSlug ? await buildTransferSchemaPreview(selectedSlug, locale) : null;
  const override = preview?.override ?? null;

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">SEO</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Schema Manager</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          MVP para landings de transfer. Genera schema automatico desde la pagina y te deja aplicar overrides humanos
          por slug y locale sin tocar codigo.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/admin/seo" className="inline-flex rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700">
            Volver a Search Console
          </Link>
          {preview ? (
            <Link
              href={locale === "es" ? `/transfer/${preview.landing.landingSlug}` : `/${locale}/transfer/${preview.landing.landingSlug}`}
              className="inline-flex rounded-full bg-slate-900 px-4 py-2 font-semibold text-white"
              target="_blank"
            >
              Abrir landing real
            </Link>
          ) : null}
        </div>
      </header>

      <form method="GET" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="text-sm text-slate-600">
          Landing
          <select name="slug" defaultValue={selectedSlug} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
            {availableSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Locale
          <select name="locale" defaultValue={locale} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
            {(["es", "en", "fr"] as Locale[]).map((item) => (
              <option key={item} value={item}>
                {localeLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Cargar schema
        </button>
      </form>

      {preview ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {preview.originLabel} to {preview.destinationLabel}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Slug real: <span className="font-medium text-slate-700">{preview.landing.landingSlug}</span>
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Titulo visible</p>
                <p className="mt-2 font-semibold text-slate-900">{preview.localizedLanding.heroTitle}</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Precio base</p>
                <p className="mt-2 font-semibold text-slate-900">USD {preview.localizedLanding.priceFrom}</p>
              </article>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">JSON-LD final</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-100">
                {JSON.stringify(preview.graph, null, 2)}
              </pre>
            </div>
          </section>

          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Overrides</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Editor de schema</h2>
              <p className="mt-2 text-sm text-slate-600">
                Puedes guardar overrides solo para este locale o como capa global para todos los idiomas de la misma
                landing.
              </p>
            </div>

            <form action={saveTransferSchemaOverrideAction} className="space-y-5">
              <input type="hidden" name="slug" value={preview.landing.landingSlug} />
              <input type="hidden" name="locale" value={locale} />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Scope
                  <select name="scope" defaultValue="locale" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <option value="locale">Solo este locale</option>
                    <option value="all">Todos los locales</option>
                  </select>
                </label>
                <label className="text-sm text-slate-600">
                  Service block
                  <select name="service_enabled" defaultValue={override?.serviceEnabled === false ? "disabled" : "inherit"} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <option value="inherit">Automatico</option>
                    <option value="enabled">Forzar activo</option>
                    <option value="disabled">Desactivar</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  FAQ block
                  <select name="faq_enabled" defaultValue={override?.faqEnabled === false ? "disabled" : "inherit"} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <option value="inherit">Automatico</option>
                    <option value="enabled">Forzar activo</option>
                    <option value="disabled">Desactivar</option>
                  </select>
                </label>
                <label className="text-sm text-slate-600">
                  Breadcrumb block
                  <select name="breadcrumb_enabled" defaultValue={override?.breadcrumbEnabled === false ? "disabled" : "inherit"} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <option value="inherit">Automatico</option>
                    <option value="enabled">Forzar activo</option>
                    <option value="disabled">Desactivar</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Service name
                  <input name="service_name" defaultValue={override?.serviceName ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-600">
                  Service type
                  <input name="service_type" defaultValue={override?.serviceType ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
              </div>

              <label className="text-sm text-slate-600">
                Description
                <textarea name="description" rows={3} defaultValue={override?.description ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Provider type
                  <input name="provider_type" defaultValue={override?.providerType ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-600">
                  Provider name
                  <input name="provider_name" defaultValue={override?.providerName ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-600">
                  Provider image
                  <input name="provider_image" defaultValue={override?.providerImage ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <label className="text-sm text-slate-600">
                  Offer name
                  <input name="offer_name" defaultValue={override?.offerName ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-600">
                  Price
                  <input name="price" defaultValue={override?.price ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-600">
                  Currency
                  <input name="price_currency" defaultValue={override?.priceCurrency ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-600">
                  Valid until
                  <input name="price_valid_until" defaultValue={override?.priceValidUntil ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="2026-12-31" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-600">
                  Availability
                  <input name="availability" defaultValue={override?.availability ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="https://schema.org/InStock" />
                </label>
                <label className="text-sm text-slate-600">
                  Rating value
                  <input name="aggregate_rating_value" defaultValue={override?.aggregateRatingValue ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-600">
                  Review count
                  <input name="aggregate_review_count" defaultValue={override?.aggregateReviewCount ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
              </div>

              <label className="text-sm text-slate-600">
                Area served
                <textarea name="area_served" rows={3} defaultValue={(override?.areaServed ?? []).join("\n")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Punta Cana&#10;Santo Domingo" />
              </label>

              <label className="text-sm text-slate-600">
                FAQ items
                <textarea name="faq_items" rows={5} defaultValue={stringifyFaqItems(override?.faqItems)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Question | Answer" />
              </label>

              <label className="text-sm text-slate-600">
                Breadcrumb items
                <textarea name="breadcrumb_items" rows={4} defaultValue={stringifyBreadcrumbItems(override?.breadcrumbItems)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Name | https://proactivitis.com/path" />
              </label>

              <label className="text-sm text-slate-600">
                Extra graph JSON
                <textarea name="extra_graph" rows={6} defaultValue={override?.extraGraph ? JSON.stringify(override.extraGraph, null, 2) : ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs" placeholder='[{"@type":"Product","name":"Extra block"}]' />
              </label>

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Guardar override
                </button>
              </div>
            </form>

            <form action={clearTransferSchemaOverrideAction} className="border-t border-slate-200 pt-5">
              <input type="hidden" name="slug" value={preview.landing.landingSlug} />
              <input type="hidden" name="locale" value={locale} />
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm text-slate-600">
                  Scope a limpiar
                  <select name="scope" defaultValue="locale" className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <option value="locale">Solo este locale</option>
                    <option value="all">Todos los locales</option>
                  </select>
                </label>
                <button type="submit" className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700">
                  Limpiar override
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm">
          No pude construir el preview para esa landing.
        </section>
      )}
    </div>
  );
}
