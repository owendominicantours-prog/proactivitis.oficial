import Image from "next/image";
import Link from "next/link";
import RentCarSearch from "@/components/rentals/RentCarSearch";
import {
  getRentCarCopy,
  getRentCarLocationDefaultPath,
  getRentCarLocations,
  getRentCarOptionPath,
  getRentCarOptions,
  getRentCarSpecBadges,
  rentCarLastUpdate,
  type RentCarFleetSettings,
  type RentCarLocale
} from "@/data/rentCarFleet";

type RentCarIndexPageProps = {
  locale?: RentCarLocale;
  settings?: RentCarFleetSettings;
};

export default function RentCarIndexPage({ locale = "en", settings }: RentCarIndexPageProps) {
  const copy = getRentCarCopy(locale);
  const locations = getRentCarLocations(settings);
  const allOptions = getRentCarOptions(undefined, settings);
  const featuredOptions = allOptions.slice(0, 8);
  const heroOption = featuredOptions[0];
  const ui =
    locale === "es"
      ? { vehicles: "vehiculos", available: "disponibles", bestFrom: "Desde", fleet: "Ver flota", airport: "Aeropuerto", topClass: "Clase destacada" }
      : locale === "fr"
        ? { vehicles: "vehicules", available: "disponibles", bestFrom: "A partir de", fleet: "Voir flotte", airport: "Aeroport", topClass: "Classe en vedette" }
        : { vehicles: "vehicles", available: "available", bestFrom: "From", fleet: "View fleet", airport: "Airport", topClass: "Featured class" };

  return (
    <main className="bg-[#eefafa] pb-12">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-700">{String(copy.eyebrow)}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              {String(copy.heroTitle)}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{String(copy.heroBody)}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-700">
                {String(copy.highDemand)}
              </span>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                {String(copy.modelGuarantee)}
              </span>
              <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                {String(copy.vipSupport)}
              </span>
            </div>
            <div className="mt-6 max-w-2xl">
              <RentCarSearch options={allOptions} locale={locale} />
            </div>
          </div>

          {heroOption ? (
            <Link
              href={getRentCarOptionPath(heroOption.locationId, heroOption.categorySlug, locale)}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-300/60 transition hover:-translate-y-1"
            >
              <div className="relative h-80 overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
                <div className="absolute inset-x-[18%] bottom-[12%] h-[12%] rounded-full bg-black/20 blur-[18px] transition duration-300 group-hover:bg-black/25" />
                <Image
                  src={heroOption.image}
                  alt={heroOption.model}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 430px"
                  className="object-contain p-5 transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">{heroOption.tag}</p>
                <h2 className="mt-2 text-2xl font-black">{heroOption.categoryLabel}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-300">{heroOption.model}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {getRentCarSpecBadges(heroOption, locale).slice(0, 4).map((item) => (
                    <span key={item} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-100">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-3xl font-black text-emerald-300">
                    ${heroOption.price}/{String(copy.day)}
                  </p>
                  <span className="rounded-full bg-sky-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                    {String(copy.reserveNow)}
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
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{String(copy.zonesTitle)}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{String(copy.zonesBody)}</h2>
            </div>
            <p className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
              {String(copy.updated)} {settings?.lastUpdate ?? rentCarLastUpdate}
            </p>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((location) => {
              const options = getRentCarOptions(location.id, settings);
              const topOption = options[0];
              const regionLabel = location.regionId
                .split("_")
                .slice(1)
                .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
                .join(" ");
              return (
                <Link
                  key={location.id}
                  href={getRentCarLocationDefaultPath(location.id, locale, settings)}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm ring-1 ring-white transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-2xl hover:shadow-slate-200/70"
                >
                  <div className="relative h-56 overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
                    <div className="absolute inset-x-[18%] bottom-[12%] h-[12%] rounded-full bg-black/20 blur-[18px] transition duration-300 group-hover:bg-black/25" />
                    {topOption ? (
                      <Image
                        src={topOption.image}
                        alt={topOption.model}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-5 transition duration-500 group-hover:scale-[1.035]"
                      />
                    ) : null}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-sky-700 shadow-sm">
                        {location.airportLabel}
                      </span>
                      <span className="rounded-full bg-slate-950/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-sm">
                        {ui.airport}
                      </span>
                    </div>
                    {topOption ? (
                      <div className="absolute bottom-4 right-4 rounded-2xl bg-white/95 px-4 py-3 text-right shadow-lg shadow-slate-300/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{ui.bestFrom}</p>
                        <p className="text-2xl font-black text-emerald-700">${topOption.price}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="border-t border-slate-100 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">{regionLabel}</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{location.name}</h3>
                    {topOption ? (
                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {ui.topClass}: <span className="text-slate-900">{topOption.model}</span>
                      </p>
                    ) : null}
                    {topOption ? (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {getRentCarSpecBadges(topOption, locale).slice(0, 4).map((item) => (
                          <span key={item} className="rounded-full bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-slate-600">
                        <span className="text-lg text-slate-950">{options.length}</span> {ui.vehicles} {ui.available}
                      </p>
                      <span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm transition group-hover:bg-sky-700">
                        {ui.fleet}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{String(copy.vehiclesTitle)}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{String(copy.vehiclesBody)}</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredOptions.map((option) => (
              <Link
                key={`${option.locationId}-${option.categorySlug}`}
                href={getRentCarOptionPath(option.locationId, option.categorySlug, locale)}
                className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-2xl hover:shadow-slate-200/70"
              >
                <div className="relative h-56 overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
                  <div className="absolute inset-x-[18%] bottom-[12%] h-[12%] rounded-full bg-black/20 blur-[18px] transition duration-300 group-hover:bg-black/25" />
                  <Image
                    src={option.image}
                    alt={option.model}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain p-5 transition duration-500 group-hover:scale-[1.035]"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-red-700 shadow">
                    {String(copy.reserveNow)}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-2xl bg-white/95 px-3 py-2 text-lg font-black text-emerald-700 shadow">
                    ${option.price}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">{option.locationName}</p>
                  <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">{option.categoryLabel}</h3>
                  <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-500">{option.model}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {getRentCarSpecBadges(option, locale).slice(0, 6).map((item) => (
                      <span key={item} className="rounded-full bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-500">
                      {String(copy.from)} <span className="text-xl text-emerald-700">${option.price}</span>/{String(copy.day)}
                    </p>
                    <span className="rounded-full bg-sky-600 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                      {String(copy.book)}
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
