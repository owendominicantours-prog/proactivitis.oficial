export const dynamic = "force-dynamic"; // Needs fresh reservation & cancellation data in every render.

import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/types/booking";
import { BookingTable, BookingRow } from "@/components/bookings/BookingTable";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import {
  adminCancelBooking,
  adminApproveCancellation
} from "@/lib/actions/bookingCancellation";
import { formatTimeUntil } from "@/lib/bookings";

type TabKey = "today" | "tomorrow" | "upcoming" | "past" | "payment";

const tabs: { key: TabKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "tomorrow", label: "Mañana" },
  { key: "upcoming", label: "Próximos" },
  { key: "past", label: "Pasados" },
  { key: "payment", label: "Pendientes de pago" }
];

const statusOptions: BookingStatus[] = [
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
  const rows: BookingRow[] = bookings.map((booking) => ({
    id: booking.id,
    travelDate: booking.travelDate.toLocaleDateString("es-ES"),
    createdAt: booking.createdAt.toLocaleDateString("es-ES"),
    travelDateValue: booking.travelDate.toISOString(),
    createdAtValue: booking.createdAt.toISOString(),
    tourTitle: booking.Tour?.title ?? "Tour no disponible",
    customerName: booking.customerName,
    pax: booking.paxAdults + booking.paxChildren,
    totalAmount: booking.totalAmount,
    status: booking.status as BookingStatus,
    source: booking.source as BookingRow["source"],
    hotel: booking.hotel,
    cancellationReason: booking.cancellationReason,
    cancellationByRole: booking.cancellationByRole,
    cancellationAt: booking.cancellationAt?.toISOString() ?? null
  }));
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

  const withinDateMode = (booking: BookingRow) => {
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

  const tabFilter = (booking: BookingRow) => {
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
        booking.bookingCode.toLowerCase().includes(query) ||
        booking.customerEmail.toLowerCase().includes(query)
      );
    })
    .filter((booking) => {
      if (!pickupSearch.trim()) return true;
      const target = pickupSearch.trim().toLowerCase();
      const pickupText = `${booking.hotel ?? ""} ${booking.status}`;
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
          const travelTime = booking.startTime ? `00:00` : "00:00";
          return travel;
        })
        .filter((date) => date > now)
        .sort((a, b) => a.getTime() - b.getTime());
      if (!upcoming.length) return null;
      const diff = Math.round((upcoming[0].getTime() - now.getTime()) / 60000);
      return diff;
    })()
  };

  const rowActions: Record<string, ReactNode> = {};
  bookings.forEach((booking) => {
    rowActions[booking.id] = (
      <details key={booking.id} className="space-y-2 text-xs text-slate-500">
        <summary className="cursor-pointer rounded-md border border-slate-200 px-3 py-1 text-center font-semibold text-slate-600">
          Cancelar
        </summary>
        <form action={adminCancelBooking} method="post" className="space-y-2">
          <input type="hidden" name="bookingId" value={booking.id} />
          <textarea
            name="reason"
            required
            placeholder="Motivo de cancelación"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            Confirmar cancelación
          </button>
        </form>
      </details>
    );
  });

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

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <BookingTable
          bookings={filteredRows}
          showFields={{ showHotel: true, showSource: true, showPickup: true }}
          rowActions={rowActions}
        />
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
