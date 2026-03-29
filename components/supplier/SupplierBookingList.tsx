"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  ClipboardCheck,
  MessageCircle,
  Phone,
  Printer,
  Send,
  Slack
} from "lucide-react";
import { buildBookingPresentation } from "@/lib/bookingPresentation";

export type SupplierTimelineEntry = {
  title: string;
  description: string;
  timestamp: string;
};

export type SupplierNote = {
  author: string;
  message: string;
  timestamp: string;
};

export type SupplierBookingSummary = {
  id: string;
  bookingCode: string;
  travelDate: string;
  travelDateValue: string;
  startTime: string | null;
  flowType?: string | null;
  customerName: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  tourTitle: string;
  pax: number;
  pickup?: string | null;
  hotel?: string | null;
  status: string;
  totalAmount: number;
  platformFee?: number | null;
  supplierAmount?: number | null;
  tripType?: string | null;
  returnTravelDate?: string | null;
  returnStartTime?: string | null;
  flightNumber?: string | null;
  originAirport?: string | null;
  pickupNotes?: string | null;
  transferVehicleName?: string | null;
  transferVehicleCategory?: string | null;
  agencyName?: string | null;
  agencyPhone?: string | null;
  createdAt: string;
  updatedAt: string;
  whatsappNumber?: string | null;
  timeline: SupplierTimelineEntry[];
  notes: SupplierNote[];
};

type RequestInfoOption = {
  label: string;
  value: "room" | "paymentProof" | "delay";
  message: string;
};

type DateFilterMode = "today" | "tomorrow" | "week" | "range";
type TabKey = "today" | "tomorrow" | "upcoming" | "past" | "payment";
const PAGE_SIZE = 20;

const requestOptions: RequestInfoOption[] = [
  {
    label: "Solicitar nÃºmero de habitaciÃ³n",
    value: "room",
    message: "Por favor envÃ­anos tu nÃºmero de habitaciÃ³n para coordinar el pickup."
  },
  {
    label: "Solicitar comprobante de pago",
    value: "paymentProof",
    message: "Nos puedes enviar el comprobante de pago para cerrar los detalles financieros."
  },
  {
    label: "Informar retraso",
    value: "delay",
    message: "Tu transporte podrÃ­a tener un retraso; te avisaremos cuÃ¡ndo salimos."
  }
];

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  PAYMENT_PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200"
};

const statusOptions = [
  { label: "Pendiente", value: "PENDING" },
  { label: "Confirmado", value: "CONFIRMED" },
  { label: "Pago pendiente", value: "PAYMENT_PENDING" },
  { label: "Cancelado", value: "CANCELLED" },
  { label: "Completado", value: "COMPLETED" }
];

const tabs: { key: TabKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "tomorrow", label: "MaÃ±ana" },
  { key: "upcoming", label: "PrÃ³ximos" },
  { key: "past", label: "Pasados" },
  { key: "payment", label: "Pendientes de pago" }
];

type Props = {
  bookings: SupplierBookingSummary[];
};

export function SupplierBookingList({ bookings }: Props) {
  const [selectedBooking, setSelectedBooking] = useState<SupplierBookingSummary | null>(null);
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [requestOption, setRequestOption] = useState<RequestInfoOption | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [actionFeedbacks, setActionFeedbacks] = useState<Record<string, string>>({});
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>(["CONFIRMED", "PENDING", "PAYMENT_PENDING"]);
  const [selectedTour, setSelectedTour] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pickupFilter, setPickupFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [orderBy, setOrderBy] = useState<"created" | "travel">("created");
  const [page, setPage] = useState(1);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const weekLater = new Date(now);
  weekLater.setDate(now.getDate() + 7);

  const enrichedBookings = useMemo(
    () => bookings.map((booking) => ({ ...booking, status: statusOverrides[booking.id] ?? booking.status })),
    [bookings, statusOverrides]
  );

  const tourOptions = useMemo(() => {
    const set = new Set<string>();
    enrichedBookings.forEach((booking) => set.add(booking.tourTitle));
    return Array.from(set).sort();
  }, [enrichedBookings]);

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const bookingDate = (booking: SupplierBookingSummary) => new Date(booking.travelDateValue);
  const bookingDateTime = (booking: SupplierBookingSummary) => {
    if (!booking.startTime) return null;
    const base = bookingDate(booking);
    const [hours = "08", minutes = "00"] = booking.startTime.split(":");
    const copy = new Date(base);
    copy.setHours(Number(hours) || 8, Number(minutes) || 0, 0, 0);
    return copy;
  };

  const matchesDateMode = (booking: SupplierBookingSummary) => {
    const travel = bookingDate(booking);
    switch (dateFilterMode) {
      case "today":
        return startOfDay(travel).getTime() === startOfDay(now).getTime();
      case "tomorrow":
        return startOfDay(travel).getTime() === startOfDay(tomorrow).getTime();
      case "week":
        return travel >= now && travel <= weekLater;
      case "range": {
        const start = customStart ? new Date(customStart) : null;
        const end = customEnd ? new Date(customEnd) : null;
        if (start && end) {
          return travel >= startOfDay(start) && travel <= startOfDay(end);
        }
        return true;
      }
      default:
        return true;
    }
  };

  const tabPredicate = (booking: SupplierBookingSummary) => {
    const travel = bookingDate(booking);
    switch (activeTab) {
      case "today":
        return startOfDay(travel).getTime() === startOfDay(now).getTime();
      case "tomorrow":
        return startOfDay(travel).getTime() === startOfDay(tomorrow).getTime();
      case "upcoming":
        return travel > startOfDay(now);
      case "past":
        return travel < startOfDay(now);
      case "payment":
        return booking.status === "PAYMENT_PENDING";
      default:
        return true;
    }
  };

  const shouldApplyDateFilter = activeTab === "today" || activeTab === "tomorrow" || dateFilterMode === "range";

  const filteredBookings = useMemo(() => {
    return enrichedBookings
      .filter((booking) => (shouldApplyDateFilter ? matchesDateMode(booking) : true))
      .filter((booking) => (statusFilters.length ? statusFilters.includes(booking.status) : true))
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
        if (!pickupFilter.trim()) return true;
        const target = pickupFilter.trim().toLowerCase();
        const pickupText = `${booking.hotel ?? ""} ${booking.pickup ?? ""}`.toLowerCase();
        return pickupText.includes(target);
      })
      .filter(tabPredicate);
  }, [
    enrichedBookings,
    dateFilterMode,
    customStart,
    customEnd,
    statusFilters,
    selectedTour,
    searchQuery,
    pickupFilter,
    activeTab,
    shouldApplyDateFilter
  ]);

  const orderedBookings = useMemo(() => {
    const copy = [...filteredBookings];
    copy.sort((a, b) => {
      if (orderBy === "travel") {
        return new Date(a.travelDateValue).getTime() - new Date(b.travelDateValue).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return copy;
  }, [filteredBookings, orderBy]);

  const totalPages = Math.max(1, Math.ceil(orderedBookings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageBookings = orderedBookings.slice(pageStart, pageStart + PAGE_SIZE);

  const latestBooking = useMemo(() => {
    if (!enrichedBookings.length) return null;
    return [...enrichedBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [enrichedBookings]);

  const summary = useMemo(() => {
    const todayStart = startOfDay(now);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    let reservasHoy = 0;
    let totalPaxHoy = 0;
    let totalDelDia = 0;
    let pendientesPago = 0;
    let nextDepartureMinutes: number | null = null;

    enrichedBookings.forEach((booking) => {
      const travel = bookingDate(booking);
      if (travel >= todayStart && travel < todayEnd) {
        reservasHoy += 1;
        totalPaxHoy += booking.pax;
        totalDelDia += booking.totalAmount;
      }
      if (["PAYMENT_PENDING", "PENDING"].includes(booking.status)) {
        pendientesPago += 1;
      }
      const travelTime = bookingDateTime(booking);
      if (travelTime && travelTime > now) {
        const diff = Math.round((travelTime.getTime() - now.getTime()) / 60000);
        if (nextDepartureMinutes === null || diff < nextDepartureMinutes) {
          nextDepartureMinutes = diff;
        }
      }
    });

    return { reservasHoy, totalPaxHoy, totalDelDia, pendientesPago, nextDepartureMinutes };
  }, [enrichedBookings, now]);

  const addFeedback = (bookingId: string, message: string) => {
    setActionFeedbacks((prev) => ({ ...prev, [bookingId]: message }));
    setTimeout(() => {
      setActionFeedbacks((prev) => {
        const copy = { ...prev };
        delete copy[bookingId];
        return copy;
      });
    }, 3500);
  };

  const sendSupplierAction = async (bookingId: string, payload: Record<string, unknown>) => {
    const response = await fetch(`/api/supplier/bookings/${bookingId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error && (error.error ?? error.message)) || "AcciÃ³n fallida.");
    }
    return true;
  };

  const handleMarkComplete = async (booking: SupplierBookingSummary) => {
    try {
      await sendSupplierAction(booking.id, { action: "markComplete" });
      setStatusOverrides((prev) => ({ ...prev, [booking.id]: "COMPLETED" }));
      addFeedback(booking.id, "Reserva marcada como completada.");
    } catch (error) {
      addFeedback(booking.id, (error as Error).message);
    }
  };

  const handleCancel = async (booking: SupplierBookingSummary) => {
    const reason = typeof window !== "undefined" ? window.prompt("Motivo de cancelaciÃ³n:") : null;
    if (!reason?.trim()) {
      addFeedback(booking.id, "Se cancelÃ³ la acciÃ³n, se requiere motivo.");
      return;
    }
    try {
      await sendSupplierAction(booking.id, { action: "requestCancel", reason: reason.trim() });
      addFeedback(booking.id, "Solicitud de cancelaciÃ³n enviada al equipo.");
    } catch (error) {
      addFeedback(booking.id, (error as Error).message);
    }
  };

  const handleCopyDetails = (booking: SupplierBookingSummary) => {
    const text =
      booking.flowType === "transfer" && booking.tripType === "round-trip"
        ? `Reserva ${booking.bookingCode} Â· ${booking.tourTitle} Â· ${booking.customerName ?? "Cliente"} Â· Ida: ${booking.pickup ?? "Pickup pendiente"} ${booking.startTime ?? "Hora por confirmar"} Â· Regreso: ${booking.hotel ?? "Pendiente"} ${booking.returnTravelDate ? new Date(booking.returnTravelDate).toLocaleDateString("es-ES") : "Fecha pendiente"}${booking.returnStartTime ? ` ${booking.returnStartTime}` : ""}`
        : `Reserva ${booking.bookingCode} Â· ${booking.tourTitle} Â· ${booking.customerName ?? "Cliente"} Â· ${booking.hotel ?? booking.pickup ?? "Pickup pendiente"} Â· ${booking.startTime ?? "Hora por confirmar"}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      addFeedback(booking.id, "Navegador no soporta portapapeles.");
      return;
    }
    addFeedback(booking.id, "InformaciÃ³n copiada.");
  };

  const handlePrintDetails = (booking: SupplierBookingSummary) => {
    if (typeof window === "undefined") return;
    const content = `
      <div style="font-family:Arial,sans-serif;padding:24px;">
        <h2>${booking.tourTitle}</h2>
        <p><strong>ID:</strong> ${booking.bookingCode}</p>
        <p><strong>Cliente:</strong> ${booking.customerName ?? "Invitado"}</p>
        <p><strong>Pickup:</strong> ${booking.hotel ?? booking.pickup ?? "Pendiente"}</p>
        <p><strong>Hora:</strong> ${booking.startTime ?? "Pendiente"}</p>
        ${
          booking.flowType === "transfer" && booking.tripType === "round-trip"
            ? `<p><strong>Regreso:</strong> ${booking.hotel ?? "Pendiente"} · ${booking.returnTravelDate ? new Date(booking.returnTravelDate).toLocaleDateString("es-ES") : "Fecha pendiente"}${booking.returnStartTime ? ` · ${booking.returnStartTime}` : ""}</p>`
            : ""
        }
      </div>
    `;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addFeedback(booking.id, "No se pudo abrir la ventana de impresiÃ³n.");
      return;
    }
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleSendToDriver = (booking: SupplierBookingSummary) => {
    if (typeof window === "undefined") return;
    const phone = booking.whatsappNumber?.replace(/\D/g, "") ?? "18093949877";
    const rawMessage =
      booking.flowType === "transfer" && booking.tripType === "round-trip"
        ? `Reserva ${booking.bookingCode}\nCliente: ${booking.customerName ?? "Cliente"}\nIda: ${booking.pickup ?? "Pendiente"} · ${booking.startTime ?? "Hora por confirmar"}\nRegreso: ${booking.hotel ?? "Pendiente"} · ${
            booking.returnTravelDate
              ? new Date(booking.returnTravelDate).toLocaleDateString("es-ES")
              : "Fecha pendiente"
          }${booking.returnStartTime ? ` · ${booking.returnStartTime}` : ""}\nVehículo: ${booking.transferVehicleName ?? "Pendiente"}`
        : `Reserva ${booking.bookingCode}\nCliente: ${booking.customerName ?? "Cliente"}\nPickup: ${booking.hotel ?? booking.pickup ?? "Pendiente"} · ${booking.startTime ?? "Hora por confirmar"}\nVehículo: ${booking.transferVehicleName ?? "Pendiente"}`;
    const message = encodeURIComponent(rawMessage);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    addFeedback(booking.id, "Mensaje enviado al chofer.");
  };

  const openModal = (booking: SupplierBookingSummary) => {
    setSelectedBooking(booking);
    setModalStatus(null);
    setModalError(null);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setRequestOption(null);
  };

  const handleConfirmTime = async (booking?: SupplierBookingSummary) => {
    const target = booking ?? selectedBooking;
    if (!target) return;
    try {
      await sendSupplierAction(target.id, { action: "confirmTime" });
      addFeedback(target.id, "Correo de confirmaciÃ³n enviado.");
      if (!booking) {
        setModalStatus("Correo de confirmaciÃ³n enviado.");
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (!booking) {
        setModalError(errorMessage);
      } else {
        addFeedback(target.id, errorMessage);
      }
    }
  };

  const handleRequestInfo = async (option: RequestInfoOption) => {
    if (!selectedBooking) return;
    try {
      await sendSupplierAction(selectedBooking.id, { action: "requestInfo", type: option.value });
      setRequestOption(option);
      setModalStatus("Solicitud enviada al cliente.");
    } catch (error) {
      setModalError((error as Error).message);
    }
  };

  const handleSendNote = async (message: string) => {
    if (!selectedBooking) return;
    try {
      await sendSupplierAction(selectedBooking.id, { action: "note", message });
      setModalStatus("Nota registrada.");
    } catch (error) {
      setModalError((error as Error).message);
    }
  };

  const historyEntries = useMemo(
    () =>
      selectedBooking
        ? [
            `Reserva creada el ${new Date(selectedBooking.createdAt).toLocaleDateString("es-ES")}`,
            `Ãšltima actualizaciÃ³n ${new Date(selectedBooking.updatedAt).toLocaleString("es-ES")}`
          ]
        : null,
    [selectedBooking]
  );

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setDateFilterMode("today");
    setCustomStart("");
    setCustomEnd("");
    setStatusFilters(["CONFIRMED", "PENDING", "PAYMENT_PENDING"]);
    setSelectedTour("all");
    setSearchQuery("");
    setPickupFilter("");
    setOrderBy("created");
    setPage(1);
  };

  return (
    <>
      <section className="space-y-4">
        {latestBooking && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">Ãšltima reserva</p>
                <p className="text-lg font-semibold text-slate-900">{latestBooking.tourTitle}</p>
                <p className="text-sm text-slate-600">
                  {latestBooking.customerName ?? "Cliente"} Â· {latestBooking.bookingCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("upcoming");
                  setDateFilterMode("week");
                  setSearchQuery(latestBooking.bookingCode);
                  setOrderBy("created");
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                Ver en lista
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Reservas hoy</p>
            <p className="text-3xl font-semibold text-slate-900">{summary.reservasHoy}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Pend. de pago</p>
            <p className="text-3xl font-semibold text-slate-900">{summary.pendientesPago}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Total pax hoy</p>
            <p className="text-3xl font-semibold text-slate-900">{summary.totalPaxHoy}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">PrÃ³xima salida</p>
            <p className="text-3xl font-semibold text-slate-900">
              {summary.nextDepartureMinutes !== null
                ? `en ${summary.nextDepartureMinutes} min`
                : "sin salidas"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Total dÃ­a</p>
            <p className="text-3xl font-semibold text-slate-900">
              ${summary.totalDelDia.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-6">
            <div>
              <label className="text-xs uppercase text-slate-500">Fecha</label>
              <select
                value={dateFilterMode}
                onChange={(event) => {
                  setDateFilterMode(event.target.value as DateFilterMode);
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="today">Hoy</option>
                <option value="tomorrow">MaÃ±ana</option>
                <option value="week">Semana</option>
                <option value="range">Rango</option>
              </select>
              {dateFilterMode === "range" && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(event) => {
                      setCustomStart(event.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(event) => {
                      setCustomEnd(event.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase text-slate-500">Estado</p>
              <details className="relative">
                <summary className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Seleccionar estados
                </summary>
                <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="grid gap-2">
                    {statusOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={statusFilters.includes(option.value)}
                          onChange={() => toggleStatusFilter(option.value)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              </details>
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500">Tour</label>
              <select
                value={selectedTour}
                onChange={(event) => {
                  setSelectedTour(event.target.value);
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                {tourOptions.map((tour) => (
                  <option key={tour} value={tour}>
                    {tour}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500">Buscar</label>
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Cliente o ID"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500">Pickup</label>
              <input
                value={pickupFilter}
                onChange={(event) => {
                  setPickupFilter(event.target.value);
                  setPage(1);
                }}
                placeholder="Hotel o zona"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500">Orden</label>
              <select
                value={orderBy}
                onChange={(event) => {
                  setOrderBy(event.target.value as "created" | "travel");
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="created">Ãšltimas creadas</option>
                <option value="travel">Fecha de salida</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.4em]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === tab.key
                  ? "border border-slate-900 bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {pageBookings.map((booking) => {
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
              startTime: booking.startTime
            });

            return (
              <article
              key={booking.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                latestBooking?.id === booking.id ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200"
              }`}
              aria-label={`Reserva ${booking.bookingCode} para ${booking.customerName ?? "Cliente"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    ID {booking.bookingCode.slice(-6).toUpperCase()}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">{booking.tourTitle}</h2>
                  <p className="text-sm text-slate-500">
                    {booking.startTime ?? "Hora por confirmar"} Â· {new Date(booking.travelDateValue).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                    statusColors[booking.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Cliente</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.customerName ?? "Invitado"}</p>
                  <p className="text-xs text-slate-500">{booking.customerEmail}</p>
                  {booking.agencyName && (
                    <p className="text-xs text-slate-500">
                      Agencia: {booking.agencyName}
                      {booking.agencyPhone ? ` Â· ${booking.agencyPhone}` : ""}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pax</p>
                  <p className="text-lg font-semibold text-slate-900">{booking.pax}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.routeLabel}</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.hotel ?? booking.pickup ?? "Pendiente"}</p>
                  <p className="text-xs text-slate-500">{presentation.logisticsValue || "Operación pendiente"}</p>
                  {booking.flowType === "transfer" && booking.tripType === "round-trip" ? (
                    <p className="text-xs text-slate-500">
                      Regreso:{" "}
                      {booking.returnTravelDate
                        ? new Date(booking.returnTravelDate).toLocaleDateString("es-ES")
                        : "Pendiente"}
                      {booking.returnStartTime ? ` · ${booking.returnStartTime}` : ""}
                    </p>
                  ) : null}
                  {booking.transferVehicleName && (
                    <p className="text-xs text-slate-500">
                      Vehículo: {booking.transferVehicleName}
                      {booking.transferVehicleCategory ? ` · ${booking.transferVehicleCategory}` : ""}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pago</p>
                  <p className="text-sm font-semibold text-slate-900">${booking.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmTime(booking)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
                >
                  <Check className="h-4 w-4" />
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkComplete(booking)}
                  className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Completada
                </button>
                <button
                  type="button"
                  onClick={() => handleCancel(booking)}
                  className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-700"
                >
                  <Slack className="h-4 w-4" />
                  Solicitar cancelaciÃ³n
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyDetails(booking)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
                >
                  <Clipboard className="h-4 w-4" />
                  Copiar info
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintDetails(booking)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToDriver(booking)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700"
                >
                  <Send className="h-4 w-4" />
                  Enviar al chofer
                </button>
                <a
                  href={`https://wa.me/${booking.whatsappNumber?.replace(/\D/g, "") ?? "18093949877"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => openModal(booking)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ver detalles
                </button>
              </div>
              {actionFeedbacks[booking.id] && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {actionFeedbacks[booking.id]}
                </p>
              )}
              </article>
            );
          })}
          {!pageBookings.length && (
            <p className="text-sm text-slate-500">No hay reservas que coincidan con los filtros seleccionados.</p>
          )}
        </div>
        {orderedBookings.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            <span>
              PÃ¡gina {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Detalle {selectedBooking.tourTitle}</h3>
              <button type="button" onClick={closeModal} className="text-slate-500">
                Cerrar
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="text-xs uppercase text-slate-500">Cliente</span>
                  <br />
                  {selectedBooking.customerName}
                </p>
                <p>
                  <span className="text-xs uppercase text-slate-500">Correo</span>
                  <br />
                  {selectedBooking.customerEmail}
                </p>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="text-xs uppercase text-slate-500">LogÃ­stica</span>
                  <br />
                  {selectedBooking.flowType === "transfer" && selectedBooking.tripType === "round-trip"
                    ? `Pickup ida ${selectedBooking.pickup ?? "Pendiente"}, hora ${selectedBooking.startTime ?? "Pendiente"} · regreso ${selectedBooking.hotel ?? "Pendiente"} · ${
                        selectedBooking.returnTravelDate
                          ? new Date(selectedBooking.returnTravelDate).toLocaleDateString("es-ES")
                          : "Pendiente"
                      }${selectedBooking.returnStartTime ? ` · ${selectedBooking.returnStartTime}` : ""}`
                    : `Pickup ${selectedBooking.hotel ?? selectedBooking.pickup ?? "Pendiente"}, hora ${selectedBooking.startTime ?? "Pendiente"}`}
                </p>
                <p>
                  <span className="text-xs uppercase text-slate-500">Vuelo</span>
                  <br />
                  {selectedBooking.originAirport ?? "Origen pendiente"}
                  {selectedBooking.flightNumber ? ` Â· ${selectedBooking.flightNumber}` : ""}
                </p>
                <p>
                  <span className="text-xs uppercase text-slate-500">Canal</span>
                  <br />
                  {selectedBooking.agencyName ?? "Reserva directa"}
                  {selectedBooking.agencyPhone ? ` Â· ${selectedBooking.agencyPhone}` : ""}
                </p>
              </div>
            </div>
            <div className="grid gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-3">
              <p>
                <span className="text-xs uppercase text-slate-500">Precio total</span>
                <br />
                ${selectedBooking.totalAmount.toFixed(2)}
              </p>
              <p>
                <span className="text-xs uppercase text-slate-500">ComisiÃ³n plataforma</span>
                <br />
                ${selectedBooking.platformFee?.toFixed(2) ?? "0.00"}
              </p>
              <p>
                <span className="text-xs uppercase text-slate-500">Neto supplier</span>
                <br />
                ${selectedBooking.supplierAmount?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Historial</p>
            {historyEntries?.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>

          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Centro de evidencia</p>
            <div className="space-y-2">
              {selectedBooking.timeline.length ? (
                selectedBooking.timeline.slice(0, 4).map((event) => (
                  <article key={`${selectedBooking.id}-${event.timestamp}-${event.title}`} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                      {new Date(event.timestamp).toLocaleString("es-ES")}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                    <p className="text-xs text-slate-500">{event.description}</p>
                  </article>
                ))
              ) : (
                <p className="text-xs text-slate-500">Sin actividad registrada.</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Notas internas</p>
              {selectedBooking.notes.length ? (
                <span className="text-[11px] text-slate-400">{selectedBooking.notes.length} nota(s)</span>
              ) : null}
            </div>
            <div className="space-y-2">
              {selectedBooking.notes.length ? (
                selectedBooking.notes.map((note) => (
                  <article key={`${selectedBooking.id}-${note.timestamp}-${note.author}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] text-slate-500">
                      {new Date(note.timestamp).toLocaleString("es-ES")} Â· {note.author}
                    </p>
                    <p className="text-sm text-slate-700">{note.message}</p>
                  </article>
                ))
              ) : (
                <p className="text-xs text-slate-500">No hay notas internas todavÃ­a.</p>
              )}
            </div>
          </div>

            <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Acciones</p>
                <span className="text-xs text-slate-500">{selectedBooking.status}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleConfirmTime()}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white"
                >
                  Confirmar hora
                </button>
                <div className="space-y-2">
                  {requestOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRequestInfo(option)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-left text-sm font-semibold uppercase tracking-[0.3em] text-slate-700"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Chat interno</label>
                <ChatNoteInput onSend={handleSendNote} />
              </div>
              {modalStatus && <p className="text-sm text-emerald-600">{modalStatus}</p>}
              {modalError && <p className="text-sm text-rose-500">{modalError}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type ChatNoteInputProps = {
  onSend: (message: string) => Promise<void>;
};

function ChatNoteInput({ onSend }: ChatNoteInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await onSend(message.trim());
    setMessage("");
    setSending(false);
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
        placeholder="Escribe un mensaje interno..."
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:opacity-60"
      >
        Enviar nota
      </button>
    </form>
  );
}

