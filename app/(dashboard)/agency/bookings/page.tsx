export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, MessageCircle } from "lucide-react";
import { getServerSession } from "next-auth";

import { agencyCancelBooking, agencyRequestCancellation } from "@/lib/actions/bookingCancellation";
import { buildAgencyBookingWhere } from "@/lib/agencyMetrics";
import { authOptions } from "@/lib/auth";
import { formatTimeUntil, requiresCancellationRequest } from "@/lib/bookings";
import { buildBookingPresentation } from "@/lib/bookingPresentation";
import { prisma } from "@/lib/prisma";
import { getSiteDateKey } from "@/lib/site-date";

type PageProps = {
  searchParams?: Promise<{
    query?: string;
    code?: string;
    date?: string;
    status?: string;
    channel?: string;
  }>;
};

type AgencyBookingChannel = "direct" | "agencypro" | "agencypro-transfer";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const formatHeaderDate = (value: Date) =>
  value.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

const formatLongDate = (value: Date) =>
  value.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

const formatSentDate = (value: Date) =>
  value.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

const formatSubtitleDateTime = (value: Date, startTime?: string | null) => {
  const datePart = value.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  return startTime ? `${datePart} · ${startTime}` : datePart;
};

const statusLabelMap: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  PAYMENT_PENDING: "Pago pendiente",
  CANCELLATION_REQUESTED: "Cancelación solicitada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada"
};

const channelLabelMap: Record<AgencyBookingChannel, string> = {
  direct: "Cuenta de agencia",
  agencypro: "AgencyPro tour",
  "agencypro-transfer": "AgencyPro transfer"
};

export default async function AgencyBookingsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver tus reservas.</div>;
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.query?.trim().toLowerCase() ?? "";
  const codeFilter = resolvedSearchParams?.code?.trim().toLowerCase() ?? "";
  const dateFilter = resolvedSearchParams?.date?.trim() ?? "";
  const statusFilter = resolvedSearchParams?.status?.trim().toLowerCase() ?? "";
  const channelFilter = resolvedSearchParams?.channel?.trim().toLowerCase() ?? "";

  const bookings = await prisma.booking.findMany({
    where: buildAgencyBookingWhere(userId),
    include: {
      Tour: true,
      AgencyProLink: true,
      AgencyTransferLink: true
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

    const channel: AgencyBookingChannel = booking.AgencyTransferLink
      ? "agencypro-transfer"
      : booking.AgencyProLink
        ? "agencypro"
        : "direct";

    return {
      booking,
      presentation,
      channel,
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
    const matchesCode = codeFilter ? (booking.bookingCode ?? booking.id).toLowerCase().includes(codeFilter) : true;
    const matchesDate = dateFilter ? getSiteDateKey(booking.travelDate) === dateFilter : true;
    const matchesStatus = statusFilter ? booking.status.toLowerCase() === statusFilter : true;
    const matchesChannel = channelFilter ? channel === channelFilter : true;
    return matchesQuery && matchesCode && matchesDate && matchesStatus && matchesChannel;
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const bookingsThisMonth = normalizedBookings.filter(({ booking }) => booking.createdAt >= monthStart);
  const totalMarkupThisMonth = bookingsThisMonth.reduce((sum, item) => sum + (item.booking.agencyMarkupAmount ?? 0), 0);
  const totalDirectCommissionThisMonth = bookingsThisMonth.reduce((sum, item) => {
    return item.channel === "direct" ? sum + (item.booking.agencyFee ?? 0) : sum;
  }, 0);
  const todayKey = getSiteDateKey();
  const upcomingCount = normalizedBookings.filter(({ booking }) => getSiteDateKey(booking.travelDate) >= todayKey).length;
  const latestBooking = normalizedBookings[0]?.booking ?? null;

  return (
    <section className="space-y-5">
      <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Control operativo</p>
            <h1 className="mt-3 text-3xl font-semibold">Reservas de agencia</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Vista simple para revisar viajero, código, fecha y operación sin separar la información en demasiados bloques.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Última reserva</p>
            <p className="mt-2 text-lg font-semibold">{latestBooking?.customerName ?? "Sin actividad reciente"}</p>
            <p className="mt-1 text-slate-300">
              {latestBooking
                ? `${latestBooking.bookingCode ?? latestBooking.id} · ${formatLongDate(latestBooking.travelDate)}`
                : "Todavía no hay reservas"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Reservas este mes" value={String(bookingsThisMonth.length)} helper="Operación cerrada este mes" />
        <MetricCard label="Margen AgencyPro" value={formatMoney(totalMarkupThisMonth)} helper="Enlaces con precio propio" />
        <MetricCard
          label="Comisión directa"
          value={formatMoney(totalDirectCommissionThisMonth)}
          helper="Reservas directas de agencia"
        />
        <MetricCard label="Próximas salidas" value={String(upcomingCount)} helper="Servicios futuros activos" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1.3fr,1fr,1fr,1fr,1fr,auto]" method="get">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</span>
            <input
              name="query"
              defaultValue={resolvedSearchParams?.query ?? ""}
              placeholder="Cliente, correo, tour o pickup"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Código</span>
            <input
              name="code"
              defaultValue={resolvedSearchParams?.code ?? ""}
              placeholder="PRO-XXXX"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Fecha</span>
            <input
              type="date"
              name="date"
              defaultValue={resolvedSearchParams?.date ?? ""}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
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
              <option value="agencypro">AgencyPro tour</option>
              <option value="agencypro-transfer">AgencyPro transfer</option>
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
        </form>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No encontramos reservas con esos filtros.</p>
            <p className="mt-2 text-sm text-slate-500">Ajusta la búsqueda, la fecha o el código para ver más operaciones.</p>
          </div>
        ) : (
          filtered.map(({ booking, presentation, channel }) => {
            const bookingTripType = (booking as any).tripType as string | null | undefined;
            const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
            const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
            const isTransfer = booking.flowType === "transfer";
            const isRoundTripTransfer = isTransfer && bookingTripType === "round-trip";
            const needsRequest = requiresCancellationRequest(booking.travelDate);
            const statusLabel = statusLabelMap[booking.status] ?? booking.status;
            const totalPassengers = booking.paxAdults + booking.paxChildren;
            const whatsappHref = booking.customerPhone ? `https://wa.me/${booking.customerPhone.replace(/\D/g, "")}` : null;
            const title = booking.Tour?.title ?? "Servicio no disponible";
            const subtitle = isTransfer
              ? `${presentation.routeValue} · ${formatSubtitleDateTime(booking.travelDate, booking.startTime)}`
              : `${title} ${booking.startTime ?? ""}`.trim();

            return (
              <article key={booking.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span>{formatHeaderDate(booking.travelDate)}</span>
                    </div>
                    <StatusPill label={statusLabel} />
                  </div>

                  <div className="mt-4 max-w-4xl">
                    <h2 className="text-3xl font-semibold leading-tight text-slate-950">{title}</h2>
                    <p className="mt-3 text-[1.02rem] text-slate-500">{subtitle}</p>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <InfoLine label="Viajero principal" value={booking.customerName ?? "Pendiente"} />
                        <p className="text-lg text-slate-700">
                          {totalPassengers} {totalPassengers === 1 ? "adulto" : "adultos"}
                        </p>
                      </div>

                      <div className="space-y-2 md:text-right">
                        <p className="text-[1.05rem] font-semibold text-slate-950">{booking.bookingCode ?? booking.id}</p>
                        <p className="text-lg text-slate-700">Enviada {formatSentDate(booking.createdAt)}</p>
                      </div>
                    </div>

                    <details className="group mt-5">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-medium text-teal-700">
                        <span className="group-open:hidden">Mostrar detalles</span>
                        <span className="hidden group-open:inline">Ocultar detalles</span>
                        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                      </summary>

                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <div className="grid gap-8 md:grid-cols-2">
                          <div className="space-y-6">
                            <DetailGroup title={isTransfer ? "Datos del viajero" : "Datos de la experiencia"}>
                              <InfoLine label="Correo" value={booking.customerEmail ?? "Pendiente"} />
                              <InfoLine label="Teléfono" value={booking.customerPhone ?? "No registrado"} />
                              <InfoLine label="Canal" value={channelLabelMap[channel]} />
                              <InfoLine
                                label={isTransfer ? "Importe total" : "Venta total"}
                                value={formatMoney(booking.totalAmount)}
                              />
                              <InfoLine
                                label={channel === "direct" ? "Comisión directa" : "Margen AgencyPro"}
                                value={formatMoney(channel === "direct" ? booking.agencyFee ?? 0 : booking.agencyMarkupAmount ?? 0)}
                              />
                            </DetailGroup>

                            <DetailGroup title={isTransfer ? "Operación" : "Servicios incluidos"}>
                              <InfoLine label={presentation.primaryDetailsLabel} value={presentation.primaryDetailsValue} />
                              <InfoLine label={presentation.notesLabel} value={presentation.notesValue} />
                              {!isTransfer && booking.Tour?.includes ? <SimpleList text={booking.Tour.includes} /> : null}
                            </DetailGroup>
                          </div>

                          <div className="space-y-6">
                            <DetailGroup title={isTransfer ? "Logística" : "Control de reserva"}>
                              <InfoLine label={presentation.routeLabel} value={presentation.routeValue} />
                              <InfoLine label={presentation.logisticsLabel} value={presentation.logisticsValue || "Pendiente"} />
                              {isTransfer && booking.transferVehicleName ? (
                                <InfoLine
                                  label="Vehículo"
                                  value={`${booking.transferVehicleName}${booking.transferVehicleCategory ? ` · ${booking.transferVehicleCategory}` : ""}`}
                                />
                              ) : null}
                              {isRoundTripTransfer ? (
                                <InfoLine
                                  label="Fecha de regreso"
                                  value={`${bookingReturnTravelDate ? formatLongDate(bookingReturnTravelDate) : "Pendiente"}${bookingReturnStartTime ? ` · ${bookingReturnStartTime}` : ""}`}
                                />
                              ) : null}
                              {booking.flightNumber ? <InfoLine label="Vuelo" value={booking.flightNumber} /> : null}
                              <InfoLine label="Código interno" value={`${booking.bookingCode ?? booking.id} · ${booking.id.slice(0, 8).toUpperCase()}`} />
                              <InfoLine label="Tiempo restante" value={formatTimeUntil(booking.travelDate)} />
                            </DetailGroup>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
                  <details className="space-y-2 text-xs text-slate-500">
                    <summary className="cursor-pointer list-none text-base text-teal-700">
                      {needsRequest ? "Solicitar cancelación" : "Cancelar reserva"}
                    </summary>
                    <form
                      action={needsRequest ? agencyRequestCancellation : agencyCancelBooking}
                      method="post"
                      className="mt-2 w-72 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
                    >
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500">
                        Motivo de cancelación
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

                  {whatsappHref ? (
                    <Link
                      href={whatsappHref}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded border border-teal-700 px-5 py-3 text-base font-medium text-teal-700 transition hover:bg-teal-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Enviar un mensaje al viajero
                    </Link>
                  ) : (
                    <span className="rounded border border-slate-200 px-5 py-3 text-sm text-slate-400">Sin teléfono del viajero</span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

const MetricCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </article>
);

const StatusPill = ({ label }: { label: string }) => (
  <span className="rounded bg-teal-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">{label}</span>
);

const InfoLine = ({ label, value }: { label: string; value: string }) => (
  <p className="text-[1rem] leading-7 text-slate-700">
    <span className="font-semibold text-slate-950">{label}:</span> {value}
  </p>
);

const DetailGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-3">
    <p className="text-lg font-semibold uppercase tracking-[0.03em] text-slate-700">{title}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

const SimpleList = ({ text }: { text: string }) => (
  <ul className="list-disc space-y-1 pl-5 text-[1rem] text-slate-700">
    {text
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8)
      .map((item) => (
        <li key={item}>{item}</li>
      ))}
  </ul>
);
