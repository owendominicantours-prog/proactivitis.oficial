import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { approveApplication, rejectApplication } from "@/app/(dashboard)/admin/partner-applications/actions";
import { approveAgency, rejectAgency, updateAgencyCommission } from "./actions";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "No disponible";
  return value.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const targetId = resolved?.id ?? "";
  if (!targetId) notFound();

  if (targetId.startsWith("application-")) {
    const applicationId = targetId.replace("application-", "");
    const application = await prisma.partnerApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application || application.role !== "AGENCY") {
      notFound();
    }

    const approved = application.status === "APPROVED";

    return (
      <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Caso de agencia</p>
            <h1 className="text-2xl font-semibold text-slate-900">{application.companyName}</h1>
            <p className="text-sm text-slate-600">{application.contactName}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
              approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {approved ? "Aprobada" : "Pendiente"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Links AgencyPro</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Estado del caso</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Solicitud sin cuenta enlazada</p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Creada</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(application.createdAt)}</p>
          </article>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Identidad</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Empresa:</span> {application.companyName}</p>
              <p><span className="font-semibold text-slate-900">Contacto:</span> {application.contactName}</p>
              <p><span className="font-semibold text-slate-900">Cargo:</span> {application.contactRole}</p>
              <p><span className="font-semibold text-slate-900">Email:</span> {application.email}</p>
              <p><span className="font-semibold text-slate-900">Telefono:</span> {application.phone}</p>
              <p><span className="font-semibold text-slate-900">Pais:</span> {application.country}</p>
              <p><span className="font-semibold text-slate-900">Web:</span> {application.website ?? "No definida"}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Acciones</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <form action={approveApplication}>
                <input type="hidden" name="applicationId" value={application.id} />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
                >
                  Aprobar solicitud
                </button>
              </form>
              <form action={rejectApplication}>
                <input type="hidden" name="applicationId" value={application.id} />
                <button
                  type="submit"
                  className="rounded-2xl border border-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 transition hover:bg-amber-100"
                >
                  Rechazar solicitud
                </button>
              </form>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Esta solicitud todavia no tiene cuenta enlazada. Si se aprueba desde aqui, quedara visible en el panel comercial.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Solicitud comercial</h2>
            <p className="mt-3 text-sm text-slate-700">{application.description}</p>
            <p className="mt-3 text-xs text-slate-500">
              Servicios: {application.serviceTypes.split(",").map((item) => item.trim()).filter(Boolean).join(", ") || "No definidos"}
            </p>
          </article>
        </div>

        <div>
          <Link href="/admin/agencies" className="text-sm font-semibold text-sky-700 hover:underline">
            Volver al listado de agencias
          </Link>
        </div>
      </section>
    );
  }

  let user = await prisma.user.findUnique({
    where: { id: targetId },
    include: {
      AgencyProfile: true,
      PartnerApplication: {
        where: { role: "AGENCY" },
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!user) {
    const profile = await prisma.agencyProfile.findUnique({
      where: { id: targetId },
      include: { User: true }
    });
    if (!profile?.User) notFound();
    user = await prisma.user.findUnique({
      where: { id: profile.userId },
      include: {
        AgencyProfile: true,
        PartnerApplication: {
          where: { role: "AGENCY" },
          orderBy: { updatedAt: "desc" }
        }
      }
    });
  }

  if (!user) notFound();

  const [links, bookings] = await Promise.all([
    prisma.agencyProLink.findMany({
      where: { agencyUserId: user.id },
      include: {
        Tour: { select: { title: true } },
        Booking: {
          select: {
            id: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.booking.findMany({
      where: {
        OR: [{ userId: user.id, source: "AGENCY" }, { AgencyProLink: { agencyUserId: user.id } }]
      },
      include: {
        Tour: { select: { title: true } },
        AgencyProLink: {
          select: {
            slug: true,
            markup: true,
            AgencyUser: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const latestApplication = user.PartnerApplication[0] ?? null;
  const companyName =
    user.AgencyProfile?.companyName ?? latestApplication?.companyName ?? user.name ?? "Agencia sin nombre";
  const approved = Boolean(
    user.agencyApproved || user.AgencyProfile?.approved || latestApplication?.status === "APPROVED"
  );
  const totalSales = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const totalAgencyFees = bookings.reduce((sum, booking) => sum + (booking.agencyFee ?? booking.agencyMarkupAmount ?? 0), 0);
  const lastBookingAt = bookings[0]?.createdAt ?? null;
  const commissionPercent = user.AgencyProfile?.commissionPercent ?? 20;
  const serviceTypes =
    latestApplication?.serviceTypes
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ") ?? "No definidos";

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Caso de agencia</p>
          <h1 className="text-2xl font-semibold text-slate-900">{companyName}</h1>
          <p className="text-sm text-slate-600">{latestApplication?.contactName ?? user.name ?? user.email}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
            approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {approved ? "Aprobada" : "Pendiente"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{bookings.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Links AgencyPro</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{links.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ventas brutas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalSales)}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comision estimada</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalAgencyFees)}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ultima reserva</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(lastBookingAt)}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comision directa</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{commissionPercent}%</p>
        </article>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Identidad</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Empresa:</span> {companyName}</p>
            <p><span className="font-semibold text-slate-900">Contacto:</span> {latestApplication?.contactName ?? user.name ?? "No definido"}</p>
            <p><span className="font-semibold text-slate-900">Cargo:</span> {latestApplication?.contactRole ?? "No definido"}</p>
            <p><span className="font-semibold text-slate-900">Email:</span> {latestApplication?.email ?? user.email}</p>
            <p><span className="font-semibold text-slate-900">Telefono:</span> {latestApplication?.phone ?? "No definido"}</p>
            <p><span className="font-semibold text-slate-900">Pais:</span> {latestApplication?.country ?? "No definido"}</p>
            <p><span className="font-semibold text-slate-900">Web:</span> {latestApplication?.website ?? "No definida"}</p>
            <p><span className="font-semibold text-slate-900">Cuenta creada:</span> {formatDate(user.createdAt)}</p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Acciones</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <form action={approveAgency}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="companyName" value={companyName} />
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
              >
                Aprobar
              </button>
            </form>
            <form action={rejectAgency}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="rounded-2xl border border-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 transition hover:bg-amber-100"
              >
                Rechazar
              </button>
            </form>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Esta ficha concentra historial comercial, links, reservas y datos de contacto de la agencia.
          </p>
          <form action={updateAgencyCommission} className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <input type="hidden" name="userId" value={user.id} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Comision para reservas directas</p>
              <p className="mt-1 text-xs text-slate-500">
                Este porcentaje solo aplica cuando la agencia reserva desde su cuenta. AgencyPro usa margen propio.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="commissionPercent"
                min="0"
                max="100"
                step="1"
                defaultValue={commissionPercent}
                className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-slate-800"
              >
                Guardar %
              </button>
            </div>
          </form>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Solicitud comercial</h2>
          <p className="mt-3 text-sm text-slate-700">{latestApplication?.description ?? "Sin descripcion registrada."}</p>
          <p className="mt-3 text-xs text-slate-500">Servicios: {serviceTypes}</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Reservas recientes</h2>
            <span className="text-xs text-slate-500">{bookings.length} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {bookings.slice(0, 8).map((booking) => (
              <div key={booking.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-900">{booking.Tour?.title ?? "Reserva"}</p>
                <p className="text-slate-600">
                  {booking.customerName} · {booking.travelDate.toLocaleDateString("es-ES")} · {formatCurrency(booking.totalAmount)}
                </p>
                <p className="text-xs text-slate-500">
                  {booking.AgencyProLink ? `Link: ${booking.AgencyProLink.slug}` : "Reserva hecha desde cuenta de agencia"}
                </p>
              </div>
            ))}
            {!bookings.length && <p className="text-sm text-slate-500">Aun no tiene reservas registradas.</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Links comerciales</h2>
            <span className="text-xs text-slate-500">{links.length} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {links.slice(0, 8).map((link) => (
              <div key={link.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-900">{link.Tour?.title ?? "Tour"}</p>
                <p className="text-slate-600">
                  /agency-pro/{link.slug} · {formatCurrency(link.price)} · markup {formatCurrency(link.markup)}
                </p>
                <p className="text-xs text-slate-500">Reservas por este link: {link.Booking.length}</p>
              </div>
            ))}
            {!links.length && <p className="text-sm text-slate-500">No tiene links AgencyPro creados.</p>}
          </div>
        </article>
      </div>

      <div>
        <Link href="/admin/agencies" className="text-sm font-semibold text-sky-700 hover:underline">
          Volver al listado de agencias
        </Link>
      </div>
    </section>
  );
}
