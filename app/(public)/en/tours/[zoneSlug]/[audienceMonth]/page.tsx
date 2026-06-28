import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import StructuredData from "@/components/schema/StructuredData";
import HybridTripPlanner from "@/components/public/HybridTripPlanner";
import {
  HYBRID_SEASON_COPY,
  buildHybridLandingMetadata,
  buildHybridLandingSchema,
  getHybridLanding,
  getHybridLandingStaticParams,
  getHybridTourProducts
} from "@/lib/hybridTripLandings";

type PageProps = {
  params: Promise<{ zoneSlug: string; audienceMonth: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return getHybridLandingStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { zoneSlug, audienceMonth } = await params;
  const landing = getHybridLanding(zoneSlug, audienceMonth);
  if (!landing) return { title: "Trip planner not found | Proactivitis", robots: { index: false, follow: false } };
  return buildHybridLandingMetadata(landing);
}

export default async function HybridTripLandingPage({ params }: PageProps) {
  const { zoneSlug, audienceMonth } = await params;
  const landing = getHybridLanding(zoneSlug, audienceMonth);
  if (!landing) notFound();

  const tours = await getHybridTourProducts(landing);
  const season = HYBRID_SEASON_COPY[landing.month.season];
  const schema = buildHybridLandingSchema(landing, tours);

  return (
    <main className="bg-white text-slate-950">
      <StructuredData data={schema} />
      <section className="relative min-h-[620px] overflow-hidden bg-slate-950 text-white">
        <Image
          src={landing.zone.heroImage}
          alt={landing.title}
          fill
          priority
          className="object-cover opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(2,6,23,0.76),rgba(2,6,23,0.22))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12 lg:py-20">
          <div className="flex min-h-[500px] flex-col justify-end">
            <p className="text-sm font-bold uppercase text-emerald-300">{landing.zone.transferType}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {landing.h1}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">{landing.metaDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plan" className="bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 hover:bg-emerald-300">
                Build package
              </a>
              <a href="#guide" className="border border-white/25 bg-white/10 px-6 py-4 text-sm font-black text-white hover:bg-white/15">
                Read travel guide
              </a>
            </div>
          </div>
          <aside className="self-end border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm font-bold uppercase text-slate-300">Best plan order</p>
            <div className="mt-5 space-y-4">
              <HeroFact label="1. Transfer" value={landing.zone.transferType} />
              <HeroFact label="2. Calendar" value={`${landing.month.label} stay dates`} />
              <HeroFact label="3. Tours" value={`${tours.length} recommended extras`} />
            </div>
          </aside>
        </div>
      </section>

      <section id="guide" className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-12">
        <article className="space-y-6">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-700">{landing.month.label} travel guide</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              What to expect in {landing.zone.mapName} for {landing.audience.label.toLowerCase()}
            </h2>
          </div>
          <p className="text-lg leading-8 text-slate-700">{landing.blogIntro}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <GuideBlock title="Weather and timing" body={season.climate} />
            <GuideBlock title="Tour filter for this month" body={season.tourFilter} />
          </div>
          <div className="border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-xl font-black text-slate-950">Practical planning notes</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              {landing.blogTips.map((tip) => (
                <li key={tip} className="border-l-4 border-emerald-400 pl-4">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </article>
        <aside className="h-fit border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-bold uppercase text-slate-500">Recommended mix</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{landing.zone.mapName}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{landing.zone.transferCopy}</p>
          <div className="mt-5 space-y-3">
            {tours.slice(0, 4).map((tour) => (
              <a key={tour.slug} href={`/tours/${tour.slug}`} className="block border border-slate-200 bg-white p-3 hover:border-emerald-300">
                <span className="block text-sm font-black text-slate-950">{tour.title}</span>
                <span className="mt-1 block text-sm text-emerald-700">From ${tour.price.toFixed(0)} USD</span>
              </a>
            ))}
          </div>
        </aside>
      </section>

      <HybridTripPlanner landing={landing} tours={tours} />
    </main>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function GuideBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
    </section>
  );
}
