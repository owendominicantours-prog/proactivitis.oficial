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
  type RentCarFleetSettings,
  type RentCarLocale,
  type RentCarOption
} from "@/data/rentCarFleet";

type RentCarIndexPageProps = {
  locale?: RentCarLocale;
  settings?: RentCarFleetSettings;
};

type FilterItem = {
  label: string;
  from: number;
};

const getVehicleType = (option: RentCarOption) => {
  const label = `${option.categoryLabel} ${option.model}`.toLowerCase();
  if (label.includes("van") || label.includes("hiace") || label.includes("h-1")) return "Van";
  if (label.includes("suv") || label.includes("jeep") || label.includes("tahoe") || label.includes("suburban")) return "SUV";
  if (label.includes("convertible") || label.includes("mustang")) return "Convertible";
  if (label.includes("luxury") || label.includes("cadillac")) return "Luxury";
  if (label.includes("sedan") || label.includes("sonata") || label.includes("camry") || label.includes("corolla")) return "Sedan";
  return "Economy";
};

const minPriceFor = (options: RentCarOption[], predicate: (option: RentCarOption) => boolean) => {
  const prices = options.filter(predicate).map((option) => option.price);
  return prices.length ? Math.min(...prices) : 0;
};

const sortRentCarResults = (options: RentCarOption[]) =>
  [...options].sort((a, b) => {
    const premiumBoost = Number(b.highProfile) - Number(a.highProfile);
    if (premiumBoost) return premiumBoost;
    return a.price - b.price;
  });

const copyByLocale = {
  en: {
    h1: "Search cars",
    tabRent: "Rent a car",
    tabTransfer: "Airport transfer",
    pickup: "Pickup",
    returnLocation: "Return",
    pickupPlaceholder: "Airport, hotel or city",
    sameReturn: "Return to the same place",
    dates: "Dates",
    pickupTime: "Pickup time",
    returnTime: "Return time",
    search: "Search",
    map: "View map",
    filters: "Filter by",
    used: "Most used filters",
    type: "Car type",
    capacity: "Capacity",
    specs: "Specifications",
    price: "Total price",
    sort: "Recommended",
    results: "cars include taxes and local charges",
    loginTitle: "Sign in and save with Proactivitis member prices",
    loginCta: "Start session",
    reserve: "Reserve",
    from: "From",
    day: "day",
    terminal: "Airport or hotel pickup",
    unlimited: "Clean daily price",
    payPickup: "Pay after confirmation",
    cancel: "Free cancellation",
    online: "Online support",
    supplier: "Original Proactivitis",
    more: "View more",
    tipsTitle: "Car rental: tips and useful information",
    tipsIntro:
      "Choose by exact travel zone, vehicle size and luggage. Proactivitis confirms pickup instructions before the trip, so the rental is managed instead of improvised.",
    longTerm: "Long term car rental",
    longTermBody: "Reserve a weekly or monthly option with local pickup support.",
    airport: "Airport pickup",
    airportBody: "Arriving by flight? Combine rental timing with your arrival plan.",
    usefulTitle: "Discover more options for your next trip",
    national: "Rental car destinations",
    appTitle: "Move further with Proactivitis support",
    appBody: "A local team helps coordinate pickup, return and changes before the vehicle is delivered.",
    faq: [
      ["How much does it cost to rent a car?", "Prices depend on zone and vehicle class. Economy cars start lower, while SUV and luxury models increase by space, demand and service level."],
      ["Can I reserve without paying immediately?", "The request is sent with all trip details. Proactivitis confirms availability, class and final instructions before payment."],
      ["Do I need an airport flight number?", "Only if pickup is connected to an airport arrival. Hotel or address pickups do not need a flight number."],
      ["Can I choose a specific model?", "The listed model is the featured class. A similar 2024/2025 model may be confirmed when fleet logistics require it."]
    ]
  },
  es: {
    h1: "Busca autos",
    tabRent: "Renta de autos",
    tabTransfer: "Traslado al aeropuerto",
    pickup: "Entrega",
    returnLocation: "Devolucion",
    pickupPlaceholder: "Aeropuerto, hotel o ciudad",
    sameReturn: "Devolver en el mismo lugar",
    dates: "Fechas",
    pickupTime: "Hora entrega",
    returnTime: "Hora devolucion",
    search: "Buscar",
    map: "Ver mapa",
    filters: "Filtra por",
    used: "Filtros mas usados",
    type: "Tipo de auto",
    capacity: "Capacidad",
    specs: "Especificaciones",
    price: "Precio total",
    sort: "Recomendados",
    results: "autos incluyen impuestos y cargos locales",
    loginTitle: "Inicia sesion y accede a precios Proactivitis",
    loginCta: "Iniciar sesion",
    reserve: "Reservar",
    from: "Desde",
    day: "dia",
    terminal: "Recogida en aeropuerto u hotel",
    unlimited: "Precio diario claro",
    payPickup: "Paga despues de confirmar",
    cancel: "Cancelacion gratuita",
    online: "Soporte en linea",
    supplier: "Original Proactivitis",
    more: "Ver mas",
    tipsTitle: "Renta de autos: tips e informacion util",
    tipsIntro:
      "Elige por zona real, tamano del vehiculo y equipaje. Proactivitis confirma instrucciones de recogida antes del viaje para que la renta se sienta organizada, no improvisada.",
    longTerm: "Renta de autos a largo plazo",
    longTermBody: "Reserva una opcion semanal o mensual con soporte local de recogida.",
    airport: "Recogida en aeropuerto",
    airportBody: "Si llegas por vuelo, coordinamos horario y entrega con tu plan de llegada.",
    usefulTitle: "Descubre mas opciones para tu proximo viaje",
    national: "Destinos de renta de autos",
    appTitle: "Llega mas lejos con soporte Proactivitis",
    appBody: "Un equipo local ayuda a coordinar recogida, devolucion y cambios antes de entregar el vehiculo.",
    faq: [
      ["Cuanto cuesta rentar un auto?", "El precio depende de la zona y la clase. Los economy inician mas bajo; SUV y lujo suben por espacio, demanda y nivel de servicio."],
      ["Puedo reservar sin pagar de inmediato?", "La solicitud sale con todos los datos del viaje. Proactivitis confirma disponibilidad, clase e instrucciones finales antes del pago."],
      ["Necesito numero de vuelo?", "Solo si la recogida esta conectada a una llegada por aeropuerto. Hotel o direccion no necesitan vuelo."],
      ["Puedo elegir un modelo exacto?", "El modelo mostrado es la clase destacada. Puede confirmarse un 2024/2025 similar si la logistica de flota lo requiere."]
    ]
  },
  fr: {
    h1: "Rechercher des voitures",
    tabRent: "Location de voiture",
    tabTransfer: "Transfert aeroport",
    pickup: "Prise en charge",
    returnLocation: "Retour",
    pickupPlaceholder: "Aeroport, hotel ou ville",
    sameReturn: "Retour au meme endroit",
    dates: "Dates",
    pickupTime: "Heure de prise",
    returnTime: "Heure de retour",
    search: "Rechercher",
    map: "Voir carte",
    filters: "Filtrer par",
    used: "Filtres populaires",
    type: "Type de voiture",
    capacity: "Capacite",
    specs: "Specifications",
    price: "Prix total",
    sort: "Recommandes",
    results: "voitures avec taxes et frais locaux",
    loginTitle: "Connectez-vous pour acceder aux prix Proactivitis",
    loginCta: "Connexion",
    reserve: "Reserver",
    from: "A partir de",
    day: "jour",
    terminal: "Prise aeroport ou hotel",
    unlimited: "Prix journalier clair",
    payPickup: "Paiement apres confirmation",
    cancel: "Annulation gratuite",
    online: "Support en ligne",
    supplier: "Original Proactivitis",
    more: "Voir plus",
    tipsTitle: "Location de voiture: conseils utiles",
    tipsIntro:
      "Choisissez par zone exacte, taille du vehicule et bagages. Proactivitis confirme les instructions avant le voyage pour une location organisee.",
    longTerm: "Location longue duree",
    longTermBody: "Reservez une option hebdomadaire ou mensuelle avec support local.",
    airport: "Prise en charge aeroport",
    airportBody: "Si vous arrivez en vol, nous coordonnons l'heure et la livraison.",
    usefulTitle: "Plus d'options pour votre prochain voyage",
    national: "Destinations de location",
    appTitle: "Allez plus loin avec le support Proactivitis",
    appBody: "Une equipe locale aide a coordonner prise en charge, retour et changements.",
    faq: [
      ["Combien coute une location?", "Le prix depend de la zone et de la categorie. Economy est plus bas; SUV et luxe augmentent avec l'espace et la demande."],
      ["Puis-je reserver sans payer tout de suite?", "La demande part avec les details. Proactivitis confirme disponibilite, categorie et instructions avant paiement."],
      ["Le numero de vol est-il necessaire?", "Seulement si la prise en charge est liee a une arrivee aeroport. Hotel ou adresse n'en ont pas besoin."],
      ["Puis-je choisir un modele exact?", "Le modele affiche est la classe mise en avant. Un modele 2024/2025 similaire peut etre confirme selon la flotte."]
    ]
  }
} satisfies Record<RentCarLocale, Record<string, string | string[][]>>;

export default function RentCarIndexPage({ locale = "en", settings }: RentCarIndexPageProps) {
  const copy = getRentCarCopy(locale);
  const ui = copyByLocale[locale];
  const locations = getRentCarLocations(settings);
  const allOptions = getRentCarOptions(undefined, settings);
  const resultOptions = sortRentCarResults(allOptions).slice(0, 24);
  const priceFloor = allOptions.length ? Math.min(...allOptions.map((option) => option.price)) : 0;
  const defaultLocation = locations[0];
  const defaultHref = defaultLocation ? getRentCarLocationDefaultPath(defaultLocation.id, locale, settings) : getRentCarRootPathSafe(locale);
  const transferHref = locale === "es" ? "/transfer" : `/${locale}/transfer`;
  const vehicleTypes = ["Economy", "Sedan", "SUV", "Luxury", "Convertible", "Van"].map((label) => ({
    label,
    from: minPriceFor(allOptions, (option) => getVehicleType(option) === label)
  }));
  const usedFilters: FilterItem[] = [
    { label: ui.cancel as string, from: priceFloor },
    { label: ui.payPickup as string, from: priceFloor },
    { label: ui.terminal as string, from: priceFloor },
    { label: String(copy.modelGuarantee), from: priceFloor }
  ];
  const capacities: FilterItem[] = [
    { label: "2-4 passengers", from: minPriceFor(allOptions, (option) => option.seats <= 4) },
    { label: "5 passengers", from: minPriceFor(allOptions, (option) => option.seats === 5) },
    { label: "7+ passengers", from: minPriceFor(allOptions, (option) => option.seats >= 7) }
  ];
  const specs: FilterItem[] = [
    { label: "Automatic", from: minPriceFor(allOptions, (option) => option.transmission === "Automatic") },
    { label: "Hybrid", from: minPriceFor(allOptions, (option) => option.fuelType === "Hybrid") },
    { label: "4x4", from: minPriceFor(allOptions, (option) => option.fourByFour) },
    { label: "CarPlay / Android", from: minPriceFor(allOptions, (option) => option.appleCarplay || option.androidAuto) }
  ];
  const priceFilters: FilterItem[] = [
    { label: "$25 - $50", from: minPriceFor(allOptions, (option) => option.price >= 25 && option.price <= 50) },
    { label: "$50 - $100", from: minPriceFor(allOptions, (option) => option.price > 50 && option.price <= 100) },
    { label: "$100+", from: minPriceFor(allOptions, (option) => option.price > 100) }
  ];

  return (
    <main className="bg-[#eefafa] pb-12 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-700">{String(copy.eyebrow)}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{ui.h1 as string}</h1>

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
              <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
                {ui.tabRent as string}
              </span>
              <Link
                href={transferHref}
                className="rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
              >
                {ui.tabTransfer as string}
              </Link>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(260px,1.3fr)_minmax(180px,0.8fr)_minmax(170px,0.7fr)_130px_130px_110px]">
              <div className="lg:col-span-2">
                <RentCarSearch options={allOptions} locale={locale} />
              </div>
              <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{ui.dates as string}</span>
                <input type="text" placeholder="20 May - 21 May" className="mt-1 w-full bg-transparent text-sm font-black outline-none placeholder:text-slate-400" />
              </label>
              <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{ui.pickupTime as string}</span>
                <input type="text" placeholder="10:30 AM" className="mt-1 w-full bg-transparent text-sm font-black outline-none placeholder:text-slate-400" />
              </label>
              <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{ui.returnTime as string}</span>
                <input type="text" placeholder="10:30 AM" className="mt-1 w-full bg-transparent text-sm font-black outline-none placeholder:text-slate-400" />
              </label>
              <Link
                href={defaultHref}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700"
              >
                {ui.search as string}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">{ui.filters as string}</h2>
              <FilterGroup title={ui.used as string} items={usedFilters} />
              <FilterGroup title={ui.type as string} items={vehicleTypes} />
              <FilterGroup title={ui.capacity as string} items={capacities} />
              <FilterGroup title={ui.specs as string} items={specs} />
              <FilterGroup title={ui.price as string} items={priceFilters} />
            </div>
          </aside>

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[190px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
                <div className="h-28 bg-[linear-gradient(135deg,#d7f4ff,#f7fbff_45%,#c7ecdc)] p-3">
                  <div className="h-full rounded-2xl border border-white/70 bg-white/50 p-3">
                    <div className="h-2 w-20 rounded-full bg-sky-500/50" />
                    <div className="mt-4 h-2 w-28 rounded-full bg-emerald-600/50" />
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <span className="h-7 rounded-full bg-white shadow-sm" />
                      <span className="h-7 rounded-full bg-white shadow-sm" />
                      <span className="h-7 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                </div>
                <Link href="#rentcar-results" className="block px-4 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                  {ui.map as string}
                </Link>
              </div>

              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-300/50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-200">{String(copy.modelGuarantee)}</p>
                    <h2 className="mt-2 text-xl font-black">{ui.loginTitle as string}</h2>
                  </div>
                  <Link href="/login" className="rounded-full bg-sky-500 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white">
                    {ui.loginCta as string}
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-black text-slate-700">
                <span className="text-slate-950">{allOptions.length}</span> {ui.results as string}
              </p>
              <div className="flex flex-wrap gap-2">
                {locations.slice(0, 4).map((location) => (
                  <Link
                    key={location.id}
                    href={getRentCarLocationDefaultPath(location.id, locale, settings)}
                    className="rounded-full bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    {location.airportLabel}
                  </Link>
                ))}
                <span className="rounded-full border border-slate-200 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                  {ui.sort as string}
                </span>
              </div>
            </div>

            <div id="rentcar-results" className="space-y-3">
              {resultOptions.map((option) => (
                <RentCarResultCard key={`${option.locationId}-${option.categorySlug}`} option={option} locale={locale} />
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <Link
                href={defaultHref}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                {ui.more as string}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">{ui.tipsTitle as string}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{ui.tipsIntro as string}</p>
            <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
              {(ui.faq as string[][]).map(([question, answer]) => (
                <div key={question}>
                  <h3 className="text-base font-black text-slate-950">{question}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <InfoCard image="/transfer/sedan.png" title={ui.longTerm as string} body={ui.longTermBody as string} />
            <InfoCard image="/transfer/suv.png" title={ui.airport as string} body={ui.airportBody as string} />
          </div>
        </div>

        <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{ui.usefulTitle as string}</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">{ui.national as string}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={getRentCarLocationDefaultPath(location.id, locale, settings)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:border-sky-300 hover:bg-white"
              >
                {location.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm md:grid-cols-[360px_minmax(0,1fr)]">
          <div className="relative min-h-56 bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
            <Image src="/transfer/suv.png" alt="Proactivitis rent a car" fill sizes="360px" className="object-contain p-4 scale-[1.12]" />
          </div>
          <div className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Proactivitis VIP</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{ui.appTitle as string}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{ui.appBody as string}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function getRentCarRootPathSafe(locale: RentCarLocale) {
  return locale === "es" ? "/rent-a-car" : `/${locale}/rent-a-car`;
}

function FilterGroup({ title, items }: { title: string; items: FilterItem[] }) {
  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <label key={item.label} className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-slate-700">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-4 w-4 shrink-0 rounded border border-slate-300 bg-white" />
              <span className="truncate">{item.label}</span>
            </span>
            {item.from ? <span className="shrink-0 text-xs font-black text-slate-400">${item.from}</span> : null}
          </label>
        ))}
      </div>
    </div>
  );
}

function RentCarResultCard({ option, locale }: { option: RentCarOption; locale: RentCarLocale }) {
  const copy = getRentCarCopy(locale);
  const ui = copyByLocale[locale];
  const specs = getRentCarSpecBadges(option, locale);
  const href = getRentCarOptionPath(option.locationId, option.categorySlug, locale);
  const benefits = [ui.cancel, ui.online, ui.payPickup].map(String);

  return (
    <Link
      href={href}
      className="group grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-200/70 md:grid-cols-[210px_minmax(0,1fr)_155px]"
    >
      <div className="relative h-44 overflow-hidden rounded-[1.2rem] bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)] md:h-36">
        <div className="absolute inset-x-[18%] bottom-[12%] h-[12%] rounded-full bg-black/20 blur-[16px]" />
        <Image
          src={option.image}
          alt={option.model}
          fill
          sizes="(max-width: 768px) 100vw, 210px"
          className="object-contain p-0 scale-[1.18] transition duration-500 group-hover:scale-[1.23]"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-700 shadow">
          {option.airportLabel}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-black leading-tight text-slate-950">{option.categoryLabel}</h3>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
            {option.tag}
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-600">{option.model} or similar</p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{option.locationName}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
          {specs.slice(0, 5).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="mt-3 grid gap-1 text-xs font-bold text-emerald-700 sm:grid-cols-2">
          {benefits.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span>{ui.terminal as string}</span>
        </div>
        <p className="mt-3 text-[11px] font-bold text-slate-500">{ui.supplier as string}</p>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-4 md:pt-0">
        <div className="text-left md:text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{ui.from as string}</p>
          <p className="text-3xl font-black text-slate-950">${option.price}</p>
          <p className="text-xs font-bold text-slate-500">/{ui.day as string}</p>
        </div>
        <span className="rounded-full bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-sky-100 transition group-hover:bg-sky-700">
          {ui.reserve as string}
        </span>
      </div>
    </Link>
  );
}

function InfoCard({ image, title, body }: { image: string; title: string; body: string }) {
  return (
    <div className="grid overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-1">
      <div className="relative min-h-32 bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
        <Image src={image} alt={title} fill sizes="240px" className="object-contain p-3 scale-[1.12]" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}
