export const dynamic = "force-dynamic"; // Needs fresh reservation & cancellation data in every render.

import { CalendarDays, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/types/booking";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import {
  adminCancelBooking,
  adminApproveCancellation
} from "@/lib/actions/bookingCancellation";
import { formatTimeUntil } from "@/lib/bookings";
import { buildBookingPresentation } from "@/lib/bookingPresentation";
import { addDaysToSiteDateKey, getSiteDateKey } from "@/lib/site-date";
import { updateBookingStatus } from "@/lib/actions/bookingStatus";
import { addAdminBookingNote, updateAdminTransferLogistics } from "@/app/(dashboard)/admin/bookings/actions";

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
  tripType: string | null;
  returnTravelDate: string | null;
  returnStartTime: string | null;
  flightNumber: string | null;
  originAirport: string | null;
  agencyName: string | null;
  agencyPhone: string | null;
  pickupNotes: string | null;
  tourIncludes: string | null;
  flowType: string | null;
  tourDuration: string | null;
  tourLanguage: string | null;
  meetingPoint: string | null;
  transferVehicleName: string | null;
  transferVehicleCategory: string | null;
  cancellationReason: string | null;
  cancellationByRole: string | null;
  cancellationAt: string | null;
  timeline: TimelineEntry[];
  notes: AdminNote[];
};

const statusLabelMap: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  PAYMENT_PENDING: "Pago pendiente",
  CANCELLATION_REQUESTED: "Cancelación solicitada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada"
};

const sourceLabelMap: Record<string, string> = {
  WEB: "Web directa",
  AGENCY: "Agencia",
  SUPPLIER: "Supplier",
  CUSTOMER: "Cliente"
};

const paymentStatusLabelMap: Record<string, string> = {
  requires_payment_method: "Falta método de pago",
  requires_confirmation: "Pendiente de confirmación",
  requires_action: "Requiere acción del cliente",
  processing: "Pago en proceso",
  succeeded: "Pago confirmado",
  canceled: "Pago cancelado"
};

const formatStatusLabel = (value?: string | null) => {
  if (!value) return "Sin estado";
  return statusLabelMap[value] ?? value.toLowerCase().replace(/_/g, " ");
};

const formatSourceLabel = (value?: string | null) => {
  if (!value) return "No definido";
  return sourceLabelMap[value] ?? value;
};

const formatPaymentStatusLabel = (value?: string | null) => {
  if (!value) return "Sin pago registrado";
  return paymentStatusLabelMap[value] ?? value;
};

type TabKey = "today" | "tomorrow" | "upcoming" | "past" | "payment";
const PAGE_SIZE = 20;

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
    include: {
      Tour: true,
      User: {
        include: {
          AgencyProfile: true,
          PartnerApplication: {
            orderBy: { updatedAt: "desc" },
            take: 1
          }
        }
      },
      AgencyProLink: {
        include: {
          AgencyUser: {
            include: {
              AgencyProfile: true,
              PartnerApplication: {
                orderBy: { updatedAt: "desc" },
                take: 1
              }
            }
          }
        }
      }
    },
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
    if (notification.role !== "ADMIN" && notification.type !== "ADMIN_BOOKING_NOTE") return;
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
    const notificationStatus =
      typeof metadata?.status === "string" ? formatStatusLabel(metadata.status) : null;
    const entry: TimelineEntry = {
      title: notification.title ?? "Actualización",
      description: notification.message ?? notification.body ?? "Sin detalle adicional",
      timestamp: notification.createdAt.toISOString()
    };
    if (notification.type === "ADMIN_BOOKING_MODIFIED") {
      entry.title = "Estado de la reserva";
      entry.description = notificationStatus
        ? `La reserva pasó a ${notificationStatus}.`
        : entry.description;
    }
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
    const agencyUser = booking.AgencyProLink?.AgencyUser ?? (booking.source === "AGENCY" ? booking.User : null);
    const agencyApplication = agencyUser?.PartnerApplication?.[0] ?? null;
    const bookingTripType = (booking as any).tripType as string | null | undefined;
    const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
    const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
    const notificationEvents = timelineMap[booking.id] ?? [];
    const baseTimeline: TimelineEntry[] = [
      {
        title: "Reserva creada",
        description: `Canal de entrada: ${formatSourceLabel(booking.source)}`,
        timestamp: booking.createdAt.toISOString()
      }
    ];
    if (booking.paymentStatus) {
      baseTimeline.push({
        title: "Estado de pago",
        description: formatPaymentStatusLabel(booking.paymentStatus),
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
      tripType: bookingTripType ?? null,
      returnTravelDate: bookingReturnTravelDate?.toISOString() ?? null,
      returnStartTime: bookingReturnStartTime ?? null,
      flightNumber: booking.flightNumber,
      originAirport: booking.originAirport,
      agencyName:
        agencyUser
          ? agencyUser.AgencyProfile?.companyName ?? agencyApplication?.companyName ?? agencyUser.name ?? "Agencia"
          : null,
      agencyPhone: agencyApplication?.phone ?? null,
      pickupNotes: booking.pickupNotes,
      tourIncludes: booking.Tour?.includes ?? null,
      flowType: booking.flowType ?? null,
      tourDuration: booking.Tour?.duration ?? null,
      tourLanguage: booking.Tour?.language ?? null,
      meetingPoint: booking.Tour?.meetingPoint ?? null,
      transferVehicleName: booking.transferVehicleName,
      transferVehicleCategory: booking.transferVehicleCategory,
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
  const pageParam = Math.max(1, Number(getParam("page") ?? "1") || 1);
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
  const codeQuery = getParam("code") ?? "";
  const pickupSearch = getParam("pickup") ?? "";
  const exactTravelDate = getParam("travelDate") ?? "";
  const orderParam = (getParam("order") as "created" | "travel") ?? "created";

  const uniqueTours = Array.from(
    new Set(bookings.map((booking) => booking.Tour?.title ?? "Tour sin título"))
  ).sort();

  const now = new Date();
  const todayKey = getSiteDateKey(now);
  const tomorrowKey = addDaysToSiteDateKey(todayKey, 1);
  const weekLaterKey = addDaysToSiteDateKey(todayKey, 7);
  const bookingDateKey = (booking: AdminBookingView) => getSiteDateKey(booking.travelDateValue);

  const withinDateMode = (booking: AdminBookingView) => {
    const travelKey = bookingDateKey(booking);
    switch (dateMode) {
      case "today":
        return travelKey === todayKey;
      case "tomorrow":
        return travelKey === tomorrowKey;
      case "week":
        return travelKey >= todayKey && travelKey <= weekLaterKey;
      case "range": {
        if (!customStart || !customEnd) return true;
        return travelKey >= customStart && travelKey <= customEnd;
      }
      default:
        return true;
    }
  };

  const tabFilter = (booking: AdminBookingView) => {
    const travelKey = bookingDateKey(booking);
    switch (tab) {
      case "today":
        return withinDateMode(booking);
      case "tomorrow":
        return travelKey === tomorrowKey;
      case "upcoming":
        return travelKey > todayKey;
      case "past":
        return travelKey < todayKey;
      case "payment":
        return booking.status === "PAYMENT_PENDING";
      default:
        return true;
    }
  };

  const shouldApplyDateFilter = tab === "today" || tab === "tomorrow" || dateMode === "range";
  const filteredRows = rows
    .filter((booking) => (shouldApplyDateFilter ? withinDateMode(booking) : true))
    .filter((booking) => {
      if (!exactTravelDate) return true;
      return bookingDateKey(booking) === exactTravelDate;
    })
    .filter((booking) => (selectedStatus.length ? selectedStatus.includes(booking.status) : true))
    .filter((booking) => (selectedTour === "all" ? true : booking.tourTitle === selectedTour))
    .filter((booking) => {
      if (!codeQuery.trim()) return true;
      return (booking.bookingCode ?? booking.id).toLowerCase().includes(codeQuery.trim().toLowerCase());
    })
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

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (orderParam === "travel") {
      return new Date(a.travelDateValue).getTime() - new Date(b.travelDateValue).getTime();
    }
    return new Date(b.createdAtValue).getTime() - new Date(a.createdAtValue).getTime();
  });
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPage = Math.min(pageParam, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = sortedRows.slice(pageStart, pageStart + PAGE_SIZE);

  const latestBooking = rows[0] ?? null;

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
      {latestBooking && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">Última reserva</p>
              <p className="text-lg font-semibold text-slate-900">{latestBooking.tourTitle}</p>
              <p className="text-sm text-slate-600">
                {latestBooking.customerName} · {latestBooking.bookingCode}
              </p>
            </div>
            <a
              href={`?tab=upcoming&date=week&query=${encodeURIComponent(latestBooking.bookingCode)}&order=created`}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              Ver en lista
            </a>
          </div>
        </section>
      )}
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
        <div className="grid gap-4 lg:grid-cols-7">
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
              <div className="relative z-10 mt-2 flex gap-2 rounded-lg bg-white">
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
            <details className="relative mt-2">
              <summary className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Seleccionar estados
              </summary>
              <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                <div className="grid gap-2">
                  {statusOptions.map((value) => (
                    <label key={value} className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        name="status"
                        form="filters-form"
                        defaultChecked={selectedStatus.includes(value)}
                        value={value}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            </details>
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
            <label className="text-xs uppercase text-slate-500">Código</label>
            <input
              name="code"
              form="filters-form"
              defaultValue={codeQuery}
              placeholder="PRO-XXXX"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Buscar</label>
            <input
              name="query"
              form="filters-form"
              defaultValue={searchQuery}
              placeholder="Cliente o correo"
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
          <div>
            <label className="text-xs uppercase text-slate-500">Fecha exacta</label>
            <input
              type="date"
              name="travelDate"
              form="filters-form"
              defaultValue={exactTravelDate}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Orden</label>
            <select
              name="order"
              form="filters-form"
              defaultValue={orderParam}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="created">Últimas creadas</option>
              <option value="travel">Fecha de salida</option>
            </select>
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
          <a
            href={`?tab=${tab}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
          >
            Limpiar filtros
          </a>
        </form>
      </section>

      <section className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em]">
        {tabs.map((item) => (
          <a
            key={item.key}
            href={`?tab=${item.key}&date=${dateMode}&tour=${encodeURIComponent(
              selectedTour
            )}&code=${encodeURIComponent(codeQuery)}&query=${encodeURIComponent(searchQuery)}&pickup=${encodeURIComponent(
              pickupSearch
            )}&travelDate=${encodeURIComponent(exactTravelDate)}&order=${orderParam}${selectedStatus
              .map((status) => `&status=${encodeURIComponent(status)}`)
              .join("")}`}
            className={`rounded-full px-4 py-2 transition ${
              tab === item.key
                ? "border border-slate-900 bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {item.label}
          </a>
        ))}
        <a
          href={`?tab=${tab}`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
        >
          Limpiar filtros
        </a>
      </section>

      <section className="space-y-4">
        {pageRows.length ? (
          <div className="grid gap-4">
            {pageRows.map((booking) => {
              const whatsappNumber = booking.customerPhone.replace(/[^0-9+]/g, "");
              const whatsappLink =
                whatsappNumber.length > 0
                  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hola ${booking.customerName}, te confirmamos tu reserva ${booking.bookingCode}.`
                    )}`
                  : null;
              const departureLabel = `${new Date(booking.travelDateValue).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}${booking.startTime ? ` · ${booking.startTime}` : ""}`;
              const returnLabel = booking.returnTravelDate
                ? `${new Date(booking.returnTravelDate).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}${booking.returnStartTime ? ` · ${booking.returnStartTime}` : ""}`
                : "No aplica";
              const routeOrigin = booking.originAirport ?? booking.pickup ?? booking.hotel ?? "Pendiente";
              const routeDestination = booking.hotel ?? booking.pickup ?? booking.tourTitle;
              const presentation = buildBookingPresentation({
                flowType: booking.flowType,
                tripType: booking.tripType,
                originAirport: booking.originAirport,
                flightNumber: booking.flightNumber,
                hotel: booking.hotel,
                pickup: booking.pickup,
                pickupNotes: booking.pickupNotes,
                returnTravelDate: booking.returnTravelDate,
                returnStartTime: booking.returnStartTime,
                startTime: booking.startTime,
                travelDateValue: booking.travelDateValue,
                tourIncludes: booking.tourIncludes,
                language: booking.tourLanguage,
                duration: booking.tourDuration,
                meetingPoint: booking.meetingPoint
              });
              const serviceNotes = presentation.notesValue;
              const logisticsSummary = [
                presentation.logisticsValue || null,
                formatTimeUntil(new Date(booking.travelDateValue))
              ]
                .filter(Boolean)
                .join(" · ");
              const headerDate = new Date(booking.travelDateValue).toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
              });
              const sentLabel = new Date(booking.createdAtValue).toLocaleString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });
              const subtitle =
                booking.flowType === "transfer"
                  ? booking.tripType === "round-trip"
                    ? `${presentation.routeValue} · Ida ${departureLabel} · Regreso ${returnLabel}`
                    : `${presentation.routeValue} · ${departureLabel}`
                  : `${booking.tourTitle} ${booking.startTime ?? ""}`.trim();

              return (
                <article
                  key={booking.id}
                  className={`overflow-hidden rounded-[28px] border bg-white shadow-sm ${
                    latestBooking?.id === booking.id ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200"
                  }`}
                  aria-label={`Reserva ${booking.bookingCode} para ${booking.customerName}`}
                >
                  <div className="px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span>{headerDate}</span>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>

                    <div className="mt-4 max-w-4xl">
                      <h3 className="text-3xl font-semibold leading-tight text-slate-900">{booking.tourTitle}</h3>
                      <p className="mt-3 text-[1.02rem] text-slate-500">{subtitle}</p>
                    </div>

                    <div className="mt-5 border-t border-slate-200 pt-5">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-[1rem] text-slate-700">
                            <span className="font-semibold text-slate-950">Viajero principal:</span> {booking.customerName}
                          </p>
                          <p className="text-lg text-slate-700">
                            {booking.pax} {booking.pax === 1 ? "adulto" : "adultos"}
                          </p>
                        </div>
                        <div className="space-y-2 md:text-right">
                          <p className="text-[1.05rem] font-semibold text-slate-950">{booking.bookingCode}</p>
                          <p className="text-lg text-slate-700">Enviada {sentLabel}</p>
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
                    <section className="space-y-4">
                      <p className="text-lg font-semibold uppercase tracking-[0.03em] text-slate-700">Cliente y servicio</p>
                      <div className="space-y-2">
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Cliente:</span> {booking.customerName}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Correo:</span> {booking.customerEmail}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Teléfono:</span> {booking.customerPhone || "Teléfono pendiente"}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">
                            {booking.flowType === "transfer" ? "Pickup ida:" : "Recogida:"}
                          </span>{" "}
                          {booking.pickup ?? booking.originAirport ?? "Sin punto definido"}
                        </p>
                        {booking.flowType === "transfer" && booking.tripType === "round-trip" ? (
                          <p className="text-[1rem] leading-7 text-slate-700">
                            <span className="font-semibold text-slate-950">Pickup regreso:</span>{" "}
                            {booking.hotel ?? "Sin punto definido"}
                          </p>
                        ) : null}
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Fecha ida:</span> {departureLabel}
                        </p>
                        {booking.flowType === "transfer" && booking.tripType === "round-trip" ? (
                          <p className="text-[1rem] leading-7 text-slate-700">
                            <span className="font-semibold text-slate-950">Fecha regreso:</span> {returnLabel}
                          </p>
                        ) : null}
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">{presentation.primaryDetailsLabel}:</span>{" "}
                          {presentation.primaryDetailsValue}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">{presentation.notesLabel}:</span> {serviceNotes}
                        </p>
                        {booking.transferVehicleName ? (
                          <p className="text-[1rem] leading-7 text-slate-700">
                            <span className="font-semibold text-slate-950">Vehículo:</span> {booking.transferVehicleName}
                            {booking.transferVehicleCategory ? ` · ${booking.transferVehicleCategory}` : ""}
                          </p>
                        ) : null}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <p className="text-lg font-semibold uppercase tracking-[0.03em] text-slate-700">Operación y finanzas</p>
                      <div className="space-y-2">
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">{presentation.routeLabel}:</span> {presentation.routeValue}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">{presentation.logisticsLabel}:</span>{" "}
                          {logisticsSummary || "Operación pendiente de confirmación"}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Códigos:</span> {booking.bookingCode} ·{" "}
                          {booking.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Canal:</span> {formatSourceLabel(booking.source)}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Agencia:</span> {booking.agencyName ?? "Reserva directa"}
                          {booking.agencyPhone ? ` · ${booking.agencyPhone}` : ""}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Total cobrado:</span> ${booking.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Comisión:</span> ${booking.platformFee.toFixed(2)}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Neto suplidor:</span> ${booking.supplierAmount.toFixed(2)}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Creada:</span>{" "}
                          {new Date(booking.createdAtValue).toLocaleString("es-ES")}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Actualizada:</span>{" "}
                          {booking.updatedAtValue ? new Date(booking.updatedAtValue).toLocaleString("es-ES") : "Sin cambios"}
                        </p>
                        <p className="text-[1rem] leading-7 text-slate-700">
                          <span className="font-semibold text-slate-950">Ventana:</span> {formatTimeUntil(new Date(booking.travelDateValue))}
                        </p>
                      </div>
                    </section>
                  </div>
                        </div>
                      </details>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
                    <div className="flex flex-wrap gap-2">
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
                    {booking.flowType === "transfer" && (
                      <details className="relative">
                        <summary className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                          Editar logística
                        </summary>
                        <div className="absolute right-0 top-full z-20 mt-2 w-[360px] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                          <form action={updateAdminTransferLogistics} method="post" className="space-y-3">
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                Pickup ida
                              </label>
                              <input
                                name="pickup"
                                defaultValue={booking.pickup ?? ""}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                Hotel / pickup regreso
                              </label>
                              <input
                                name="hotel"
                                defaultValue={booking.hotel ?? ""}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                              />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                  Ruta origen
                                </label>
                                <input
                                  name="originAirport"
                                  defaultValue={booking.originAirport ?? ""}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                  Vuelo
                                </label>
                                <input
                                  name="flightNumber"
                                  defaultValue={booking.flightNumber ?? ""}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                />
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                  Hora salida
                                </label>
                                <input
                                  type="time"
                                  name="startTime"
                                  defaultValue={booking.startTime ?? ""}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                />
                              </div>
                              {booking.tripType === "round-trip" ? (
                                <>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                      Fecha regreso
                                    </label>
                                    <input
                                      type="date"
                                      name="returnTravelDate"
                                      defaultValue={
                                        booking.returnTravelDate
                                          ? new Date(booking.returnTravelDate).toISOString().slice(0, 10)
                                          : ""
                                      }
                                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                      Hora regreso
                                    </label>
                                    <input
                                      type="time"
                                      name="returnStartTime"
                                      defaultValue={booking.returnStartTime ?? ""}
                                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                    />
                                  </div>
                                </>
                              ) : null}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                Notas operativas
                              </label>
                              <textarea
                                name="pickupNotes"
                                defaultValue={booking.pickupNotes ?? ""}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                rows={3}
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-500"
                            >
                              Guardar cambios
                            </button>
                          </form>
                        </div>
                      </details>
                    )}
                    </div>
                  </div>
                  <div className="px-6 pb-5">
                  <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
                      <span className="group-open:hidden">Centro de evidencia</span>
                      <span className="hidden group-open:inline">Ocultar evidencia</span>
                      <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                    </summary>
                    <div className="mt-4 space-y-3">
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
                  </details>
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
        {sortedRows.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <a
                href={`?tab=${tab}&date=${dateMode}&tour=${encodeURIComponent(
                  selectedTour
                )}&query=${encodeURIComponent(searchQuery)}&pickup=${encodeURIComponent(
                  pickupSearch
                )}&order=${orderParam}${selectedStatus
                  .map((status) => `&status=${encodeURIComponent(status)}`)
                  .join("")}&page=${Math.max(1, currentPage - 1)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
              >
                Anterior
              </a>
              <a
                href={`?tab=${tab}&date=${dateMode}&tour=${encodeURIComponent(
                  selectedTour
                )}&query=${encodeURIComponent(searchQuery)}&pickup=${encodeURIComponent(
                  pickupSearch
                )}&order=${orderParam}${selectedStatus
                  .map((status) => `&status=${encodeURIComponent(status)}`)
                  .join("")}&page=${Math.min(totalPages, currentPage + 1)}`}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                Siguiente
              </a>
            </div>
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

