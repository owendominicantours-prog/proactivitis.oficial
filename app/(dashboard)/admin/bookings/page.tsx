export const dynamic = "force-dynamic"; // Needs fresh reservation & cancellation data in every render.

import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/types/booking";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import {
  adminCancelBooking,
  adminApproveCancellation
} from "@/lib/actions/bookingCancellation";
import { formatTimeUntil } from "@/lib/bookings";
import { updateBookingStatus } from "@/lib/actions/bookingStatus";
import { addAdminBookingNote } from "@/app/(dashboard)/admin/bookings/actions";

type TimelineEntry = {
  title: string;
  description: string;
  timestamp: string;
};

type AdminNote = {
  author: string;
  message: string;
  timestamp: string;
};

type AdminBookingView = {
  id: string;
  travelDate: string;
  travelDateValue: string;
  createdAtValue: string;
  updatedAtValue: string | null;
  tourTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pax: number;
  totalAmount: number;
  supplierAmount: number;
  platformFee: number;
  bookingCode: string;
  status: BookingStatus;
  source: string;
  hotel: string | null;
  pickup: string | null;
  startTime: string | null;
  flightNumber: string | null;
  originAirport: string | null;
  pickupNotes: string | null;
  cancellationReason: string | null;
  cancellationByRole: string | null;
  cancellationAt: string | null;
  timeline: TimelineEntry[];
  notes: AdminNote[];
};

type TabKey = "today" | "tomorrow" | "upcoming" | "past" | "payment";

const tabs: { key: TabKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "tomorrow", label: "Mañana" },
  { key: "upcoming", label: "Próximos" },
  { key: "past", label: "Pasados" },
  { key: "payment", label: "Pendientes de pago" }
];

const statusOptions = [
  "PENDING",
  "CONFIRMED",
  "PAYMENT_PENDING",
  "CANCELLED",
  "COMPLETED",
  "CANCELLATION_REQUESTED"
];

export default async function AdminBookingsPage({ searchParams }: any) {
  const bookings = await prisma.booking.findMany({
    include: { Tour: true },
    orderBy: { createdAt: "desc" }
  });
  const bookingIds = bookings.map((booking) => booking.id);
  const notifications = await prisma.notification.findMany({
    where: {
      bookingId: {
        in: bookingIds
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const timelineMap: Record<string, TimelineEntry[]> = {};
  const notesMap: Record<string, AdminNote[]> = {};
  notifications.forEach((notification) => {
    if (!notification.bookingId) return;
    let metadata: Record<string, unknown> | null = null;
    if (notification.metadata) {
      try {
        metadata = JSON.parse(notification.metadata);
      } catch {
        metadata = null;
      }
    }
    const author = metadata?.author
      ? String(metadata.author)
      : "Admin";
    const entry: TimelineEntry = {
      title: notification.title ?? "Actualización",
      description: notification.message ?? notification.body ?? "Sin detalle adicional",
      timestamp: notification.createdAt.toISOString()
    };
    timelineMap[notification.bookingId] = timelineMap[notification.bookingId] ?? [];
    timelineMap[notification.bookingId].push(entry);
    if (notification.type === "ADMIN_BOOKING_NOTE") {
      notesMap[notification.bookingId] = notesMap[notification.bookingId] ?? [];
      notesMap[notification.bookingId].push({
        author,
        message: notification.message ?? notification.body ?? "Sin contenido",
        timestamp: notification.createdAt.toISOString()
      });
    }
  });
  const rows: AdminBookingView[] = bookings.map((booking) => {
    const notificationEvents = timelineMap[booking.id] ?? [];
    const baseTimeline: TimelineEntry[] = [
      {
        title: "Reserva creada",
        description: `Origen: ${booking.source}`,
        timestamp: booking.createdAt.toISOString()
      }
    ];
    if (booking.paymentStatus) {
      baseTimeline.push({
        title: "Pago",
        description: `Estado Stripe: ${booking.paymentStatus}`,
        timestamp: booking.updatedAt?.toISOString() ?? booking.createdAt.toISOString()
      });
    }
    if (booking.cancellationReason) {
      baseTimeline.push({
        title: "Solicitud de cancelación",
        description: booking.cancellationReason,
        timestamp: booking.cancellationAt?.toISOString() ?? booking.updatedAt?.toISOString() ?? booking.createdAt.toISOString()
      });
    }
    const timeline = [...baseTimeline, ...notificationEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      id: booking.id,
      travelDate: booking.travelDate.toLocaleDateString("es-ES"),
      travelDateValue: booking.travelDate.toISOString(),
      createdAtValue: booking.createdAt.toISOString(),
      updatedAtValue: booking.updatedAt?.toISOString() ?? null,
      tourTitle: booking.Tour?.title ?? "Tour no disponible",
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone ?? "",
      pax: booking.paxAdults + booking.paxChildren,
      totalAmount: booking.totalAmount,
      supplierAmount: booking.supplierAmount ?? 0,
      platformFee: booking.platformFee ?? 0,
      bookingCode: booking.bookingCode ?? booking.id,
      status: booking.status as BookingStatus,
      source: booking.source,
      hotel: booking.hotel,
      pickup: booking.pickup,
      startTime: booking.startTime,
      flightNumber: booking.flightNumber,
      originAirport: booking.originAirport,
      pickupNotes: booking.pickupNotes,
      cancellationReason: booking.cancellationReason,
      cancellationByRole: booking.cancellationByRole,
      cancellationAt: booking.cancellationAt?.toISOString() ?? null,
      timeline,
      notes: notesMap[booking.id] ?? []
    };
  });
  const cancellationRequests = rows.filter((booking) => booking.status === "CANCELLATION_REQUESTED");

  const getParam = (key: string) => {
    const value = searchParams?.[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const tab = (getParam("tab") as TabKey) ?? "today";
  const dateMode = (getParam("date") as "today" | "tomorrow" | "week" | "range") ?? "today";
  const customStart = getParam("startDate");
  const customEnd = getParam("endDate");

  const statusParam = searchParams?.status;
  const selectedStatus = statusParam
    ? Array.isArray(statusParam)
      ? statusParam
      : [statusParam]
    : statusOptions;

  const selectedTour = getParam("tour") ?? "all";
  const searchQuery = getParam("query") ?? "";
  const pickupSearch = getParam("pickup") ?? "";

  const uniqueTours = Array.from(
    new Set(bookings.map((booking) => booking.Tour?.title ?? "Tour sin título"))
  ).sort();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const weekLater = new Date(now);
  weekLater.setDate(now.getDate() + 7);

  const withinDateMode = (booking: AdminBookingView) => {
    const travel = new Date(booking.travelDateValue);
    switch (dateMode) {
      case "today":
        return (
          travel.getFullYear() === now.getFullYear() &&
          travel.getMonth() === now.getMonth() &&
          travel.getDate() === now.getDate()
        );
      case "tomorrow":
        return (
          travel.getFullYear() === tomorrow.getFullYear() &&
          travel.getMonth() === tomorrow.getMonth() &&
          travel.getDate() === tomorrow.getDate()
        );
      case "week":
        return travel >= now && travel <= weekLater;
      case "range": {
        if (!customStart || !customEnd) return true;
        const start = new Date(customStart);
        const end = new Date(customEnd);
        return travel >= start && travel <= end;
      }
      default:
        return true;
    }
  };

  const tabFilter = (booking: AdminBookingView) => {
    const travel = new Date(booking.travelDateValue);
    switch (tab) {
      case "today":
        return withinDateMode(booking);
      case "tomorrow":
        return (
          travel.getFullYear() === tomorrow.getFullYear() &&
          travel.getMonth() === tomorrow.getMonth() &&
          travel.getDate() === tomorrow.getDate()
        );
      case "upcoming":
        return travel > tomorrow && travel <= weekLater;
      case "past":
        return travel < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "payment":
        return booking.status === "PAYMENT_PENDING";
      default:
        return true;
    }
  };

  const filteredRows = rows
    .filter(withinDateMode)
    .filter((booking) => (selectedStatus.length ? selectedStatus.includes(booking.status) : true))
    .filter((booking) => (selectedTour === "all" ? true : booking.tourTitle === selectedTour))
    .filter((booking) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.trim().toLowerCase();
      return (
        booking.customerName?.toLowerCase().includes(query) ||
        (booking.bookingCode ?? booking.id).toLowerCase().includes(query) ||
        booking.customerEmail.toLowerCase().includes(query)
      );
    })
    .filter((booking) => {
      if (!pickupSearch.trim()) return true;
      const target = pickupSearch.trim().toLowerCase();
      const pickupText = `${booking.hotel ?? booking.pickup ?? ""}`;
      return pickupText.toLowerCase().includes(target);
    })
    .filter(tabFilter);

  const summary = {
    reservasHoy: rows.filter(
      (booking) =>
        new Date(booking.travelDateValue).toDateString() === now.toDateString()
    ).length,
    pendientesPago: rows.filter((booking) =>
      ["PAYMENT_PENDING", "PENDING"].includes(booking.status)
    ).length,
    totalPaxHoy: rows
      .filter((booking) => new Date(booking.travelDateValue).toDateString() === now.toDateString())
      .reduce((total, booking) => total + booking.pax, 0),
    totalDelDia: rows
      .filter((booking) => new Date(booking.travelDateValue).toDateString() === now.toDateString())
      .reduce((total, booking) => total + booking.totalAmount, 0),
    nextDepartureMinutes: (() => {
      const upcoming = rows
      .map((booking) => {
          const travel = new Date(booking.travelDateValue);
          return travel;
        })
        .filter((date) => date > now)
        .sort((a, b) => a.getTime() - b.getTime());
      if (!upcoming.length) return null;
      const diff = Math.round((upcoming[0].getTime() - now.getTime()) / 60000);
      return diff;
    })()
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-5">
        <DashboardMetric label="Reservas hoy" value={summary.reservasHoy} />
        <DashboardMetric label="Pendientes de pago" value={summary.pendientesPago} />
        <DashboardMetric label="Total pax hoy" value={summary.totalPaxHoy} />
        <DashboardMetric
          label="Próxima salida"
          value={summary.nextDepartureMinutes !== null ? `en ${summary.nextDepartureMinutes} min` : "sin salidas"}
        />
        <DashboardMetric label="Total día" value={`$${summary.totalDelDia.toFixed(2)}`} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <div>
            <label className="text-xs uppercase text-slate-500">Fecha</label>
            <select
              name="date"
              form="filters-form"
              defaultValue={dateMode}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="today">Hoy</option>
              <option value="tomorrow">Mañana</option>
              <option value="week">Semana</option>
              <option value="range">Rango</option>
            </select>
            {dateMode === "range" && (
              <div className="mt-2 flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  form="filters-form"
                  defaultValue={customStart}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
                <input
                  type="date"
                  name="endDate"
                  form="filters-form"
                  defaultValue={customEnd}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Estado</label>
            <select
              name="status"
              form="filters-form"
              defaultValue={selectedStatus?.[0]}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Tour</label>
            <select
              name="tour"
              form="filters-form"
              defaultValue={selectedTour}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              {uniqueTours.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Buscar</label>
            <input
              name="query"
              form="filters-form"
              defaultValue={searchQuery}
              placeholder="Cliente o ID"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Pickup/Notas</label>
            <input
              name="pickup"
              form="filters-form"
              defaultValue={pickupSearch}
              placeholder="Hotel o zona"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <form id="filters-form" method="get" className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="tab" value={tab} />
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            Aplicar filtros
          </button>
        </form>
      </section>

      <section className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.4em]">
        {tabs.map((item) => (
          <a
            key={item.key}
            href={`?tab=${item.key}`}
            className={`rounded-full px-4 py-2 transition ${
              tab === item.key
                ? "border border-slate-900 bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {item.label}
          </a>
        ))}
      </section>

      <section className="space-y-4">
        {filteredRows.length ? (
          <div className="grid gap-4">
            {filteredRows.map((booking) => {
              const whatsappNumber = booking.customerPhone.replace(/[^0-9+]/g, "");
              const whatsappLink =
                whatsappNumber.length > 0
                  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hola ${booking.customerName}, te confirmamos tu reserva ${booking.bookingCode}.`
                    )}`
                  : null;

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                        {booking.bookingCode}
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">{booking.tourTitle}</h3>
                      <p className="text-sm text-slate-500">
                        {booking.travelDate} · {booking.startTime ?? "Hora pendiente"} · {booking.pax} pax
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Recogida</p>
                      <p className="text-sm text-slate-600">
                        {booking.pickup ?? "Sin punto definido"} &middot; {booking.hotel ?? "Hotel no especificado"}
                      </p>
                      <p className="text-xs text-slate-500">{booking.originAirport ?? "Origen no confirmado"}</p>
                      {booking.pickupNotes && (
                        <p className="text-xs text-slate-500">Notas: {booking.pickupNotes}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Logística</p>
                      <p className="text-sm text-slate-600">
                        Vuelo: {booking.flightNumber ?? "Pendiente"} · Room: {booking.pickupNotes ?? "N/D"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Creada: {new Date(booking.createdAtValue).toLocaleString("es-ES")}
                        {booking.updatedAtValue && ` · Actualizada: ${new Date(booking.updatedAtValue).toLocaleString("es-ES")}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Contacto</p>
                      <p className="text-sm text-slate-600">{booking.customerName}</p>
                      <p className="text-xs text-slate-500">{booking.customerEmail}</p>
                      {booking.customerPhone && (
                        <p className="text-xs text-slate-500">Tel: {booking.customerPhone}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Finanzas</p>
                      <p className="text-sm text-slate-600">${booking.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Comisión: ${booking.platformFee.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Neto: ${booking.supplierAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Origen</p>
                      <p className="text-sm text-slate-600">{booking.source}</p>
                      <p className="text-xs text-slate-500">
                        {formatTimeUntil(new Date(booking.travelDateValue))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                      >
                        WhatsApp al cliente
                      </a>
                    )}
                    {["PENDING", "PAYMENT_PENDING"].includes(booking.status) && (
                      <form action={updateBookingStatus} method="post" className="flex">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="status" value="CONFIRMED" />
                        <button
                          type="submit"
                          className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm"
                        >
                          Confirmar
                        </button>
                      </form>
                    )}
                    {booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
                      <form action={updateBookingStatus} method="post" className="flex">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button
                          type="submit"
                          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 hover:border-slate-900 hover:text-slate-900"
                        >
                          Marcar como completada
                        </button>
                      </form>
                    )}
                    <details className="relative">
                      <summary className="rounded-full border border-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
                        Cancelar reserva
                      </summary>
                      <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                        <form action={adminCancelBooking} method="post" className="space-y-2">
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <textarea
                            name="reason"
                            required
                            placeholder="Motivo para cancelar"
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700"
                          />
                          <button
                            type="submit"
                            className="w-full rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
                          >
                            Confirmar cancelación
                          </button>
                        </form>
                      </div>
                    </details>
                  </div>
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                      Centro de evidencia
                    </p>
                    <div className="mt-3 space-y-3">
                      {booking.timeline.length ? (
                        booking.timeline.slice(0, 4).map((event) => (
                          <div key={`${booking.id}-${event.timestamp}-${event.title}`} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400">
                              {new Date(event.timestamp).toLocaleString("es-ES")}
                            </p>
                            <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                            <p className="text-xs text-slate-500">{event.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Aún no hay actividad registrada.</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                        Notas privadas
                      </p>
                      {booking.notes.length ? (
                        <span className="text-xs text-slate-400">{booking.notes.length} nota(s)</span>
                      ) : null}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {booking.notes.length ? (
                        booking.notes.map((note) => (
                          <article key={`${booking.id}-${note.timestamp}-${note.author}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <p className="text-[11px] text-slate-500">
                              {new Date(note.timestamp).toLocaleString("es-ES")} · {note.author}
                            </p>
                            <p className="text-sm text-slate-700">{note.message}</p>
                          </article>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Sin notas registradas.</p>
                      )}
                    </div>
                    <form action={addAdminBookingNote} method="post" className="mt-4 space-y-2">
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input type="hidden" name="author" value="Admin" />
                      <textarea
                        name="note"
                        required
                        placeholder="Escribe una nota interna, por ejemplo: contacto con proveedor, seguimiento a agencia..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-700"
                      >
                        Guardar nota
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No hay reservas para estos filtros.
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Solicitudes de cancelación</h2>
            <p className="text-sm text-slate-500">Revisa lo que solicitaron las agencias o proveedores.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Pendientes</span>
        </div>
        {cancellationRequests.length ? (
          <div className="space-y-3">
            {cancellationRequests.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{booking.tourTitle}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {booking.travelDate} · {formatTimeUntil(new Date(booking.travelDateValue))}
                    </p>
                  </div>
                  <BookingStatusBadge status="CANCELLATION_REQUESTED" />
                </div>
                <p className="text-xs text-slate-500">
                  Solicitado por {booking.cancellationByRole ?? "Proveedor"} · Motivo: {booking.cancellationReason ?? "Sin motivo"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <form action={adminApproveCancellation} method="post" className="flex">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-600"
                    >
                      Aprobar cancelación
                    </button>
                  </form>
                  <form action={adminCancelBooking} method="post" className="flex">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <textarea
                      name="reason"
                      required
                      placeholder="Motivo para mantener"
                      className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-600 px-3 py-1 text-slate-700"
                    >
                      Mantener reserva
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
            No hay solicitudes pendientes.
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{label}</p>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
