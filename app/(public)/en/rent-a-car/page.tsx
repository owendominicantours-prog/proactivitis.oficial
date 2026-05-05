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
    "Dynamic rent-a-car catalog by exact travel zone: Punta Cana, Cap Cana, Santo Domingo, Santiago, La Romana, Puerto Plata and Samana with Proactivitis VIP Support.",
  alternates: { canonical: "https://proactivitis.com/en/rent-a-car" }
};

export default function RentCarIndexPage() {
  const locations = getRentCarLocations();
  const featuredOptions = getRentCarOptions().slice(0, 8);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">Proactivitis rent a car</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              Rent a car by exact travel zone
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Select a real airport or destination area. No generic country search, only available vehicles for the
              region you are planning to use.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">Fleet updated</p>
            <p className="mt-2 text-3xl font-black">{rentCarLastUpdate}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">2024/2025 model guarantee and VIP Support included.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
        <section className="grid gap-4 md:grid-cols-3">
          {locations.map((location) => {
            const options = getRentCarOptions(location.id);
            return (
              <article key={location.id} className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{location.regionId}</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">{location.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {options.length} vehicle classes available near {location.airportLabel}.
                </p>
                <Link
                  href={`/en/rent-a-car/${location.id}/${options[0]?.categorySlug ?? "economy"}`}
                  className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white"
                >
                  View local fleet
                </Link>
              </article>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Featured fleet</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Fast options with final Proactivitis Price</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredOptions.map((option) => (
              <Link
                key={`${option.locationId}-${option.categorySlug}`}
                href={option.href}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="relative h-40 bg-white">
                  <Image
                    src={option.image}
                    alt={option.model}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain p-5 transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">{option.tag}</p>
                  <h3 className="mt-2 text-base font-black text-slate-950">{option.categoryLabel}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{buildRentCarDescription(option)}</p>
                  <p className="mt-3 text-xl font-black text-slate-950">${option.price}/day</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
