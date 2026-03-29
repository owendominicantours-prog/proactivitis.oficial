import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  status?: "all" | "approved" | "pending";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

type AgencyRow = {
  caseId: string;
  userId: string | null;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  phone: string | null;
  country: string | null;
  approved: boolean;
  hasProfile: boolean;
  bookingsCount: number;
  linksCount: number;
  lastBookingAt: Date | null;
  createdAt: Date;
  sourceLabel: string;
  commissionPercent: number | null;
};

export default async function AdminAgenciesPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "all";

  const [users, orphanApplications] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { role: { equals: "AGENCY", mode: "insensitive" } as never },
          { agencyApproved: true },
          { AgencyProfile: { isNot: null } },
          { PartnerApplication: { some: { role: "AGENCY" } } }
        ]
      },
      include: {
        AgencyProfile: true,
        PartnerApplication: {
          where: { role: "AGENCY" },
          orderBy: { updatedAt: "desc" }
        },
        AgencyProLinks: {
          select: {
            id: true,
            createdAt: true,
            Booking: {
              select: {
                id: true,
                createdAt: true
              }
            }
          }
        },
        Booking: {
          where: { source: "AGENCY" },
          select: { id: true, createdAt: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.partnerApplication.findMany({
      where: {
        role: "AGENCY",
        userId: null
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const userRows: AgencyRow[] = users.map((user) => {
    const latestApplication = user.PartnerApplication[0] ?? null;
    const bookingMap = new Map<string, Date>();

    for (const booking of user.Booking) {
      bookingMap.set(booking.id, booking.createdAt);
    }
    for (const link of user.AgencyProLinks) {
      for (const booking of link.Booking) {
        bookingMap.set(booking.id, booking.createdAt);
      }
    }

    const bookingDates = Array.from(bookingMap.values()).sort((a, b) => b.getTime() - a.getTime());

    return {
      caseId: user.id,
      userId: user.id,
      companyName:
        user.AgencyProfile?.companyName ??
        latestApplication?.companyName ??
        user.name ??
        "Agencia sin nombre",
      ownerName: latestApplication?.contactName ?? user.name ?? "Sin nombre",
      ownerEmail: latestApplication?.email ?? user.email,
      phone: latestApplication?.phone ?? null,
      country: latestApplication?.country ?? null,
      approved: Boolean(
        user.agencyApproved || user.AgencyProfile?.approved || latestApplication?.status === "APPROVED"
      ),
      hasProfile: Boolean(user.AgencyProfile),
      commissionPercent: user.AgencyProfile?.commissionPercent ?? null,
      bookingsCount: bookingMap.size,
      linksCount: user.AgencyProLinks.length,
      lastBookingAt: bookingDates[0] ?? null,
      createdAt: user.createdAt,
      sourceLabel: latestApplication ? "Solicitud + cuenta" : user.AgencyProfile ? "Perfil interno" : "Cuenta"
    };
  });

  const orphanRows: AgencyRow[] = orphanApplications.map((application) => ({
    caseId: `application-${application.id}`,
    userId: null,
    companyName: application.companyName,
    ownerName: application.contactName,
    ownerEmail: application.email,
    phone: application.phone ?? null,
    country: application.country ?? null,
    approved: application.status === "APPROVED",
    hasProfile: false,
    commissionPercent: null,
    bookingsCount: 0,
    linksCount: 0,
    lastBookingAt: null,
    createdAt: application.createdAt,
    sourceLabel: "Solicitud sin cuenta"
  }));

  const rows = [...userRows, ...orphanRows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  let filtered = rows;
  if (query) {
    filtered = filtered.filter((agency) =>
      [agency.companyName, agency.ownerName, agency.ownerEmail, agency.phone, agency.country]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }
  if (status !== "all") {
    const mustBeApproved = status === "approved";
    filtered = filtered.filter((agency) => agency.approved === mustBeApproved);
  }

  const approvedCount = rows.filter((agency) => agency.approved).length;
  const pendingCount = rows.length - approvedCount;
  const withProfileCount = rows.filter((agency) => agency.hasProfile).length;
  const activeWithBookingsCount = rows.filter((agency) => agency.bookingsCount > 0).length;

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Agencias</p>
        <h1 className="text-3xl font-semibold text-slate-900">Panel de agencias</h1>
        <p className="text-sm text-slate-600">
          Controla aprobaciones, actividad comercial y reservas por agencia desde una sola vista.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{rows.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Aprobadas</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{approvedCount}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Pendientes</p>
          <p className="mt-2 text-3xl font-semibold text-amber-900">{pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Con reservas</p>
          <p className="mt-2 text-3xl font-semibold text-sky-900">{activeWithBookingsCount}</p>
          <p className="mt-1 text-xs text-sky-700">Perfiles creados: {withProfileCount}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600">
            Buscar
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Empresa, contacto, email, telefono o pais"
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Estado
            <select
              name="status"
              defaultValue={status}
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              <option value="approved">Aprobadas</option>
              <option value="pending">Pendientes</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Filtrar
          </button>
          <Link
            href="/admin/agencies"
            className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500"
          >
            Limpiar
          </Link>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Agencias ({filtered.length})</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((agency) => (
            <article key={agency.caseId} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{agency.companyName}</p>
                  <p className="text-sm text-slate-600">{agency.ownerName}</p>
                  <p className="text-sm text-slate-500">{agency.ownerEmail}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    agency.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {agency.approved ? "Aprobada" : "Pendiente"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600">
                  {agency.sourceLabel}
                </span>
                {agency.hasProfile ? (
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-700">
                    Perfil creado
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Telefono</p>
                  <p>{agency.phone ?? "No registrado"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pais</p>
                  <p>{agency.country ?? "No registrado"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reservas</p>
                  <p>{agency.bookingsCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Links</p>
                  <p>{agency.linksCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Comision</p>
                  <p>{agency.commissionPercent !== null ? `${agency.commissionPercent}%` : "Pendiente"}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Ultima reserva: {agency.lastBookingAt ? agency.lastBookingAt.toLocaleDateString("es-ES") : "Sin reservas"}
                </span>
                <Link href={`/admin/agencies/${agency.caseId}`} className="font-semibold text-sky-700 hover:underline">
                  Abrir caso
                </Link>
              </div>
            </article>
          ))}
          {!filtered.length && <p className="text-sm text-slate-500">No hay agencias para este filtro.</p>}
        </div>
      </section>
    </div>
  );
}
