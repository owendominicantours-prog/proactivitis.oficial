import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RentCarLeadCard from "@/components/rentals/RentCarLeadCard";
import {
  buildRentCarDescription,
  buildRentCarH1,
  getRentCarCopy,
  getRentCarJsonLd,
  getRentCarLocation,
  getRentCarLocationDefaultPath,
  getRentCarLocations,
  getRentCarOption,
  getRentCarOptionPath,
  getRentCarOptions,
  getRentCarRootPath,
  type RentCarLocale
} from "@/data/rentCarFleet";

type RentCarDetailPageProps = {
  locationId: string;
  categorySlug: string;
  locale?: RentCarLocale;
};

export default function RentCarDetailPage({ locationId, categorySlug, locale = "en" }: RentCarDetailPageProps) {
  const option = getRentCarOption(locationId, categorySlug);
  const location = getRentCarLocation(locationId);
  if (!option || !location) notFound();

  const copy = getRentCarCopy(locale);
  const localOptions = getRentCarOptions(locationId);
  const otherLocations = getRentCarLocations().filter((item) => item.id !== locationId).slice(0, 4);
  const schema = getRentCarJsonLd(option, locale);
  const h1 = buildRentCarH1(option, locale);
  const description = buildRentCarDescription(option, locale);
  const factsLabels = copy.facts as string[];
  const facts = [
    [factsLabels[0], option.model],
    [factsLabels[1], `${option.seats} ${String(copy.passengers)}`],
    [factsLabels[2], `${option.luggage} ${String(copy.bags)}`],
    [factsLabels[3], option.airportLabel]
  ];
  const benefits =
    locale === "es"
      ? [
          ["Recogida coordinada", "Confirmamos punto, horario e instrucciones locales antes de la entrega."],
          ["Categoria 2024/2025", "La clase del vehiculo queda confirmada; modelo similar solo si la logistica lo requiere."],
          ["Soporte VIP", "Te acompanamos con dudas, cambios de horario y detalles de recogida durante el viaje."]
        ]
      : locale === "fr"
        ? [
            ["Prise en charge coordonnee", "Nous confirmons le point, l'heure et les instructions locales avant la livraison."],
            ["Categorie 2024/2025", "La classe du vehicule est confirmee; modele similaire seulement si necessaire."],
            ["Support VIP", "Aide pour questions, changements d'horaire et details de prise en charge."]
          ]
        : [
            ["Pickup coordination", "We confirm the pickup point, delivery time and local instructions before arrival."],
            ["2024/2025 model class", "The vehicle class is guaranteed, with a similar model only when required by fleet logistics."],
            ["VIP trip support", "Proactivitis support helps with schedule changes, pickup details and rental questions during the trip."]
          ];
  const includedItems =
    locale === "es"
      ? ["Soporte VIP Proactivitis", "Coordinacion de recogida y devolucion", "Precio final Proactivitis por dia", "Garantia de categoria modelo 2024/2025"]
      : locale === "fr"
        ? ["Support VIP Proactivitis", "Coordination prise en charge et retour", "Prix final Proactivitis par jour", "Categorie modele 2024/2025 garantie"]
        : ["Proactivitis VIP Support", "Pickup and return coordination", "Final Proactivitis Price per day", "2024/2025 model class guarantee"];
  const beforePickupItems =
    locale === "es"
      ? ["Nombre del conductor y WhatsApp", "Fechas y horas de recogida y devolucion", "Vuelo solo si la recogida es llegada por aeropuerto", "Licencia valida y tarjeta requerida por el proveedor"]
      : locale === "fr"
        ? ["Nom du conducteur et WhatsApp", "Dates et heures de prise et retour", "Vol seulement si arrivee par aeroport", "Permis valide et carte requis par le fournisseur"]
        : ["Driver name and WhatsApp phone", "Pickup date, return date and times", "Flight only when pickup is airport arrival", "Valid driver license and card required by provider"];

  return (
    <main className="bg-[#eefafa] pb-24 lg:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="space-y-7">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              <Link href={getRentCarRootPath(locale)} className="text-sky-700 hover:text-sky-900">
                {String(copy.breadcrumb)}
              </Link>
              <span>/</span>
              <span>{location.name}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-700">
                {String(copy.highDemand)}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                {String(copy.modelGuarantee)}
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-sky-700">
                {String(copy.vipSupport)}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{h1}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700">
              <span className="text-slate-950">{String(copy.rating)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{String(copy.requests)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{String(copy.operated)}</span>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
          </section>

          <section className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[120px_minmax(0,1fr)]">
            <div className="order-2 grid grid-cols-4 gap-2 md:order-1 md:grid-cols-1">
              {localOptions.slice(0, 4).map((item) => (
                <Link
                  key={item.categorySlug}
                  href={getRentCarOptionPath(item.locationId, item.categorySlug, locale)}
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
            <div className="order-1 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-white via-sky-50 to-emerald-50 md:order-2">
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
                <div className="absolute bottom-4 right-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow">
                  ${option.price}/{String(copy.day)}
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
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-700">{String(copy.expectEyebrow)}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{String(copy.expectTitle)}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{String(copy.expectBody)}</p>
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
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{String(copy.included)}</p>
                <ul className="mt-4 space-y-3 text-sm font-bold text-slate-700">
                  {includedItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{String(copy.beforePickup)}</p>
                <ul className="mt-4 space-y-3 text-sm font-bold text-slate-700">
                  {beforePickupItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{String(copy.localFleet)}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{location.name}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {localOptions.map((item) => (
                <Link
                  key={item.categorySlug}
                  href={getRentCarOptionPath(item.locationId, item.categorySlug, locale)}
                  className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    item.categorySlug === option.categorySlug ? "border-slate-950" : "border-slate-200"
                  }`}
                >
                  <div className="relative h-36 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
                    <Image src={item.image} alt={item.model} fill sizes="240px" className="object-contain p-5" />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">{item.tag}</p>
                    <h3 className="mt-2 text-base font-black text-slate-950">{item.categoryLabel}</h3>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{item.model}</p>
                    <p className="mt-3 text-xl font-black text-emerald-700">${item.price}/{String(copy.day)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{String(copy.otherRegions)}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {otherLocations.map((item) => (
                <Link
                  key={item.id}
                  href={getRentCarLocationDefaultPath(item.id, locale)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:border-sky-300 hover:bg-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RentCarLeadCard option={option} locale={locale} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{String(copy.from)}</p>
            <p className="text-xl font-black text-emerald-700">${option.price}/{String(copy.day)}</p>
          </div>
          <a
            href="#rentcar-booking"
            className="rounded-full bg-sky-600 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
          >
            {String(copy.reserveNow)}
          </a>
        </div>
      </div>
    </main>
  );
}
