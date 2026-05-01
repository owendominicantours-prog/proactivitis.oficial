import Link from "next/link";

import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  status?: "all" | "approved" | "pending";
  quality?: "all" | "attention" | "ready";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const tourReady = (tour: {
  status: string;
  heroImage: string | null;
  gallery: string | null;
  price: number;
  description: string;
  includes: string;
  location: string;
}) => {
  const galleryCount = tour.gallery
    ? tour.gallery.split(",").map((item) => item.trim()).filter(Boolean).length
    : 0;

  return (
    tour.status === "published" &&
    tour.price > 0 &&
    Boolean(tour.heroImage?.trim()) &&
    galleryCount >= 3 &&
    tour.description.trim().length >= 120 &&
    tour.includes.trim().length >= 20 &&
    tour.location.trim().length >= 3
  );
};

export default async function AdminSuppliersPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "all";
  const quality = params.quality ?? "all";

  const suppliers = await prisma.supplierProfile.findMany({
    include: {
      Tour: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          heroImage: true,
          gallery: true,
          price: true,
          description: true,
          includes: true,
          location: true,
          _count: {
            select: {
              Booking: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      User: { select: { name: true, email: true, accountStatus: true } },
      offers: { select: { id: true, active: true } },
      minisite: { select: { isActive: true, slug: true } }
    },
    orderBy: { company: "asc" }
  });

  const enriched = suppliers.map((supplier) => {
    const published = supplier.Tour.filter((tour) => tour.status === "published");
    const reviewQueue = supplier.Tour.filter((tour) => ["under_review", "pending", "needs_changes"].includes(tour.status));
    const incompleteTours = supplier.Tour.filter((tour) => !tourReady(tour));
    const readyTours = supplier.Tour.length - incompleteTours.length;
    const activeOffers = supplier.offers.filter((offer) => offer.active).length;
    const bookingCount = supplier.Tour.reduce((total, tour) => total + tour._count.Booking, 0);
    const profileWarnings = [
      !supplier.approved ? "Cuenta pendiente de aprobacion" : "",
      !supplier.productsEnabled ? "Productos desactivados" : "",
      !supplier.stripeAccountId ? "Sin cuenta Stripe conectada" : "",
      !supplier.minisite?.isActive ? "Minisite inactivo" : "",
      supplier.Tour.length === 0 ? "Sin tours cargados" : "",
      incompleteTours.length > 0 ? `${incompleteTours.length} tour(s) con datos incompletos` : "",
      reviewQueue.length > 0 ? `${reviewQueue.length} tour(s) en revision` : ""
    ].filter(Boolean);

    return {
      supplier,
      publishedCount: published.length,
      reviewQueueCount: reviewQueue.length,
      incompleteCount: incompleteTours.length,
      readyTours,
      activeOffers,
      bookingCount,
      profileWarnings,
      needsAttention: profileWarnings.length > 0
    };
  });

  let filtered = enriched;
  if (query) {
    filtered = filtered.filter(({ supplier }) =>
      [supplier.company, supplier.User?.name, supplier.User?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }
  if (status !== "all") {
    const mustBeApproved = status === "approved";
    filtered = filtered.filter(({ supplier }) => supplier.approved === mustBeApproved);
  }
  if (quality !== "all") {
    filtered = filtered.filter((row) => (quality === "attention" ? row.needsAttention : !row.needsAttention));
  }

  const approvedCount = suppliers.filter((supplier) => supplier.approved).length;
  const pendingCount = suppliers.length - approvedCount;
  const totalTours = suppliers.reduce((acc, supplier) => acc + supplier.Tour.length, 0);
  const attentionCount = enriched.filter((row) => row.needsAttention).length;
  const totalBookings = enriched.reduce((total, row) => total + row.bookingCount, 0);

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-[linear-gradient(135deg,#0f172a,#173b2f)] p-6 text-white lg:grid-cols-[1.3fr,0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-200">Suplidores</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">Calidad comercial de cada proveedor.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">
              Detecta quien puede vender bien, quien tiene productos incompletos y donde el equipo debe intervenir.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Atencion</p>
            <p className="mt-2 text-2xl font-semibold">{attentionCount} suplidor(es)</p>
            <p className="mt-2 text-sm text-slate-200">Con Stripe, minisite, aprobacion o tours por corregir.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total" value={suppliers.length} tone="slate" />
        <MetricCard label="Aprobados" value={approvedCount} tone="emerald" />
        <MetricCard label="Pendientes" value={pendingCount} tone="amber" />
        <MetricCard label="Tours cargados" value={totalTours} tone="sky" />
        <MetricCard label="Reservas generadas" value={totalBookings} tone="indigo" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1.4fr,1fr,1fr,auto,auto]">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</span>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Empresa, nombre o email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estado</span>
            <select name="status" defaultValue={status} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400">
              <option value="all">Todos</option>
              <option value="approved">Aprobados</option>
              <option value="pending">Pendientes</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Calidad</span>
            <select name="quality" defaultValue={quality} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400">
              <option value="all">Todos</option>
              <option value="attention">Necesitan atencion</option>
              <option value="ready">Listos</option>
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Filtrar
            </button>
          </div>
          <div className="flex items-end">
            <Link href="/admin/suppliers" className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-500">
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {filtered.map((row) => {
          const { supplier } = row;
          return (
            <article key={supplier.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{supplier.company}</p>
                  <p className="text-sm text-slate-600">{supplier.User?.name ?? "Sin nombre"} · {supplier.User?.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supplier.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {supplier.approved ? "Aprobado" : "Pendiente"}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.needsAttention ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {row.needsAttention ? "Revisar" : "Listo"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-4">
                <SupplierMiniMetric label="Publicados" value={row.publishedCount} />
                <SupplierMiniMetric label="En revision" value={row.reviewQueueCount} />
                <SupplierMiniMetric label="Listos" value={row.readyTours} />
                <SupplierMiniMetric label="Reservas" value={row.bookingCount} />
              </div>

              {row.profileWarnings.length ? (
                <div className="mx-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Pendientes</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.profileWarnings.map((warning) => (
                      <span key={warning} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800">
                        {warning}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoPill label="Productos" value={supplier.productsEnabled ? "Activos" : "Desactivados"} good={supplier.productsEnabled} />
                  <InfoPill label="Stripe" value={supplier.stripeAccountId ? "Conectado" : "Pendiente"} good={Boolean(supplier.stripeAccountId)} />
                  <InfoPill label="Minisite" value={supplier.minisite?.isActive ? supplier.minisite.slug : "Inactivo"} good={Boolean(supplier.minisite?.isActive)} />
                </div>

                <div className="mt-4 space-y-2">
                  {supplier.Tour.slice(0, 4).map((tour) => (
                    <Link key={tour.id} href={`/admin/tours?query=${encodeURIComponent(tour.title)}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm hover:border-slate-300">
                      <span className="min-w-0 truncate font-semibold text-slate-800">{tour.title}</span>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${tourReady(tour) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {tourReady(tour) ? "OK" : "Incompleto"}
                      </span>
                    </Link>
                  ))}
                  {!supplier.Tour.length && <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Este suplidor aun no tiene tours.</p>}
                </div>
              </div>
            </article>
          );
        })}
        {!filtered.length && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 xl:col-span-2">
            No hay suplidores para este filtro.
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: "slate" | "emerald" | "amber" | "sky" | "indigo" }) {
  const classes = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-900"
  };

  return (
    <article className={`rounded-3xl border p-5 shadow-sm ${classes[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</p>
    </article>
  );
}

function SupplierMiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value.toLocaleString()}</p>
    </div>
  );
}

function InfoPill({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 text-sm ${good ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}
