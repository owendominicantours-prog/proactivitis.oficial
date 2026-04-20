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

    for (const booking of user.Booking) bookingMap.set(booking.id, booking.createdAt);
    for (const link of user.AgencyProLinks) {
      for (const booking of link.Booking) bookingMap.set(booking.id, booking.createdAt);
    }

    const bookingDates = Array.from(bookingMap.values()).sort((a, b) => b.getTime() - a.getTime());

    return {
      caseId: user.id,
      userId: user.id,
      companyName: user.AgencyProfile?.companyName ?? latestApplication?.companyName ?? user.name ?? "Agencia sin nombre",
      ownerName: latestApplication?.contactName ?? user.name ?? "Sin nombre",
      ownerEmail: latestApplication?.email ?? user.email,
      phone: latestApplication?.phone ?? null,
      country: latestApplication?.country ?? null,
      approved: Boolean(user.agencyApproved || user.AgencyProfile?.approved || latestApplication?.status === "APPROVED"),
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
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Agencias</p>
            <h1 className="mt-3 text-3xl font-semibold">Panel de agencias</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Controla aprobaciones, actividad comercial y reservas por agencia desde una sola vista con mejor lectura móvil.
            </p>
          </div>
          <Link
            href="/admin/partner-applications"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ver solicitudes
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: rows.length, helper: "Casos de agencia detectados" },
          { label: "Aprobadas", value: approvedCount, helper: "Cuentas listas para operar" },
          { label: "Pendientes", value: pendingCount, helper: "Solicitudes o casos sin aprobación" },
          { label: "Con reservas", value: activeWithBookingsCount, helper: `Perfiles creados: ${withProfileCount}` }
        ].map((item, index) => (
          <article
            key={item.label}
            className={`rounded-3xl border p-5 shadow-sm ${
              index === 1 ? "border-emerald-200 bg-emerald-50" : index === 2 ? "border-amber-200 bg-amber-50" : index === 3 ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-2 text-sm text-slate-600">{item.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr,1fr,auto,auto]">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</span>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Empresa, contacto, email, teléfono o país"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estado</span>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="all">Todas</option>
              <option value="approved">Aprobadas</option>
              <option value="pending">Pendientes</option>
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Filtrar
            </button>
          </div>
          <div className="flex items-end">
            <Link href="/admin/agencies" className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500">
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Agencias ({filtered.length})</h2>
          <p className="text-sm text-slate-500">Cada tarjeta resume perfil, volumen y actividad reciente.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((agency) => (
            <article key={agency.caseId} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-slate-900">{agency.companyName}</p>
                  <p className="text-sm text-slate-600">{agency.ownerName}</p>
                  <p className="break-all text-sm text-slate-500">{agency.ownerEmail}</p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
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

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Teléfono</p>
                  <p>{agency.phone ?? "No registrado"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">País</p>
                  <p>{agency.country ?? "No registrado"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Reservas</p>
                  <p>{agency.bookingsCount}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Links</p>
                  <p>{agency.linksCount}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Comisión</p>
                  <p>{agency.commissionPercent !== null ? `${agency.commissionPercent}%` : "Pendiente"}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Última reserva: {agency.lastBookingAt ? agency.lastBookingAt.toLocaleDateString("es-ES") : "Sin reservas"}
                </span>
                <Link href={`/admin/agencies/${agency.caseId}`} className="inline-flex min-h-10 items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 transition hover:border-slate-400 hover:bg-white">
                  Abrir caso
                </Link>
              </div>
            </article>
          ))}

          {!filtered.length && (
            <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              No hay agencias para este filtro.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
