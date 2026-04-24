export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

type SearchParams = Record<string, string | string[] | undefined>;

type CalendarBooking = {
  id: string;
  bookingCode: string;
  status: string;
  customerName: string;
  tourTitle: string;
  travelDate: Date;
  startTime: string | null;
  totalAmount: number;
  hotel: string | null;
  pickup: string | null;
};

const weekdayLabels = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseMonthParam(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return startOfMonth(new Date());
  const [yearRaw, monthRaw] = value.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return startOfMonth(new Date());
  return startOfMonth(new Date(year, monthIndex, 1));
}

function parseDayParam(value: string | undefined, monthDate: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return format(monthDate, "yyyy-MM-dd");
  return value;
}

function buildCalendarHref(monthDate: Date, selectedDay: string) {
  return `/admin/calendar?month=${format(monthDate, "yyyy-MM")}&day=${selectedDay}`;
}

function buildBookingsHref(dayKey: string, bookingCode?: string) {
  const params = new URLSearchParams({ travelDate: dayKey, date: "range", startDate: dayKey, endDate: dayKey });
  if (bookingCode) params.set("code", bookingCode);
  return `/admin/bookings?${params.toString()}`;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PAYMENT_PENDING":
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "CANCELLATION_REQUESTED":
      return "border border-orange-200 bg-orange-50 text-orange-700";
    case "CANCELLED":
      return "border border-rose-200 bg-rose-50 text-rose-700";
    case "COMPLETED":
      return "border border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmada";
    case "PAYMENT_PENDING":
      return "Pago pendiente";
    case "CANCELLATION_REQUESTED":
      return "Cancelacion solicitada";
    case "CANCELLED":
      return "Cancelada";
    case "COMPLETED":
      return "Completada";
    default:
      return status;
  }
}

export default async function AdminCalendarPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const monthDate = parseMonthParam(getParam(resolvedSearchParams, "month"));
  const selectedDay = parseDayParam(getParam(resolvedSearchParams, "day"), monthDate);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const previousMonth = addMonths(monthDate, -1);
  const nextMonth = addMonths(monthDate, 1);
  const selectedDate = new Date(`${selectedDay}T00:00:00`);

  const bookings = await prisma.booking.findMany({
    where: {
      travelDate: {
        gte: gridStart,
        lte: new Date(`${format(gridEnd, "yyyy-MM-dd")}T23:59:59.999`)
      }
    },
    include: {
      Tour: {
        select: {
          title: true
        }
      }
    },
    orderBy: [{ travelDate: "asc" }, { startTime: "asc" }, { createdAt: "desc" }]
  });

  const normalizedBookings: CalendarBooking[] = bookings.map((booking) => ({
    id: booking.id,
    bookingCode: booking.bookingCode ?? booking.id,
    status: booking.status,
    customerName: booking.customerName,
    tourTitle: booking.Tour?.title ?? "Reserva sin titulo",
    travelDate: booking.travelDate,
    startTime: booking.startTime,
    totalAmount: booking.totalAmount,
    hotel: booking.hotel,
    pickup: booking.pickup
  }));

  const bookingsByDay = new Map<string, CalendarBooking[]>();
  for (const booking of normalizedBookings) {
    const key = format(booking.travelDate, "yyyy-MM-dd");
    const existing = bookingsByDay.get(key) ?? [];
    existing.push(booking);
    bookingsByDay.set(key, existing);
  }

  const selectedDayBookings = bookingsByDay.get(selectedDay) ?? [];
  const totalMonthBookings = normalizedBookings.filter((booking) => isSameMonth(booking.travelDate, monthDate)).length;
  const totalMonthRevenue = normalizedBookings
    .filter((booking) => isSameMonth(booking.travelDate, monthDate))
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  const busiestDay = Array.from(bookingsByDay.entries())
    .map(([dayKey, dayBookings]) => ({ dayKey, count: dayBookings.length }))
    .sort((a, b) => b.count - a.count)[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Calendario operativo</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">Reservas por mes</h1>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Vista mensual
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Navega mes por mes como en un calendario real, revisa la carga operativa de cada dia y entra a cada reserva sin salir del panel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Reservas del mes</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{totalMonthBookings}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Ingreso visible</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                ${totalMonthRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Dia mas cargado</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {busiestDay ? `${busiestDay.dayKey} - ${busiestDay.count} reservas` : "Sin reservas"}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Mes actual</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{format(monthDate, "MMMM yyyy", { locale: es })}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={buildCalendarHref(previousMonth, format(previousMonth, "yyyy-MM-01"))}
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-500"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Mes anterior
              </Link>
              <Link
                href={buildCalendarHref(nextMonth, format(nextMonth, "yyyy-MM-01"))}
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-500"
              >
                Mes siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 gap-1.5">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="mt-1.5 grid grid-cols-7 gap-1.5">
                {days.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const dayBookings = bookingsByDay.get(dayKey) ?? [];
                  const isSelected = selectedDay === dayKey;
                  const isToday = isSameDay(day, new Date());

                  return (
                    <Link
                      key={dayKey}
                      href={buildCalendarHref(monthDate, dayKey)}
                      className={`min-h-[118px] rounded-[18px] border p-2.5 text-left transition ${
                        isSelected
                          ? "border-sky-400 bg-sky-50 shadow-md ring-2 ring-sky-100"
                          : isSameMonth(day, monthDate)
                            ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                            : "border-slate-100 bg-slate-50/70 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday
                              ? "bg-slate-900 text-white"
                              : isSelected
                                ? "bg-sky-600 text-white"
                                : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {dayBookings.length ? `${dayBookings.length} res.` : "Libre"}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1.5">
                        {dayBookings.slice(0, 2).map((booking) => (
                          <div key={booking.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                            <p className="truncate text-[11px] font-semibold text-slate-900">{booking.tourTitle}</p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-600">
                              {(booking.startTime ?? "Sin hora")} - {booking.customerName}
                            </p>
                          </div>
                        ))}
                        {dayBookings.length > 2 ? (
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            +{dayBookings.length - 2} mas
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Dia seleccionado</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </h2>
            </div>
            <Link
              href={buildBookingsHref(selectedDay)}
              className="rounded-full border border-slate-300 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 transition hover:border-slate-500"
            >
              Ver en reservas
            </Link>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Resumen del dia</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Reservas</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{selectedDayBookings.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Ingreso</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  $
                  {selectedDayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toLocaleString("en-US", {
                    maximumFractionDigits: 0
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Primer servicio</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedDayBookings[0]?.startTime ?? "Sin hora definida"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedDayBookings.length ? (
              selectedDayBookings.map((booking) => (
                <article key={booking.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {booking.bookingCode}
                      </p>
                      <h3 className="text-base font-semibold text-slate-900">{booking.tourTitle}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cliente</p>
                      <p className="mt-1 font-medium text-slate-900">{booking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Hora</p>
                      <p className="mt-1 font-medium text-slate-900">{booking.startTime ?? "Sin hora"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pickup</p>
                      <p className="mt-1">{booking.hotel ?? booking.pickup ?? "Sin pickup definido"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
                      <p className="mt-1 font-medium text-slate-900">
                        ${booking.totalAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={buildBookingsHref(selectedDay, booking.bookingCode)}
                      className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-slate-700"
                    >
                      Abrir reserva
                    </Link>
                    <Link
                      href={buildBookingsHref(selectedDay)}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 transition hover:border-slate-500"
                    >
                      Ver todas del dia
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No hay reservas para este dia. Puedes moverte por el mes o saltar a otra fecha.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
