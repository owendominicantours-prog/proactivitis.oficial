import Image from "next/image";
import Link from "next/link";
import { detectRentCarLocationId, getRentCarOptionPath, getRentCarOptions } from "@/data/rentCarFleet";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";

type RentCarWidgetProps = {
  regionText?: string;
  locationId?: string;
  title?: string;
  compact?: boolean;
  locale?: "es" | "en" | "fr";
};

export default async function RentCarWidget({ regionText = "", locationId, title, compact = false, locale = "en" }: RentCarWidgetProps) {
  const settings = await getRentCarFleetSettings();
  const resolvedLocationId = locationId ?? detectRentCarLocationId(regionText, settings);
  const options = getRentCarOptions(resolvedLocationId, settings).slice(0, compact ? 2 : 3);
  if (!options.length) return null;

  const locationName = options[0].locationName;
  const copy = {
    eyebrow: locale === "es" ? "Alquiler de vehiculos" : locale === "fr" ? "Location de voiture" : "Rent a car",
    fallbackTitle:
      locale === "es"
        ? `Vehiculos disponibles en ${locationName}`
        : locale === "fr"
          ? `Voitures disponibles a ${locationName}`
          : `Car rental options in ${locationName}`,
    body:
      locale === "es"
        ? "Opciones rapidas con soporte VIP Proactivitis y garantia de modelo 2024/2025."
        : locale === "fr"
          ? "Options rapides avec support VIP Proactivitis et modele 2024/2025 garanti."
          : "Fast vehicle options with Proactivitis VIP Support and 2024/2025 model guarantee.",
    cta: locale === "es" ? "Ver flota" : locale === "fr" ? "Voir flotte" : "View fleet",
    day: locale === "es" ? "dia" : locale === "fr" ? "jour" : "day"
  };

  return (
    <section className={compact ? "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" : "rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{copy.eyebrow}</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {title ?? copy.fallbackTitle}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {copy.body}
          </p>
        </div>
        <Link
          href={getRentCarOptionPath(resolvedLocationId, options[0].categorySlug, locale)}
          className="hidden rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white sm:inline-flex"
        >
          {copy.cta}
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {options.map((option) => (
          <Link
            key={`${option.locationId}-${option.categorySlug}`}
            href={getRentCarOptionPath(option.locationId, option.categorySlug, locale)}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-emerald-200 hover:bg-emerald-50"
          >
            <div className="relative h-28 bg-white">
              <Image
                src={option.image}
                alt={option.model}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4 transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">{option.tag}</p>
              <h3 className="mt-1 line-clamp-1 text-sm font-black text-slate-950">{option.categoryLabel}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{option.model}</p>
              <p className="mt-2 text-sm font-black text-slate-950">${option.price}/{copy.day}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
