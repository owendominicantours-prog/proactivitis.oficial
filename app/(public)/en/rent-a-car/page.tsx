import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  buildRentCarDescription,
  getRentCarLocations,
  getRentCarOptions,
  rentCarLastUpdate
} from "@/data/rentCarFleet";

export const runtime = "edge";
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Rent a Car by Travel Zone | Proactivitis",
  description:
    "Reserve rent-a-car options by exact travel zone with final Proactivitis prices, 2024/2025 model guarantee and VIP Support.",
  alternates: { canonical: "https://proactivitis.com/en/rent-a-car" }
};

export default function RentCarIndexPage() {
  const locations = getRentCarLocations();
  const featuredOptions = getRentCarOptions().slice(0, 8);
  const heroOption = featuredOptions[0];

  return (
    <main className="bg-[#eefafa] pb-12">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-700">Proactivitis rent a car</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Choose your car and reserve in minutes
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Select a real airport or destination area, pick a vehicle class, add pickup and return details, and let
              Proactivitis support confirm the rental.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-700">
                High-demand zones
              </span>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Model 2024/2025
              </span>
              <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                VIP Support
              </span>
            </div>
          </div>

          {heroOption ? (
            <Link
              href={heroOption.href}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-300/60 transition hover:-translate-y-1"
            >
              <div className="relative h-72 bg-white">
                <Image
                  src={heroOption.image}
                  alt={heroOption.model}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-contain p-7 transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">{heroOption.tag}</p>
                <h2 className="mt-2 text-2xl font-black">{heroOption.categoryLabel}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-300">{heroOption.model}</p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-3xl font-black">${heroOption.price}/day</p>
                  <span className="rounded-full bg-sky-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                    Reserve now
                  </span>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Select pickup zone</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Real availability by local area</h2>
            </div>
            <p className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
              Updated {rentCarLastUpdate}
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {locations.map((location) => {
              const options = getRentCarOptions(location.id);
              const topOption = options[0];
              return (
                <Link
                  key={location.id}
                  href={`/en/rent-a-car/${location.id}/${topOption?.categorySlug ?? "economy"}`}
                  className="group rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-sky-300 hover:bg-white hover:shadow-md"
                >
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{location.regionId}</p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">{location.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {options.length} vehicle classes near {location.airportLabel}, starting at ${topOption?.price ?? 0}/day.
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                    View fleet
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Vehicles ready to reserve</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Choose a vehicle that fits your trip</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredOptions.map((option) => (
              <Link
                key={`${option.locationId}-${option.categorySlug}`}
                href={option.href}
                className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
              >
                <div className="relative h-44 bg-slate-50">
                  <Image
                    src={option.image}
                    alt={option.model}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain p-5 transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-red-700 shadow">
                    Reserve today
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">{option.locationName}</p>
                  <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">{option.categoryLabel}</h3>
                  <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-500">{option.model}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{buildRentCarDescription(option)}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-2xl font-black text-slate-950">${option.price}/day</p>
                    <span className="rounded-full bg-sky-600 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                      Book
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
