import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupplierOfferAction, toggleSupplierOfferActiveAction } from "@/app/(dashboard)/supplier/offers/actions";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

export default async function SupplierOffersPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Debes iniciar sesion para gestionar ofertas.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    select: { id: true, company: true }
  });
  if (!supplier) {
    return <div className="p-6 text-sm text-slate-600">No encontramos tu perfil de supplier.</div>;
  }

  const [tours, offers] = await Promise.all([
    prisma.tour.findMany({
      where: { supplierId: supplier.id },
      select: { id: true, title: true, price: true, status: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    }),
    prisma.offer.findMany({
      where: { supplierId: supplier.id },
      include: {
        OfferTours: {
          include: {
            Tour: {
              select: { id: true, title: true, price: true }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="bg-slate-50 py-10">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Ofertas</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Configurar oferta para varios tours</h1>
          <p className="mt-2 text-sm text-slate-600">
            Selecciona uno o varios tours, define el tipo de descuento y publica la oferta en segundos.
          </p>

          <form action={createSupplierOfferAction} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-600">
              Titulo de oferta
              <input
                name="title"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800"
                placeholder="Oferta especial de temporada"
              />
            </label>

            <label className="block text-sm text-slate-600">
              Descripcion
              <textarea
                name="description"
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800"
                placeholder="Valida para reservas nuevas. Cupos limitados."
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-slate-600">
                Tipo de oferta
                <select
                  name="discountType"
                  defaultValue="PERCENT"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800"
                >
                  <option value="PERCENT">Porcentaje (%)</option>
                  <option value="AMOUNT">Monto fijo (USD)</option>
                </select>
              </label>
              <label className="block text-sm text-slate-600">
                Valor
                <input
                  name="discountValue"
                  type="number"
                  required
                  min={1}
                  step="0.01"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  placeholder="10"
                />
              </label>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-slate-800">Tours incluidos</legend>
              <p className="text-xs text-slate-500">Puedes marcar varios tours para aplicar la misma oferta.</p>
              <div className="max-h-72 space-y-2 overflow-auto rounded-xl border border-slate-200 p-3">
                {tours.length === 0 ? (
                  <p className="text-sm text-slate-500">No tienes tours disponibles.</p>
                ) : (
                  tours.map((tour) => (
                    <label
                      key={tour.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-slate-300"
                    >
                      <input type="checkbox" name="tourIds" value={tour.id} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">{tour.title}</span>
                        <span className="block text-xs text-slate-500">
                          {money.format(tour.price)} · Estado: {tour.status}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </fieldset>

            <button className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">
              Crear oferta
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Historial</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Ofertas de {supplier.company}</h2>
            </div>
            <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
              {offers.length} ofertas
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {offers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Aun no tienes ofertas creadas.
              </p>
            ) : (
              offers.map((offer) => (
                <article key={offer.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{offer.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{offer.description || "Sin descripcion."}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {offer.discountType === "PERCENT"
                          ? `${offer.discountValue}% de descuento`
                          : `${money.format(offer.discountValue)} de descuento`}
                      </p>
                    </div>
                    <form action={toggleSupplierOfferActiveAction}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <button
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          offer.active
                            ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border border-slate-300 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {offer.active ? "Activa (click para pausar)" : "Pausada (click para activar)"}
                      </button>
                    </form>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {offer.OfferTours.map((entry) => (
                      <span
                        key={entry.id}
                        className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                      >
                        {entry.Tour.title} · {money.format(entry.Tour.price)}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

