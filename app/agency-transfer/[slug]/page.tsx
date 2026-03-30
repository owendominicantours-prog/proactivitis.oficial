import Link from "next/link";
import { notFound } from "next/navigation";

import { findAgencyTransferLinkBySlug } from "@/lib/agencyTransferPro";

export const dynamic = "force-dynamic";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default async function AgencyTransferLandingPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    date?: string;
    time?: string;
    returnDate?: string;
    returnTime?: string;
  }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const link = await findAgencyTransferLinkBySlug(resolvedParams.slug);
  if (!link || !link.active) {
    notFound();
  }

  const date = resolvedSearch?.date ?? "";
  const time = resolvedSearch?.time ?? "";
  const returnDate = resolvedSearch?.returnDate ?? "";
  const returnTime = resolvedSearch?.returnTime ?? "";
  const isRoundTrip = link.tripType === "round-trip";
  const hasReadyCheckout = Boolean(date && time && (!isRoundTrip || (returnDate && returnTime)));

  const paramsForCheckout = new URLSearchParams();
  paramsForCheckout.set("type", "transfer");
  paramsForCheckout.set("agencyLink", link.slug);
  paramsForCheckout.set("tourTitle", "Transfer privado Proactivitis");
  paramsForCheckout.set("tourImage", process.env.NEXT_PUBLIC_TRANSFER_IMAGE ?? "/transfer/sedan.png");
  if (process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID) {
    paramsForCheckout.set("tourId", process.env.NEXT_PUBLIC_TRANSFER_TOUR_ID);
  }
  paramsForCheckout.set("hotelSlug", link.destinationLocation.slug);
  paramsForCheckout.set("origin", link.originLocation.slug);
  paramsForCheckout.set("originLabel", link.originLocation.name);
  paramsForCheckout.set("originHotelName", link.destinationLocation.name);
  paramsForCheckout.set("vehicleId", link.vehicle.id);
  paramsForCheckout.set("vehicleName", link.vehicle.name);
  paramsForCheckout.set("vehicleCategory", link.vehicle.category);
  paramsForCheckout.set("adults", String(link.passengers));
  paramsForCheckout.set("youth", "0");
  paramsForCheckout.set("child", "0");
  paramsForCheckout.set("tourPrice", (link.price / Math.max(1, link.passengers)).toFixed(2));
  paramsForCheckout.set("totalPrice", link.price.toFixed(2));
  paramsForCheckout.set("tripType", link.tripType);
  if (date) paramsForCheckout.set("date", date);
  if (time) {
    paramsForCheckout.set("time", time);
    if (date) paramsForCheckout.set("dateTime", `${date}T${time}`);
  }
  if (returnDate && returnTime) {
    paramsForCheckout.set("returnDatetime", `${returnDate}T${returnTime}`);
  }

  return (
    <div className="travel-surface min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-8 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">AgencyPro Transfer</p>
          <h1 className="mt-3 text-4xl font-semibold">{link.originLocation.name} → {link.destinationLocation.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200">
            Traslado privado preparado por {link.AgencyUser.AgencyProfile?.companyName ?? link.AgencyUser.name ?? "tu agencia"} con tarifa comercial exclusiva.
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <section className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard label="Vehiculo" value={link.vehicle.name} />
              <InfoCard label="Capacidad" value={`${link.passengers} pax`} />
              <InfoCard label="Trayecto" value={link.tripType === "round-trip" ? "Ida y vuelta" : "Solo ida"} />
            </div>

            {link.note ? (
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Mensaje de tu agencia</p>
                <p className="mt-2">{link.note}</p>
              </div>
            ) : null}

            <form className="grid gap-4 md:grid-cols-2" action={`/agency-transfer/${link.slug}`}>
              <Field label="Fecha de salida">
                <input
                  type="date"
                  name="date"
                  defaultValue={date}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </Field>
              <Field label="Hora de salida">
                <input
                  type="time"
                  name="time"
                  defaultValue={time}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </Field>
              {isRoundTrip ? (
                <>
                  <Field label="Fecha de regreso">
                    <input
                      type="date"
                      name="returnDate"
                      defaultValue={returnDate}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                  </Field>
                  <Field label="Hora de regreso">
                    <input
                      type="time"
                      name="returnTime"
                      defaultValue={returnTime}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                  </Field>
                </>
              ) : null}

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                >
                  Actualizar datos del traslado
                </button>
                {hasReadyCheckout ? (
                  <Link
                    href={`/checkout?${paramsForCheckout.toString()}`}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Reservar ahora
                  </Link>
                ) : null}
              </div>
            </form>
          </section>

          <aside className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Precio final</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{formatMoney(link.price)}</p>
              <p className="mt-2 text-sm text-slate-500">
                Tarifa privada preparada por la agencia para esta ruta.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Ruta incluida</p>
              <p className="mt-2">{link.originLocation.name}</p>
              <p className="text-slate-400">→</p>
              <p>{link.destinationLocation.name}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Que debes completar</p>
              <ul className="mt-2 space-y-1 list-disc pl-4">
                <li>Fecha y hora de salida</li>
                {isRoundTrip ? <li>Fecha y hora de regreso</li> : null}
                <li>Datos del pasajero principal en checkout</li>
                <li>Pago seguro desde Proactivitis</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="space-y-2">
    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</span>
    {children}
  </label>
);

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
