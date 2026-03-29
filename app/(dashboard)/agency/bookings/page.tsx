export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { getServerSession } from "next-auth";

import { PanelShell } from "@/components/dashboard/PanelShell";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { authOptions } from "@/lib/auth";
import { formatTimeUntil, requiresCancellationRequest } from "@/lib/bookings";
import { buildBookingPresentation } from "@/lib/bookingPresentation";
import { agencyCancelBooking, agencyRequestCancellation } from "@/lib/actions/bookingCancellation";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/types/booking";

type PageProps = {
  searchParams?: Promise<{
    query?: string;
    status?: string;
    channel?: string;
  }>;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const formatDate = (value: Date) =>
  value.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

export default async function AgencyBookingsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tus reservas.</div>;
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.query?.trim().toLowerCase() ?? "";
  const statusFilter = resolvedSearchParams?.status?.trim().toLowerCase() ?? "";
  const channelFilter = resolvedSearchParams?.channel?.trim().toLowerCase() ?? "";

  const bookings = await prisma.booking.findMany({
    where: {
      source: "AGENCY",
      OR: [{ userId }, { AgencyProLink: { agencyUserId: userId } }]
    },
    include: {
      Tour: true,
      AgencyProLink: true
    },
    orderBy: [{ travelDate: "asc" }, { createdAt: "desc" }]
  });

  const normalizedBookings = bookings.map((booking) => {
    const bookingTripType = (booking as any).tripType as string | null | undefined;
    const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
    const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
    const presentation = buildBookingPresentation({
      flowType: booking.flowType,
      tripType: bookingTripType,
      originAirport: booking.originAirport,
      flightNumber: booking.flightNumber,
      hotel: booking.hotel,
      pickup: booking.pickup,
      pickupNotes: booking.pickupNotes,
      returnTravelDate: bookingReturnTravelDate,
      returnStartTime: bookingReturnStartTime,
      startTime: booking.startTime,
      travelDateValue: booking.travelDate,
      tourIncludes: booking.Tour?.includes,
      language: booking.Tour?.language,
      duration: booking.Tour?.duration,
      meetingPoint: booking.Tour?.meetingPoint
    });

    return {
      booking,
      presentation,
      channel: booking.AgencyProLink ? "agencypro" : "direct",
      searchText: [
        booking.bookingCode ?? booking.id,
        booking.customerName ?? "",
        booking.customerEmail ?? "",
        booking.Tour?.title ?? "",
        booking.hotel ?? "",
        booking.pickup ?? "",
        booking.originAirport ?? "",
        booking.transferVehicleName ?? ""
      ]
        .join(" ")
        .toLowerCase()
    };
  });

  const filtered = normalizedBookings.filter(({ booking, channel, searchText }) => {
    const matchesQuery = query ? searchText.includes(query) : true;
    const matchesStatus = statusFilter ? booking.status.toLowerCase() === statusFilter : true;
    const matchesChannel = channelFilter ? channel === channelFilter : true;
    return matchesQuery && matchesStatus && matchesChannel;
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const bookingsThisMonth = normalizedBookings.filter(({ booking }) => booking.createdAt >= monthStart);
  const totalMarkupThisMonth = bookingsThisMonth.reduce((sum, item) => sum + (item.booking.agencyMarkupAmount ?? 0), 0);
  const totalDirectCommissionThisMonth = bookingsThisMonth.reduce((sum, item) => {
    return item.channel === "direct" ? sum + (item.booking.agencyFee ?? 0) : sum;
  }, 0);
  const upcomingCount = normalizedBookings.filter(({ booking }) => booking.travelDate >= new Date()).length;
  const agencyProCount = normalizedBookings.filter((item) => item.channel === "agencypro").length;

  const latestBooking = normalizedBookings[0]?.booking ?? null;

  return (
    <PanelShell roleLabel="Agency" title="Reservas" navItems={[{ label: "Reservas", href: "/agency/bookings" }]}>
      <section className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Control operativo</p>
              <h1 className="mt-3 text-3xl font-semibold">Reservas de agencia</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                Supervisa reservas directas y ventas por AgencyPro, detecta salidas proximas y abre solo la informacion
                que necesitas para operar.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Ultima reserva</p>
              <p className="mt-2 text-lg font-semibold">{latestBooking?.customerName ?? "Sin actividad reciente"}</p>
              <p className="mt-1 text-slate-300">
                {latestBooking ? `${latestBooking.bookingCode ?? latestBooking.id} · ${formatDate(latestBooking.travelDate)}` : "Todavia no hay reservas"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Reservas este mes" value={String(bookingsThisMonth.length)} helper="Operacion cerrada este mes" />
          <MetricCard label="Margen AgencyPro" value={formatMoney(totalMarkupThisMonth)} helper="Ganancia por enlaces AgencyPro" />
          <MetricCard label="Comision directa" value={formatMoney(totalDirectCommissionThisMonth)} helper="Descuento aplicado a reservas directas" />
          <MetricCard label="Proximas salidas" value={String(upcomingCount)} helper="Reservas futuras activas" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
          <form className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" method="get">
            <div className="grid gap-3 md:grid-cols-[1.4fr,1fr,1fr,auto]">
              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</span>
                <input
                  name="query"
                  defaultValue={resolvedSearchParams?.query ?? ""}
                  placeholder="Cliente, codigo, tour, hotel o vehiculo"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estado</span>
                <select
                  name="status"
                  defaultValue={resolvedSearchParams?.status ?? ""}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
                >
                  <option value="">Todos</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="pending">Pendientes</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="completed">Completadas</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Canal</span>
                <select
                  name="channel"
                  defaultValue={resolvedSearchParams?.channel ?? ""}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
                >
                  <option value="">Todos</option>
                  <option value="direct">Cuenta de agencia</option>
                  <option value="agencypro">AgencyPro</option>
                </select>
              </label>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                >
                  Filtrar
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Resumen rapido</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <QuickStat label="Resultados" value={String(filtered.length)} />
              <QuickStat label="AgencyPro" value={String(agencyProCount)} />
              <QuickStat label="Directas" value={String(normalizedBookings.length - agencyProCount)} />
              <QuickStat
                label="Total vendido"
                value={formatMoney(filtered.reduce((sum, item) => sum + item.booking.totalAmount, 0))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">No encontramos reservas con esos filtros.</p>
              <p className="mt-2 text-sm text-slate-500">
                Ajusta la busqueda o cambia el canal y el estado para ver mas operaciones.
              </p>
            </div>
          ) : (
            filtered.map(({ booking, presentation, channel }) => {
              const bookingTripType = (booking as any).tripType as string | null | undefined;
              const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
              const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
              const returnDateLabel = bookingReturnTravelDate ? formatDate(bookingReturnTravelDate) : "No aplica";
              const needsRequest = requiresCancellationRequest(booking.travelDate);
              const isAgencyPro = channel === "agencypro";

              return (
                <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">
                          {booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                            isAgencyPro
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-sky-50 text-sky-700"
                          }`}
                        >
                          {isAgencyPro ? "AgencyPro" : "Reserva directa"}
                        </span>
                        <BookingStatusBadge status={booking.status as BookingStatus} />
                      </div>

                      <h2 className="text-2xl font-semibold text-slate-900">{booking.Tour?.title ?? "Tour no disponible"}</h2>
                      <p className="text-sm text-slate-500">
                        {formatDate(booking.travelDate)} · {booking.startTime ?? "Hora pendiente"} · {booking.paxAdults + booking.paxChildren} pax
                      </p>
                    </div>

                    <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm min-w-[220px]">
                      <InfoRow label="Cliente" value={booking.customerName ?? "Pendiente"} />
                      <InfoRow label="Total venta" value={formatMoney(booking.totalAmount)} />
                      <InfoRow
                        label={isAgencyPro ? "Margen AgencyPro" : "Comision directa"}
                        value={formatMoney(isAgencyPro ? booking.agencyMarkupAmount ?? 0 : booking.agencyFee ?? 0)}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-4">
                    <SummaryCard label="Fecha de ida" value={`${formatDate(booking.travelDate)} · ${booking.startTime ?? "Pendiente"}`} />
                    <SummaryCard
                      label="Fecha de regreso"
                      value={`${returnDateLabel}${bookingReturnStartTime ? ` · ${bookingReturnStartTime}` : ""}`}
                    />
                    <SummaryCard label={presentation.routeLabel} value={presentation.routeValue} />
                    <SummaryCard label={presentation.logisticsLabel} value={presentation.logisticsValue || "Pendiente"} />
                  </div>

                  <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                      Mostrar detalles operativos
                    </summary>

                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                      <DetailBox title="Cliente">
                        <InfoRow label="Nombre" value={booking.customerName ?? "Pendiente"} />
                        <InfoRow label="Correo" value={booking.customerEmail ?? "Pendiente"} />
                        <InfoRow label="Telefono" value={booking.customerPhone ?? "No registrado"} />
                      </DetailBox>

                      <DetailBox title={presentation.serviceLabel}>
                        <InfoRow label={presentation.primaryDetailsLabel} value={presentation.primaryDetailsValue} />
                        <InfoRow label={presentation.notesLabel} value={presentation.notesValue} />
                        {booking.transferVehicleName ? (
                          <InfoRow
                            label="Vehiculo"
                            value={`${booking.transferVehicleName}${booking.transferVehicleCategory ? ` · ${booking.transferVehicleCategory}` : ""}`}
                          />
                        ) : null}
                        {bookingTripType ? <InfoRow label="Tipo de traslado" value={bookingTripType} /> : null}
                      </DetailBox>

                      <DetailBox title="Control interno">
                        <InfoRow
                          label="Codigo interno"
                          value={`${booking.bookingCode ?? booking.id} · ${booking.id.slice(0, 8).toUpperCase()}`}
                        />
                        <InfoRow label="Canal" value={isAgencyPro ? "AgencyPro" : "Cuenta de agencia"} />
                        <InfoRow label="Creada" value={booking.createdAt.toLocaleString("es-ES")} />
                        <InfoRow label="Tiempo restante" value={formatTimeUntil(booking.travelDate)} />
                        {booking.flightNumber ? <InfoRow label="Vuelo" value={booking.flightNumber} /> : null}
                      </DetailBox>
                    </div>
                  </details>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <details className="space-y-2 text-xs text-slate-500">
                      <summary className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
                        {needsRequest ? "Solicitar cancelacion" : "Cancelar reserva"}
                      </summary>
                      <form
                        action={needsRequest ? agencyRequestCancellation : agencyCancelBooking}
                        method="post"
                        className="mt-2 w-72 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
                      >
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500">
                          Motivo de cancelacion
                          <textarea
                            name="reason"
                            required
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700"
                          />
                        </label>
                        <button
                          type="submit"
                          className="w-full rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
                        >
                          {needsRequest ? "Enviar solicitud" : "Cancelar ahora"}
                        </button>
                      </form>
                    </details>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </PanelShell>
  );
}

const MetricCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </article>
);

const QuickStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

const DetailBox = ({ title, children }: { title: string; children: ReactNode }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
    <div className="mt-3 space-y-3">{children}</div>
  </article>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
