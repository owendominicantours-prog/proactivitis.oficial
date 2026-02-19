import type { Metadata } from "next";
import Link from "next/link";
import { landingPages, countryToPuntaCanaLandingSlugs } from "@/lib/landing";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";

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

const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();

const shorten = (value: string, max = 150) => {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const sliced = text.slice(0, max);
  const cut = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, cut > 70 ? cut : max)}...`;
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    const parsed = JSON.parse(gallery);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item)).filter(Boolean);
  } catch {
    return [];
  }
};

const resolveTourImage = (heroImage?: string | null, gallery?: string | null) =>
  heroImage || parseGallery(gallery)[0] || "/fototours/fotosimple.jpg";

const countryHash = (country: string) =>
  country.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const pickWindow = <T,>(items: T[], count: number, seed: string) => {
  if (items.length <= count) return items;
  const start = countryHash(seed) % items.length;
  const result: T[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push(items[(start + i) % items.length] as T);
  }
  return result;
};

const getCountryProfile = (country: string) => {
  const key = country.toLowerCase();
  if (["united states", "canada", "united kingdom"].includes(key)) {
    return {
      buyerPersona: "High planning behavior with premium service expectations and fast response demand.",
      packageIntent: "Most requested bundle: all-inclusive resort + airport transfer + 2 premium excursions.",
      bookingWindow: "Average planning window: 20-45 days before travel."
    };
  }
  if (["spain", "france", "germany", "italy", "portugal"].includes(key)) {
    return {
      buyerPersona: "Experience-first travelers focused on quality curation and transparent logistics.",
      packageIntent: "Most requested bundle: curated hotel shortlist + sea excursions + private mobility.",
      bookingWindow: "Average planning window: 25-50 days before travel."
    };
  }
  if (["mexico", "colombia", "argentina", "chile", "peru", "ecuador", "panama"].includes(key)) {
    return {
      buyerPersona: "Value-oriented buyers with strong interest in complete planning and flexible support.",
      packageIntent: "Most requested bundle: hotel + transfer + activity mix for family and social travel.",
      bookingWindow: "Average planning window: 12-30 days before travel."
    };
  }
  return {
    buyerPersona: "Travelers looking for trusted local support and smooth end-to-end execution.",
    packageIntent: "Most requested bundle: resort + airport transfer + top-rated excursions.",
    bookingWindow: "Average planning window: 10-35 days before travel."
  };
};

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

  const [tourRows, hotelRows] = await Promise.all([
    prisma.tour.findMany({
      where: { status: "published" },
      select: {
        slug: true,
        title: true,
        heroImage: true,
        gallery: true,
        shortDescription: true,
        description: true,
        price: true,
        duration: true
      },
      orderBy: { createdAt: "desc" },
      take: 80
    }),
    prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { slug: true, name: true, heroImage: true, description: true, zone: { select: { name: true } } },
      orderBy: { name: "asc" },
      take: 120
    })
  ]);

  const transferRows = allLandings();
  const selectedTours = pickWindow(tourRows, 6, `${landing.country}-tours`);
  const selectedHotels = pickWindow(hotelRows, 6, `${landing.country}-hotels`);
  const selectedTransfers = pickWindow(transferRows, 6, `${landing.country}-transfers`);
  const profile = getCountryProfile(landing.country ?? "international");

  return (
    <div className="bg-slate-50 py-10">
      <LandingViewTracker landingSlug={landing.slug} />
      <StructuredData data={schema} />
      <div className="mx-auto max-w-7xl space-y-8 px-4">
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
                <p className="text-2xl font-bold">{hotelRows.length}+</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-200">Resorts</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
                <p className="text-2xl font-bold">{tourRows.length}+</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-200">Tours</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-200">Support</p>
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Excursions</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{landing.country} travelers top excursions</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {landing.excursionPitch ??
                      "Sell the strongest excursion portfolio with local operation support and clear conversion flow."}
                  </p>
                </div>
                <Link href="/tours" className="text-sm font-semibold text-slate-700 underline underline-offset-4">
                  View all
                </Link>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectedTours.map((tour) => (
                  <Link
                    key={tour.slug}
                    href={`/tours/${tour.slug}`}
                    className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="h-40 w-full">
                      <img src={resolveTourImage(tour.heroImage, tour.gallery)} alt={tour.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{tour.title}</h3>
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {shorten(tour.shortDescription || tour.description || "Punta Cana excursion with local support.")}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{tour.duration || "Flexible duration"}</span>
                        <span className="font-semibold text-slate-900">From ${Math.round(tour.price || 0)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Hotels</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Resorts and hotels in Punta Cana</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {landing.hotelPitch ??
                      "Position all-inclusive and premium resorts with practical guidance by area and traveler profile."}
                  </p>
                </div>
                <Link href="/hoteles" className="text-sm font-semibold text-slate-700 underline underline-offset-4">
                  View all
                </Link>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectedHotels.map((hotel) => (
                  <Link
                    key={hotel.slug}
                    href={`/hoteles/${hotel.slug}`}
                    className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="h-40 w-full">
                      <img src={hotel.heroImage || "/transfer/mini van.png"} alt={hotel.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{hotel.name}</h3>
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {shorten(hotel.description || "All-inclusive and premium hotel option in Punta Cana.")}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{hotel.zone?.name || "Punta Cana"}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">Available</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Transfers</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Airport transfer routes from PUJ</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {landing.transferPitch ??
                      "Convert arrivals with transfer-first planning and a direct support line before travel day."}
                  </p>
                </div>
                <Link href="/traslado" className="text-sm font-semibold text-slate-700 underline underline-offset-4">
                  View all
                </Link>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectedTransfers.map((transfer) => (
                  <Link
                    key={transfer.landingSlug}
                    href={`/transfer/${transfer.landingSlug}`}
                    className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="h-40 w-full">
                      <img
                        src={transfer.heroImage || "/transfer/mini van.png"}
                        alt={transfer.heroImageAlt || transfer.hotelName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{transfer.hotelName}</h3>
                      <p className="line-clamp-2 text-sm text-slate-600">{shorten(transfer.heroSubtitle || transfer.heroTagline)}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>PUJ route</span>
                        <span className="font-semibold text-slate-900">From ${transfer.priceFrom}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Buyer Angle</p>
              <p className="mt-3 text-sm text-slate-700">{landing.buyerAngle ?? landing.sections[0]}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Market Profile: {landing.country}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">{profile.buyerPersona}</div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">{profile.packageIntent}</div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">{profile.bookingWindow}</div>
              </div>
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
      </div>
    </div>
  );
}
