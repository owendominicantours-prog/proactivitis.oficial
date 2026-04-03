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
import { normalizeTextDeep } from "@/lib/text-format";
import { getPriceValidUntil, PROACTIVITIS_LOCALBUSINESS, PROACTIVITIS_URL } from "@/lib/seo";
import { TransferLocationType } from "@prisma/client";
import type { Locale } from "@/lib/translations";
import { getGeminiSchemaReview } from "@/lib/geminiSchemaReview";
import { getApprovedTransferReviewsForLanding, getTransferReviewSummaryForLanding } from "@/lib/transferReviews";
import {
  applyTransferSchemaOverride,
  getSchemaHealthScore,
  getSchemaWarnings,
  getTransferSchemaOverride,
  stringifyAdditionalProperties,
  stringifyBreadcrumbItems,
  stringifyFaqItems
} from "@/lib/schemaManager";
import {
  applyGeminiOverrideSuggestionsAction,
  clearTransferSchemaOverrideAction,
  generateTransferFaqDraftAction,
  reviewTransferSchemaWithGeminiAction,
  saveTransferSchemaOverrideAction
} from "./actions";

type SearchParams = {
  slug?: string;
  locale?: Locale;
  search?: string;
  faqDraft?: string;
  gemini?: string;
  gemini_error?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

type PreviewData = {
  graph: Record<string, unknown>;
  landing: NonNullable<Awaited<ReturnType<typeof resolveLanding>>>;
  localizedLanding: Awaited<ReturnType<typeof localizeLanding>>;
  originLabel: string;
  destinationLabel: string;
  canonical: string;
  override: Awaited<ReturnType<typeof getTransferSchemaOverride>>;
};

const localeLabel = (locale: Locale) =>
  locale === "es" ? "Espanol" : locale === "en" ? "English" : "Francais";

const textByLocale = {
  es: { home: "Inicio", transfers: "Transfers" },
  en: { home: "Home", transfers: "Transfers" },
  fr: { home: "Accueil", transfers: "Transferts" }
} satisfies Record<Locale, { home: string; transfers: string }>;

const currencyOptions = ["USD", "DOP", "EUR"];

const normalizeSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

async function buildTransferSchemaPreview(slug: string, locale: Locale): Promise<PreviewData | null> {
  const landing = await resolveLanding(slug);
  if (!landing) return null;

  const localizedLanding = normalizeTextDeep(await localizeLanding(landing, locale));
  const [originSlugRaw, destinationSlugRaw] = landing.landingSlug.includes("-to-")
    ? landing.landingSlug.split("-to-")
    : ["puj-airport", landing.hotelSlug];

  const [originLocation, destinationLocation, approvedTransferReviews, transferReviewSummary, override] =
    await Promise.all([
      resolveLocationByAlias(originSlugRaw || "puj-airport", TransferLocationType.AIRPORT),
      resolveLocationByAlias(destinationSlugRaw || landing.hotelSlug),
      getApprovedTransferReviewsForLanding(landing.landingSlug, 7),
      getTransferReviewSummaryForLanding(landing.landingSlug),
      getTransferSchemaOverride(landing.landingSlug, locale)
    ]);

  const originLabel = originLocation?.name ?? "Punta Cana International Airport (PUJ)";
  const destinationLabel = destinationLocation?.name ?? localizedLanding.hotelName;
  const canonical = buildCanonical(landing.landingSlug, locale);
  const marketTitles = buildMarketTransferTitles(locale, localizedLanding.hotelName, originLabel);
  const totalApprovedTransferReviews = transferReviewSummary.count;
  const transferReviewAverage = Math.round(transferReviewSummary.average * 10) / 10;
  const identifier = landing.landingSlug;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    identifier,
    name: marketTitles.heroTitle,
    description: localizedLanding.metaDescription,
    mainEntityOfPage: canonical,
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
    areaServed: [
      { "@type": "Place", name: originLabel },
      { "@type": "Place", name: destinationLabel }
    ],
    url: canonical,
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
            identifier,
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
    ...(totalApprovedTransferReviews > 0 ? {} : {})
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${PROACTIVITIS_URL}#organization`,
    name: "Proactivitis",
    url: "https://proactivitis.com",
    logo: "https://proactivitis.com/icon.png",
    image: [toAbsoluteImageUrl(localizedLanding.heroImage)],
    sameAs: ["https://www.instagram.com/proactivitis/", "https://www.facebook.com/proactivitis"],
    telephone: PROACTIVITIS_LOCALBUSINESS.telephone,
    email: PROACTIVITIS_LOCALBUSINESS.email,
    priceRange: "$$",
    address: PROACTIVITIS_LOCALBUSINESS.address,
    contactPoint: PROACTIVITIS_LOCALBUSINESS.contactPoint
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: canonical,
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
    url: canonical,
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
        item: canonical
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
    canonical,
    override
  };
}

export default async function AdminSchemaManagerPage({ searchParams }: Props) {
  const resolved = searchParams ? await searchParams : undefined;
  const locale = resolved?.locale ?? "es";
  const search = resolved?.search?.trim() ?? "";
  const dynamicCombos = await getDynamicTransferLandingCombos();
  const allAvailableSlugs = Array.from(
    new Set([
      ...allLandings().map((item) => item.landingSlug),
      ...dynamicCombos.map((item) => item.landingSlug)
    ])
  ).sort((a, b) => a.localeCompare(b));
  const availableSlugs = search
    ? allAvailableSlugs.filter((slug) => normalizeSearch(slug).includes(normalizeSearch(search)))
    : allAvailableSlugs;
  const selectedSlug =
    resolved?.slug && availableSlugs.includes(resolved.slug) ? resolved.slug : availableSlugs[0] ?? "";
  const preview = selectedSlug ? await buildTransferSchemaPreview(selectedSlug, locale) : null;
  const override = preview?.override ?? null;
  const health = getSchemaHealthScore(override, preview?.graph ?? null);
  const warnings = getSchemaWarnings(override, preview?.graph ?? null);
  const faqDefaultValue = resolved?.faqDraft || stringifyFaqItems(override?.faqItems);
  const geminiReview = preview ? await getGeminiSchemaReview(preview.landing.landingSlug, locale) : null;

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">SEO</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Schema Manager</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Editor avanzado para transfers: identidad, oferta, frescura, FAQs, properties, geolocalizacion precisa y
          preview del JSON-LD final.
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

      <form method="GET" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <label className="text-sm text-slate-600 md:col-span-2">
          Buscar landing
          <input
            name="search"
            defaultValue={search}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
            placeholder="bahia, riu, puj-airport-to..."
          />
        </label>
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

      {search ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          {availableSlugs.length > 0
            ? `Mostrando ${availableSlugs.length} landings filtradas por "${search}".`
            : `No encontre landings para "${search}".`}
        </section>
      ) : null}

      {resolved?.gemini === "ok" ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm">
          Gemini reviso el schema y guardo el diagnostico para esta landing.
        </section>
      ) : null}

      {resolved?.gemini === "applied" ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm">
          Se aplicaron las overrideSuggestions de Gemini al editor de esta landing.
        </section>
      ) : null}

      {resolved?.gemini_error ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 shadow-sm">
          Gemini devolvio un error: {resolved.gemini_error}
        </section>
      ) : null}

      {preview ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {preview.originLabel} to {preview.destinationLabel}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Slug real: <span className="font-medium text-slate-700">{preview.landing.landingSlug}</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Canonical: <span className="font-medium text-slate-700">{preview.canonical}</span>
                </p>
              </div>
              <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Salud del schema</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${health.percentage >= 75 ? "bg-emerald-500" : health.percentage >= 45 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${health.percentage}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {health.percentage}% completo ({health.completed}/{health.total})
                </p>
              </div>
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
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Identifier actual</p>
                <p className="mt-2 font-semibold text-slate-900">{override?.identifier || preview.landing.landingSlug}</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Moneda</p>
                <p className="mt-2 font-semibold text-slate-900">{override?.priceCurrency || "USD"}</p>
              </article>
            </div>

            {warnings.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-700">Warnings</p>
                <div className="mt-3 space-y-2 text-sm text-amber-900">
                  {warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                El schema override cubre los campos clave de identidad, frescura y precision.
              </div>
            )}

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
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Editor avanzado</h2>
              <p className="mt-2 text-sm text-slate-600">
                Puedes guardar overrides solo para este locale o como capa global para todos los idiomas de la misma landing.
              </p>
            </div>
            <form action={saveTransferSchemaOverrideAction} className="space-y-6">
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
                  MainEntityOfPage
                  <input
                    name="main_entity_of_page"
                    defaultValue={override?.mainEntityOfPage ?? preview.canonical}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">1. Identity</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Identifier
                    <input name="identifier" defaultValue={override?.identifier ?? preview.landing.landingSlug} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Service name
                    <input name="service_name" defaultValue={override?.serviceName ?? preview.localizedLanding.heroTitle} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Service type
                    <input name="service_type" defaultValue={override?.serviceType ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Provider type
                    <input name="provider_type" defaultValue={override?.providerType ?? "TravelAgency"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Provider name
                    <input name="provider_name" defaultValue={override?.providerName ?? "Proactivitis"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Provider image/logo
                    <input name="provider_image" defaultValue={override?.providerImage ?? "https://proactivitis.com/logo.png"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm text-slate-600">
                    Provider telephone
                    <input name="provider_telephone" defaultValue={override?.providerTelephone ?? "+1-809-394-9877"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Provider email
                    <input name="provider_email" defaultValue={override?.providerEmail ?? "info@proactivitis.com"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Contact type
                    <input name="contact_type" defaultValue={override?.contactType ?? "Customer Service"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-5">
                  <label className="text-sm text-slate-600">
                    Street
                    <input name="street_address" defaultValue={override?.streetAddress ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    City
                    <input name="address_locality" defaultValue={override?.addressLocality ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Region
                    <input name="address_region" defaultValue={override?.addressRegion ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Postal code
                    <input name="postal_code" defaultValue={override?.postalCode ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Country
                    <input name="address_country" defaultValue={override?.addressCountry ?? "DO"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <label className="text-sm text-slate-600">
                  Description
                  <textarea name="description" rows={3} defaultValue={override?.description ?? preview.localizedLanding.metaDescription} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">2. Offer + Freshness</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="text-sm text-slate-600">
                    Offer name
                    <input name="offer_name" defaultValue={override?.offerName ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Price
                    <input name="price" defaultValue={override?.price ?? String(preview.localizedLanding.priceFrom)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Currency
                    <select name="price_currency" defaultValue={override?.priceCurrency ?? "USD"} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    Availability
                    <input name="availability" defaultValue={override?.availability ?? "https://schema.org/InStock"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="text-sm text-slate-600">
                    Price valid until
                    <input name="price_valid_until" defaultValue={override?.priceValidUntil ?? getPriceValidUntil()} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Last verified
                    <input name="last_verified" type="date" defaultValue={override?.lastVerified ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Price range
                    <input name="price_range" defaultValue={override?.priceRange ?? "$$"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Image object URL
                    <input name="image_object_url" defaultValue={override?.imageObjectUrl ?? String(preview.localizedLanding.heroImage)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <label className="text-sm text-slate-600">
                  Image object caption
                  <input name="image_object_caption" defaultValue={override?.imageObjectCaption ?? preview.localizedLanding.heroImageAlt} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </label>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">3. Ratings + Properties</h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                  Additional properties
                  <textarea
                    name="additional_properties"
                    rows={5}
                    defaultValue={stringifyAdditionalProperties(
                      override?.additionalProperties ?? [
                        { name: "WiFi", value: "Yes" },
                        { name: "Air Conditioning", value: "Premium" },
                        { name: "Baby Seat", value: "Available on request" }
                      ]
                    )}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="WiFi | Yes"
                  />
                </label>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">4. Geo Precision</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Origin name
                    <input name="origin_name" defaultValue={override?.originName ?? preview.originLabel} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Destination name
                    <input name="destination_name" defaultValue={override?.destinationName ?? preview.destinationLabel} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    Origin Place ID
                    <input name="origin_place_id" defaultValue={override?.originPlaceId ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Destination Place ID
                    <input name="destination_place_id" defaultValue={override?.destinationPlaceId ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="text-sm text-slate-600">
                    Origin lat
                    <input name="origin_latitude" defaultValue={override?.originLatitude ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Origin lng
                    <input name="origin_longitude" defaultValue={override?.originLongitude ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Destination lat
                    <input name="destination_latitude" defaultValue={override?.destinationLatitude ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                  <label className="text-sm text-slate-600">
                    Destination lng
                    <input name="destination_longitude" defaultValue={override?.destinationLongitude ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </label>
                </div>
                <label className="text-sm text-slate-600">
                  Area served
                  <textarea
                    name="area_served"
                    rows={3}
                    defaultValue={(override?.areaServed ?? []).join("\n")}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Punta Cana&#10;Santo Domingo"
                  />
                </label>
              </section>
              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">5. FAQ + Breadcrumbs</h3>
                  <button
                    formAction={generateTransferFaqDraftAction}
                    className="rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800"
                  >
                    Generate FAQ Draft
                  </button>
                </div>
                <label className="text-sm text-slate-600">
                  FAQ items
                  <textarea
                    name="faq_items"
                    rows={6}
                    defaultValue={faqDefaultValue}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Question | Answer | https://image.jpg | https://video"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  Breadcrumb items
                  <textarea
                    name="breadcrumb_items"
                    rows={4}
                    defaultValue={stringifyBreadcrumbItems(override?.breadcrumbItems)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="Name | https://proactivitis.com/path"
                  />
                </label>
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">6. Block Controls</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm text-slate-600">
                    Service block
                    <select name="service_enabled" defaultValue={override?.serviceEnabled === false ? "disabled" : "inherit"} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <option value="inherit">Automatico</option>
                      <option value="enabled">Forzar activo</option>
                      <option value="disabled">Desactivar</option>
                    </select>
                  </label>
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
              </section>

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">7. Advanced JSON</h3>
                <label className="text-sm text-slate-600">
                  Extra graph JSON
                  <textarea
                    name="extra_graph"
                    rows={6}
                    defaultValue={override?.extraGraph ? JSON.stringify(override.extraGraph, null, 2) : ""}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                    placeholder='[{"@type":"Product","name":"Extra block"}]'
                  />
                </label>
              </section>

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Guardar override
                </button>
                <button
                  type="submit"
                  formAction={reviewTransferSchemaWithGeminiAction}
                  className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
                >
                  Review with Gemini
                </button>
                <Link
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(preview.canonical)}`}
                  target="_blank"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Probar en Rich Results
                </Link>
              </div>

              <input type="hidden" name="page_url" value={preview.canonical} />
              <input type="hidden" name="page_title" value={preview.localizedLanding.heroTitle} />
              <input type="hidden" name="page_description" value={preview.localizedLanding.metaDescription} />
              <input type="hidden" name="schema_graph" value={JSON.stringify(preview.graph)} />
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

            {geminiReview ? (
              <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Gemini Review</p>
                    <h3 className="mt-1 text-lg font-semibold text-emerald-950">{geminiReview.summary}</h3>
                  </div>
                  <div className="text-xs text-emerald-800">
                    <p>Model: {geminiReview.model}</p>
                    <p>{new Date(geminiReview.generatedAt).toLocaleString("en-US")}</p>
                  </div>
                </div>

                {geminiReview.issues.length > 0 ? (
                  <div className="space-y-3">
                    {geminiReview.issues.map((issue, index) => (
                      <article key={`${issue.title}-${index}`} className="rounded-xl border border-emerald-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{issue.severity}</p>
                        <p className="mt-1 font-semibold text-slate-900">{issue.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{issue.detail}</p>
                      </article>
                    ))}
                  </div>
                ) : null}

                {geminiReview.recommendedChanges.length > 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Recommended changes</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      {geminiReview.recommendedChanges.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {geminiReview.overrideSuggestions ? (
                  <div className="rounded-xl border border-emerald-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Override suggestions</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Gemini fue instruido para rellenar todas las claves del editor. Si alguna viene vacia, la esta
                      marcando como no inferible de forma segura.
                    </p>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                      {JSON.stringify(geminiReview.overrideSuggestions, null, 2)}
                    </pre>
                    <form action={applyGeminiOverrideSuggestionsAction} className="mt-4">
                      <input type="hidden" name="slug" value={preview.landing.landingSlug} />
                      <input type="hidden" name="locale" value={locale} />
                      <button type="submit" className="rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">
                        Apply Gemini suggestions
                      </button>
                    </form>
                  </div>
                ) : null}

                {geminiReview.correctedGraph ? (
                  <div className="rounded-xl border border-emerald-200 bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Corrected graph suggested by Gemini</p>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-100">
                      {JSON.stringify(geminiReview.correctedGraph, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </section>
            ) : null}
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
