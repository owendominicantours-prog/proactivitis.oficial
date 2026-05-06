import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
  getRentCarSpecBadges,
  type RentCarFleetSettings,
  type RentCarLocale
} from "@/data/rentCarFleet";

type RentCarDetailPageProps = {
  locationId: string;
  categorySlug: string;
  locale?: RentCarLocale;
  settings?: RentCarFleetSettings;
};

const labelsByLocale = {
  en: {
    back: "View all cars",
    save: "Save",
    summary: "Summary",
    location: "Location",
    insurance: "Insurance",
    policies: "Policies",
    similar: "or similar",
    airportDesk: "Airport or hotel delivery",
    score: "verified rental requests",
    ratingDetails: "View rating details",
    memberTitle: "Sign in and reserve to keep this rental organized in your Proactivitis account",
    signIn: "Sign in",
    freeCancel: "Free cancellation",
    freeCancelBody: "Hold today's price and cancel if your plans change. No upfront payment is collected here.",
    supplierLocation: "Supplier location",
    pickupReturn: "Pickup and return",
    hours: "Daily delivery window",
    terminal: "Airport counter or coordinated hotel delivery",
    requirements: "Pickup requirements",
    license: "Valid driver license",
    card: "Card may be required by the local provider for deposit policies.",
    protectTitle: "Protecting your rental gives you more peace of mind",
    protectBody: "Optional protection can be added during final confirmation if the local provider offers it.",
    policyTitle: "Rental policies",
    cancelPolicy: "Cancellation and no-show policy",
    agePolicy: "Driver age policy",
    includesTitle: "What is included",
    includeA: "Minimum contact pickup with online coordination.",
    includeB: "No payment is charged on this page.",
    includeC: "Proactivitis support reviews the request before confirming.",
    localFleet: "More cars in this zone",
    otherRegions: "Other pickup zones",
    appTitle: "Move further with Proactivitis support",
    appBody: "Your reservation goes to a local coordination flow, not a blind checkout."
  },
  es: {
    back: "Ver todos los autos",
    save: "Guardar",
    summary: "Resumen",
    location: "Ubicacion",
    insurance: "Seguro",
    policies: "Politicas",
    similar: "o similar",
    airportDesk: "Entrega en aeropuerto u hotel",
    score: "solicitudes verificadas",
    ratingDetails: "Ver detalles de puntuacion",
    memberTitle: "Inicia sesion y conserva esta renta organizada en tu cuenta Proactivitis",
    signIn: "Iniciar sesion",
    freeCancel: "Cancelacion gratuita",
    freeCancelBody: "Asegura el precio de hoy y cancela si cambian tus planes. Aqui no cobramos por adelantado.",
    supplierLocation: "Ubicacion de la arrendadora",
    pickupReturn: "Entrega y devolucion",
    hours: "Ventana diaria de entrega",
    terminal: "Mostrador en aeropuerto o entrega coordinada en hotel",
    requirements: "Requisitos para la entrega",
    license: "Licencia de conducir valida",
    card: "El proveedor local puede solicitar tarjeta para politicas de deposito.",
    protectTitle: "Proteger tu auto de renta te da mas tranquilidad",
    protectBody: "La proteccion opcional puede agregarse durante la confirmacion final si el proveedor la ofrece.",
    policyTitle: "Politicas de la renta",
    cancelPolicy: "Politica de cancelacion y no presentacion",
    agePolicy: "Politica por edad del conductor",
    includesTitle: "Que incluye",
    includeA: "Recogida con contacto minimo y coordinacion en linea.",
    includeB: "No se realiza ningun cobro en esta pagina.",
    includeC: "Soporte Proactivitis revisa la solicitud antes de confirmar.",
    localFleet: "Mas autos en esta zona",
    otherRegions: "Otras zonas de recogida",
    appTitle: "Llega mas lejos con soporte Proactivitis",
    appBody: "Tu reserva entra a un flujo de coordinacion local, no a un checkout ciego."
  },
  fr: {
    back: "Voir toutes les voitures",
    save: "Enregistrer",
    summary: "Resume",
    location: "Localisation",
    insurance: "Assurance",
    policies: "Politiques",
    similar: "ou similaire",
    airportDesk: "Livraison aeroport ou hotel",
    score: "demandes verifiees",
    ratingDetails: "Voir les details",
    memberTitle: "Connectez-vous pour garder cette location dans votre compte Proactivitis",
    signIn: "Connexion",
    freeCancel: "Annulation gratuite",
    freeCancelBody: "Gardez le prix du jour et annulez si vos plans changent. Aucun paiement initial ici.",
    supplierLocation: "Lieu du fournisseur",
    pickupReturn: "Prise en charge et retour",
    hours: "Fenetre de livraison",
    terminal: "Comptoir aeroport ou livraison hotel coordonnee",
    requirements: "Conditions de prise en charge",
    license: "Permis de conduire valide",
    card: "Le fournisseur local peut demander une carte pour la caution.",
    protectTitle: "Protegez votre location pour plus de tranquillite",
    protectBody: "Une protection optionnelle peut etre ajoutee lors de la confirmation finale.",
    policyTitle: "Politiques de location",
    cancelPolicy: "Annulation et non-presentation",
    agePolicy: "Politique age du conducteur",
    includesTitle: "Inclus",
    includeA: "Prise en charge avec coordination en ligne.",
    includeB: "Aucun paiement sur cette page.",
    includeC: "Le support Proactivitis verifie la demande avant confirmation.",
    localFleet: "Plus de voitures dans cette zone",
    otherRegions: "Autres zones",
    appTitle: "Allez plus loin avec Proactivitis",
    appBody: "Votre reservation passe par une coordination locale, pas un checkout aveugle."
  }
} satisfies Record<RentCarLocale, Record<string, string>>;

export default function RentCarDetailPage({ locationId, categorySlug, locale = "en", settings }: RentCarDetailPageProps) {
  const option = getRentCarOption(locationId, categorySlug, settings);
  const location = getRentCarLocation(locationId, settings);
  if (!option || !location) notFound();

  const copy = getRentCarCopy(locale);
  const labels = labelsByLocale[locale];
  const localOptions = getRentCarOptions(locationId, settings);
  const otherLocations = getRentCarLocations(settings).filter((item) => item.id !== locationId).slice(0, 4);
  const schema = getRentCarJsonLd(option, locale);
  const h1 = buildRentCarH1(option, locale);
  const description = buildRentCarDescription(option, locale);
  const specs = getRentCarSpecBadges(option, locale);
  const rootPath = getRentCarRootPath(locale);
  const facts = [
    `${option.seats} ${String(copy.passengers)}`,
    `${option.doors} doors`,
    option.airConditioning ? "Air conditioning" : null,
    option.transmission,
    `${option.bags} ${String(copy.bags)}`,
    labels.airportDesk
  ].filter(Boolean) as string[];

  return (
    <main className="bg-white pb-24 text-slate-950 lg:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href={rootPath} className="inline-flex items-center gap-2 text-sm font-black text-sky-700 hover:text-sky-900">
            ← {labels.back}
          </Link>
          <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700">
            {labels.save}
          </button>
        </div>
      </div>

      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4">
          {[labels.summary, labels.location, labels.insurance, labels.policies].map((item, index) => (
            <a
              key={item}
              href={index === 0 ? "#summary" : index === 1 ? "#location" : index === 2 ? "#insurance" : "#policies"}
              className={`shrink-0 border-b-2 px-1 py-4 text-sm font-black ${
                index === 0 ? "border-sky-600 text-sky-700" : "border-transparent text-slate-700"
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-4">
          <section id="summary" className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_230px] md:items-start">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{h1}</h1>
                <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                  {option.model} {labels.similar}
                </p>
                <div className="mt-5 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-2">
                  {facts.map((item) => (
                    <p key={item} className="flex gap-2">
                      <span className="text-sky-700">✓</span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="relative min-h-48 overflow-hidden rounded-[1.2rem] bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
                <div className="absolute inset-x-[18%] bottom-[12%] h-[12%] rounded-full bg-black/20 blur-[16px]" />
                <Image src={option.image} alt={option.model} fill priority sizes="230px" className="object-contain p-0 scale-[1.2]" />
              </div>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{labels.supplierLocation}</p>
                  <p className="mt-1 text-sm font-bold text-slate-600">{location.name} / {option.airportLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-950">5.0</p>
                  <p className="text-xs font-bold text-slate-500">100 {labels.score}</p>
                </div>
              </div>
              <Link href="#reviews" className="mt-3 inline-flex text-sm font-black text-sky-700">
                {labels.ratingDetails} ›
              </Link>
            </div>
          </section>

          <section className="rounded-[1.2rem] bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-xl text-base font-black">{labels.memberTitle}</p>
              <Link href="/login" className="rounded-full bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white">
                {labels.signIn}
              </Link>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-xl text-sky-700">▣</div>
              <div>
                <h2 className="text-lg font-black text-slate-950">{labels.freeCancel}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{labels.freeCancelBody}</p>
              </div>
            </div>
          </section>

          <section id="location" className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">{labels.supplierLocation}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{labels.pickupReturn}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoLine title={`${option.airportLabel}: ${location.name}`} body={labels.terminal} />
              <InfoLine title="8:00 a.m. - 10:00 p.m." body={labels.hours} />
              <InfoLine title={labels.license} body={labels.requirements} />
              <InfoLine title={labels.card} body={labels.requirements} />
            </div>
          </section>

          <section id="insurance" className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{labels.protectTitle}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{labels.protectBody}</p>
                <ul className="mt-4 space-y-2 text-sm font-bold text-slate-700">
                  <li>✓ Collision and damage guidance</li>
                  <li>✓ Roadside contact instructions</li>
                  <li>✓ 24/7 assistance channel</li>
                </ul>
              </div>
              <span className="rounded-xl bg-sky-100 px-4 py-3 text-xl text-sky-800">✓</span>
            </div>
          </section>

          <section id="policies" className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">{labels.policyTitle}</h2>
            <div className="mt-4 divide-y divide-slate-100 text-sm font-bold text-slate-700">
              <p className="py-3">⌄ {labels.cancelPolicy}</p>
              <p className="py-3">⌄ {labels.agePolicy}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-black text-slate-950">{labels.includesTitle}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                <li>{labels.includeA}</li>
                <li>{labels.includeB}</li>
                <li>{labels.includeC}</li>
              </ul>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">{labels.localFleet}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {localOptions.slice(0, 6).map((item) => (
                <Link
                  key={item.categorySlug}
                  href={getRentCarOptionPath(item.locationId, item.categorySlug, locale)}
                  className={`group grid grid-cols-[120px_minmax(0,1fr)] overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    item.categorySlug === option.categorySlug ? "border-slate-950" : "border-slate-200"
                  }`}
                >
                  <div className="relative min-h-28 bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
                    <Image src={item.image} alt={item.model} fill sizes="120px" className="object-contain p-0 scale-[1.18]" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{item.categoryLabel}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-black text-slate-950">{item.model}</h3>
                    <p className="mt-2 text-lg font-black text-slate-950">${item.price}/{String(copy.day)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">{labels.otherRegions}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {otherLocations.map((item) => (
                <Link
                  key={item.id}
                  href={getRentCarLocationDefaultPath(item.id, locale, settings)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 transition hover:border-sky-300 hover:bg-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="grid overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm md:grid-cols-[320px_minmax(0,1fr)]">
            <div className="relative min-h-52 bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f7f7f5_48%,#ececea_100%)]">
              <Image src="/transfer/suv.png" alt="Proactivitis rent a car" fill sizes="320px" className="object-contain p-4 scale-[1.12]" />
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-black text-slate-950">{labels.appTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{labels.appBody}</p>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm" />}>
            <RentCarLeadCard option={option} locale={locale} />
          </Suspense>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{String(copy.from)}</p>
            <p className="text-xl font-black text-slate-950">${option.price}/{String(copy.day)}</p>
          </div>
          <a href="#rentcar-booking" className="rounded-full bg-sky-600 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
            {String(copy.reserveNow)}
          </a>
        </div>
      </div>
    </main>
  );
}

function InfoLine({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
