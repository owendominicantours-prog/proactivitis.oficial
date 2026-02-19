import type { Metadata } from "next";
import Link from "next/link";
import { landingPages, countryToPuntaCanaLandingSlugs } from "@/lib/landing";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import StructuredData from "@/components/schema/StructuredData";

const BASE_URL = "https://proactivitis.com";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return landingPages.map((landing) => ({ slug: landing.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolved = await params;
  const landing = landingPages.find((item) => item.slug === resolved.slug);
  if (!landing) {
    return {
      title: "Landing not found | Proactivitis",
      robots: { index: false, follow: false }
    };
  }

  const isCountryLanding = countryToPuntaCanaLandingSlugs.has(landing.slug);
  const canonical = `${BASE_URL}/landing/${landing.slug}`;
  const description =
    landing.metaDescription ??
    `${landing.title}. Plan excursions, transfers and resorts in Punta Cana with local support.`;

  return {
    title: `${landing.title} | Proactivitis`,
    description,
    alternates: { canonical },
    openGraph: {
      title: landing.title,
      description,
      url: canonical,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: landing.title,
      description
    },
    robots: {
      index: isCountryLanding,
      follow: true
    }
  };
}

const defaultExcursionPicks = [
  "Saona Island full-day boat experience",
  "Catamaran party boat with snorkeling",
  "ATV and buggy adventure routes",
  "Santo Domingo cultural city tour"
];

const defaultHotelPicks = [
  "All-inclusive resorts in Bavaro",
  "Luxury stays in Cap Cana",
  "Family resorts in Uvero Alto",
  "Adults-only premium options"
];

const defaultTransferPicks = [
  "Private airport transfer from PUJ",
  "Executive SUV transfer options",
  "Group transportation for families",
  "24/7 support and flight monitoring"
];

export default async function LandingPage({ params }: Params) {
  const resolvedParams = await params;
  const landing = landingPages.find((item) => item.slug === resolvedParams.slug);

  if (!landing) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-xl font-semibold text-slate-900">Landing not found</p>
      </div>
    );
  }

  const isCountryLanding = countryToPuntaCanaLandingSlugs.has(landing.slug);
  const canonical = `${BASE_URL}/landing/${landing.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: landing.title,
    description:
      landing.metaDescription ??
      `${landing.title}. Plan excursions, transfers and resorts in Punta Cana with local support.`,
    url: canonical
  };

  if (!isCountryLanding) {
    return (
      <div className="bg-slate-50 py-12">
        <LandingViewTracker landingSlug={landing.slug} />
        <div className="mx-auto max-w-6xl space-y-6 rounded-[36px] bg-white p-8 shadow-card">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">White Label</p>
          <h1 className="text-4xl font-bold text-slate-900">{landing.title}</h1>
          <p className="text-lg text-slate-500">{landing.tagline}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {landing.sections.map((section) => (
              <div key={section} className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
                {section}
              </div>
            ))}
          </div>
          <button className="rounded-2xl bg-brand px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-light">
            Request demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10">
      <LandingViewTracker landingSlug={landing.slug} />
      <StructuredData data={schema} />
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Punta Cana Sales Page</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">{landing.title}</h1>
              <p className="mt-4 max-w-3xl text-sm text-slate-100 md:text-base">{landing.tagline}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <Link
                  href="/tours"
                  className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Explore Excursions
                </Link>
                <Link
                  href="/hoteles"
                  className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Browse Resorts
                </Link>
                <Link
                  href="/traslado"
                  className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Book Transfers
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 self-end">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
                <p className="text-2xl font-bold">76+</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-200">Resorts</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-200">Support</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
                <p className="text-2xl font-bold">VIP</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-200">Transfers</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_0.9fr]">
            <input
              readOnly
              value={`Travelers from ${landing.country} to Punta Cana`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
            <input
              readOnly
              value="Flexible dates · Hotel + Excursions + Transfer"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
            <input
              readOnly
              value="2 Adults"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
            <input
              readOnly
              value="Punta Cana"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
            <Link
              href="/contact"
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Get Quote
            </Link>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Excursions</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{landing.country} travelers' top excursions</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {landing.excursionPitch ??
                      "Sell the strongest excursion portfolio with local operation support and clear conversion flow."}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {defaultExcursionPicks.map((item) => (
                      <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Best Seller Bundle</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Excursion + Transfer Package</p>
                  <p className="mt-2 text-sm text-slate-600">Custom itinerary with local assistant and fast confirmation.</p>
                  <Link
                    href="/tours"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    View Excursions
                  </Link>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Hotels</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Resorts and hotels in Punta Cana</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {landing.hotelPitch ??
                      "Position all-inclusive and premium resorts with practical guidance by area and traveler profile."}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {defaultHotelPicks.map((item) => (
                      <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Smart Match</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Resort by traveler profile</p>
                  <p className="mt-2 text-sm text-slate-600">Family, couples, premium, groups, and celebration trips.</p>
                  <Link
                    href="/hoteles"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Browse Hotels
                  </Link>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Transfers</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Airport transfers from PUJ</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {landing.transferPitch ??
                      "Convert arrivals with transfer-first planning and a direct support line before travel day."}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {defaultTransferPicks.map((item) => (
                      <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Transfer Ready</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Private & executive options</p>
                  <p className="mt-2 text-sm text-slate-600">Flight tracking, direct support and smooth arrival logistics.</p>
                  <Link
                    href="/traslado"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Book Transfer
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Buyer Angle</p>
              <p className="mt-3 text-sm text-slate-700">{landing.buyerAngle ?? landing.sections[0]}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Execution Notes</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {landing.sections.map((section) => (
                  <div key={section} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    {section}
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            {landing.country} to Punta Cana: sales execution framework
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {landing.sections.map((section) => (
              <div key={section} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                {section}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
