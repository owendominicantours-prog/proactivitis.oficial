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
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-200">International Market Landing</p>
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
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Buyer Angle</p>
            <p className="mt-3 text-sm text-slate-700">{landing.buyerAngle ?? landing.sections[0]}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Hotel Strategy</p>
            <p className="mt-3 text-sm text-slate-700">{landing.hotelPitch ?? landing.sections[1]}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Excursion Sales</p>
            <p className="mt-3 text-sm text-slate-700">{landing.excursionPitch ?? landing.sections[2]}</p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Excursions in Punta Cana</h2>
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
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Resorts and Hotels</h2>
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
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Airport Transfers</h2>
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
          </article>
        </section>

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

