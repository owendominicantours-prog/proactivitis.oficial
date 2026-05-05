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
  const facts = [
    ["Vehicle", option.model],
    ["Seats", `${option.seats} passengers`],
    ["Luggage", `${option.luggage} bags`],
    ["Airport", option.airportLabel]
  ];
  const benefits = [
    ["Free pickup coordination", "We confirm the pickup point, delivery time and local instructions before arrival."],
    ["2024/2025 model class", "The vehicle class is guaranteed, with a similar model only when required by fleet logistics."],
    ["VIP trip support", "Proactivitis support helps with flight changes, delays and rental questions during the trip."]
  ];

  return (
    <main className="bg-[#eefafa] pb-24 lg:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="space-y-7">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              <Link href="/en/rent-a-car" className="text-sky-700 hover:text-sky-900">
                Rent a car
              </Link>
              <span>/</span>
              <span>{location.name}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-700">
                High demand
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                Model 2024/2025
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-sky-700">
                VIP Support
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{h1}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700">
              <span className="text-slate-950">5.0 rating</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>100 verified rental requests</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Operated by Original Proactivitis</span>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
          </section>

          <section className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[120px_minmax(0,1fr)]">
            <div className="order-2 grid grid-cols-4 gap-2 md:order-1 md:grid-cols-1">
              {localOptions.slice(0, 4).map((item) => (
                <Link
                  key={item.categorySlug}
                  href={item.href}
                  className={`relative h-20 overflow-hidden rounded-2xl border bg-white transition md:h-24 ${
                    item.categorySlug === option.categorySlug
                      ? "border-slate-950 ring-2 ring-slate-950"
                      : "border-slate-200 hover:border-sky-300"
                  }`}
                >
                  <Image src={item.image} alt={item.model} fill sizes="120px" className="object-contain p-2" />
                </Link>
              ))}
            </div>
            <div className="order-1 overflow-hidden rounded-[1.5rem] bg-slate-100 md:order-2">
              <div className="relative h-[320px] md:h-[520px]">
                <Image
                  src={option.image}
                  alt={option.model}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-contain p-8"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950 shadow">
                  {option.categoryLabel}
                </div>
                <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/90 px-4 py-2 text-sm font-black text-white shadow">
                  ${option.price}/day
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
                <p className="mt-2 text-base font-black text-slate-950">{value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-700">What to expect</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">A rental flow built like a Proactivitis experience</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Choose the vehicle, set pickup and return details, add your flight number and send the request with all
              information ready. Support confirms the class, delivery instructions and next steps.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {benefits.map(([title, body]) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-base font-black text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Included</p>
                <ul className="mt-4 space-y-3 text-sm font-bold text-slate-700">
                  <li>Proactivitis VIP Support</li>
                  <li>Pickup and return coordination</li>
                  <li>Final Proactivitis Price per day</li>
                  <li>2024/2025 model class guarantee</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Before pickup</p>
                <ul className="mt-4 space-y-3 text-sm font-bold text-slate-700">
                  <li>Driver name and WhatsApp phone</li>
                  <li>Pickup date, return date and times</li>
                  <li>Flight number when arriving by airport</li>
                  <li>Valid driver license and card required by provider</li>
                </ul>
              </div>
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
                  className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    item.categorySlug === option.categorySlug ? "border-slate-950" : "border-slate-200"
                  }`}
                >
                  <div className="relative h-36 bg-slate-50">
                    <Image src={item.image} alt={item.model} fill sizes="240px" className="object-contain p-5" />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">{item.tag}</p>
                    <h3 className="mt-2 text-base font-black text-slate-950">{item.categoryLabel}</h3>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{item.model}</p>
                    <p className="mt-3 text-xl font-black text-slate-950">${item.price}/day</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">More regions</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {otherLocations.map((item) => (
                <Link
                  key={item.id}
                  href={`/en/rent-a-car/${item.id}/${getRentCarOptions(item.id)[0]?.categorySlug ?? "economy"}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:border-sky-300 hover:bg-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RentCarLeadCard option={option} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">From</p>
            <p className="text-xl font-black text-slate-950">${option.price}/day</p>
          </div>
          <a
            href="#rentcar-booking"
            className="rounded-full bg-sky-600 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            Reserve now
          </a>
        </div>
      </div>
    </main>
  );
}
