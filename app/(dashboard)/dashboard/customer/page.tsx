export const dynamic = "force-dynamic"; // Customer portal should always reflect latest bookings.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { BookingStatus } from "@/lib/types/booking";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver tus reservas.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }]
    },
    include: { Tour: true },
    orderBy: { travelDate: "asc" }
  });

  const proDiscoveryOpportunities = await prisma.proDiscoveryGroupOpportunity.findMany({
    where: { contactEmail: session.user.email.toLowerCase() },
    orderBy: { createdAt: "desc" },
    take: 12
  });

  const today = new Date();
  const upcoming = bookings.filter((booking) => booking.travelDate >= today);
  const past = bookings.filter((booking) => booking.travelDate < today);

  const statusMessages: Partial<Record<BookingStatus, string>> = {
    CONFIRMED: "Tu reserva está confirmada.",
    CANCELLATION_REQUESTED: "Se ha solicitado la cancelación de esta reserva. Nuestro equipo la revisa.",
    CANCELLED: "Esta reserva está cancelada.",
    COMPLETED: "Esta reserva fue completada."
  };

  const getStatusMessage = (status: BookingStatus) => statusMessages[status] ?? "";

  const renderList = (items: typeof bookings) => (
    <div className="space-y-3">
      {items.map((booking) => (
        <div key={booking.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{booking.Tour?.title ?? "Tour"}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {booking.travelDate.toLocaleDateString("es-ES")} · {booking.travelDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {booking.status}
            </span>
          </div>
              <p className="mt-2 text-xs text-slate-500">{getStatusMessage(booking.status as BookingStatus)}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between text-sm text-slate-600">
            <p>Pax: {booking.paxAdults + booking.paxChildren}</p>
            <Link href={`/dashboard/customer/reservas/${booking.id}`} className="text-xs font-semibold text-sky-500 hover:underline">
              Ver detalle
            </Link>
          </div>
        </div>
      ))}
      {!items.length && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
          Sin reservas en esta categoría.
        </div>
      )}
    </div>
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Mis reservas</h1>
        <p className="text-sm text-slate-500">Administra tus próximas experiencias y repasa las pasadas.</p>
      </div>
      {proDiscoveryOpportunities.length ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Propuestas ProDiscovery</h2>
            <p className="text-sm text-slate-500">Tus solicitudes privadas apareceran aqui mientras el equipo prepara la propuesta final.</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {proDiscoveryOpportunities.map((opportunity) => {
              const paymentReady =
                Boolean(opportunity.acceptedBudget) &&
                ["QUOTED", "ACCEPTED", "PAYMENT_STARTED", "WON"].includes(opportunity.status);
              const deposit = paymentReady
                ? opportunity.depositAmount ?? (opportunity.acceptedBudget ? opportunity.acceptedBudget * (opportunity.depositPercent / 100) : null)
                : null;
              const statusLabel =
                opportunity.status === "NEW"
                  ? "En revision"
                  : opportunity.status === "REVIEWING"
                    ? "En trabajo"
                    : opportunity.status === "QUOTED"
                      ? "Lista para revisar"
                      : opportunity.status === "ACCEPTED"
                        ? "Lista para confirmar"
                        : opportunity.status === "PAYMENT_STARTED"
                          ? "Pago iniciado"
                          : opportunity.status === "WON"
                            ? "Confirmada"
                            : opportunity.status;
              return (
                <article key={opportunity.id} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">ProDiscovery</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">{opportunity.city}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {opportunity.groupSize} personas - Codigo {opportunity.requestCode}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {opportunity.itinerarySummary ?? "Estamos preparando tu propuesta con guia, transporte y logistica de grupo."}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Presupuesto aceptado</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {opportunity.acceptedBudget ? `USD ${opportunity.acceptedBudget.toFixed(2)}` : "Pendiente"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deposito</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{deposit ? `USD ${deposit.toFixed(2)}` : "Pendiente"}</p>
                    </div>
                  </div>
                  {deposit ? (
                    <Link
                      href={`/api/prodiscovery/deposit-checkout?opportunityId=${opportunity.id}`}
                      className="mt-4 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Pagar deposito
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-4 inline-flex cursor-not-allowed rounded-2xl bg-slate-300 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Pago disponible cuando la propuesta este lista
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Próximas</h2>
          {renderList(upcoming)}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Pasadas</h2>
          {renderList(past)}
        </div>
      </div>
    </section>
  );
}
