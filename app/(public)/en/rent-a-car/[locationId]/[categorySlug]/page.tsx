import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RentCarLeadCard from "@/components/rentals/RentCarLeadCard";
import {
  buildRentCarDescription,
  buildRentCarH1,
  getRentCarJsonLd,
  getRentCarLocation,
  getRentCarLocations,
  getRentCarOption,
  getRentCarOptions
} from "@/data/rentCarFleet";

export const runtime = "edge";
export const revalidate = 86400;

type PageProps = {
  params: Promise<{ locationId: string; categorySlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locationId, categorySlug } = await params;
  const option = getRentCarOption(locationId, categorySlug);
  if (!option) return {};
  const title = `${buildRentCarH1(option)} | Proactivitis`;
  const description = buildRentCarDescription(option);
  return {
    title,
    description,
    alternates: {
      canonical: `https://proactivitis.com${option.href}`
    },
    openGraph: {
      title,
      description,
      url: `https://proactivitis.com${option.href}`,
      siteName: "Proactivitis",
      type: "website",
      images: [{ url: `https://proactivitis.com${option.image}` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://proactivitis.com${option.image}`]
    }
  };
}

export default async function RentCarDetailPage({ params }: PageProps) {
  const { locationId, categorySlug } = await params;
  const option = getRentCarOption(locationId, categorySlug);
  const location = getRentCarLocation(locationId);
  if (!option || !location) notFound();

  const localOptions = getRentCarOptions(locationId);
  const otherLocations = getRentCarLocations().filter((item) => item.id !== locationId).slice(0, 4);
  const schema = getRentCarJsonLd(option);
  const h1 = buildRentCarH1(option);
  const description = buildRentCarDescription(option);

  return (
    <main className="bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white">
                {option.regionId}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                Modelo 2024/2025 garantizado
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-sky-700">
                VIP Support
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{h1}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {[
                ["Vehicle", option.model],
                ["Seats", `${option.seats}`],
                ["Luggage", `${option.luggage}`],
                ["Airport", option.airportLabel]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <RentCarLeadCard option={option} />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative h-[320px] bg-slate-100 md:h-[460px]">
              <Image
                src={option.image}
                alt={option.model}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-contain p-8"
              />
            </div>
            <div className="border-t border-slate-100 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{option.tag}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{option.displayName}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                This page is generated from real fleet availability for {option.locationName}. The public price shown is
                the final Proactivitis Price with VIP Support included.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Why this vehicle</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Built for {option.locationName}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["Guaranteed class", "2024/2025 model or confirmed similar vehicle class."],
                ["VIP Support", "Proactivitis helps coordinate pickup, changes and local details."],
                ["Local logic", `Only vehicles available for ${location.name} are displayed here.`]
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Local fleet</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Other vehicles in {location.name}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {localOptions.map((item) => (
                <Link
                  key={item.categorySlug}
                  href={item.href}
                  className={`rounded-2xl border p-4 transition ${
                    item.categorySlug === option.categorySlug
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-950 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500">{item.tag}</p>
                  <h3 className="mt-2 text-sm font-black">{item.categoryLabel}</h3>
                  <p className="mt-1 text-xs opacity-75">{item.model}</p>
                  <p className="mt-3 text-lg font-black">${item.price}/day</p>
                </Link>
              ))}
            </div>
          </section>

        </main>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <RentCarLeadCard option={option} compact />
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Other regions</p>
            <div className="mt-3 grid gap-2">
              {otherLocations.map((item) => (
                <Link
                  key={item.id}
                  href={`/en/rent-a-car/${item.id}/${getRentCarOptions(item.id)[0]?.categorySlug ?? "economy"}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:border-slate-300"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
