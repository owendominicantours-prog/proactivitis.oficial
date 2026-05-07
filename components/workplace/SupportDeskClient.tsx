"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";

import { ChatBox } from "@/components/ChatBox";
import { fetcher } from "@/lib/fetcher";

type Department = { id: string; name: string; slug: string };

type SupportBooking = {
  id: string;
  bookingCode: string;
  type: string;
  status: string;
  paymentStatus: string;
  service: string;
  supplier: string;
  travelDate: string;
  returnTravelDate?: string | null;
  startTime?: string | null;
  returnStartTime?: string | null;
  passengers: number;
  pickup: string;
  hotel?: string | null;
  originAirport?: string | null;
  flightNumber?: string | null;
  totalAmount: number;
  customer: { name: string; emailMasked?: string | null; phoneMasked?: string | null };
  operationalNotes: string[];
};

type SupportConversation = {
  id: string;
  type: string;
  status: string;
  priority: string;
  updatedAt: string;
  assignedDepartment?: Department | null;
  booking?: SupportBooking | null;
  visitorPresence?: { active: boolean; lastSeenAt?: string | null } | null;
  visitorContext?: { country?: string | null; city?: string | null; pageTitle?: string | null; pagePath?: string | null } | null;
  pendingForMe?: boolean;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderRole: string;
    sender?: { name?: string | null; email?: string | null } | null;
  } | null;
  participants: Array<{ id: string; name: string; email?: string | null; role?: string | null }>;
};

type Props = {
  departments: Department[];
  initialConversationId?: string | null;
};

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  PENDING_CUSTOMER: "Esperando cliente",
  ESCALATED: "Escalado",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado"
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente"
};

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function SupportDeskClient({ departments, initialConversationId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingQuery, setBookingQuery] = useState("");
  const [escalationNote, setEscalationNote] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [busy, setBusy] = useState(false);

  const conversationsUrl = `/api/support-desk/conversations?status=${encodeURIComponent(statusFilter)}`;
  const { data, mutate } = useSWR<{ conversations: SupportConversation[] }>(conversationsUrl, fetcher, {
    refreshInterval: 5000
  });
  const bookingUrl = bookingQuery.trim().length >= 3 ? `/api/support-desk/bookings?q=${encodeURIComponent(bookingQuery.trim())}` : null;
  const { data: bookingData } = useSWR<{ bookings: SupportBooking[] }>(bookingUrl, fetcher, { refreshInterval: 0 });

  const conversations = data?.conversations ?? [];
  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0] ?? null,
    [conversations, selectedId]
  );

  const patchConversation = async (payload: Record<string, string>) => {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch(`/api/support-desk/conversations/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await mutate();
    } finally {
      setBusy(false);
    }
  };

  const linkBooking = async (bookingId: string) => {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch(`/api/support-desk/conversations/${selected.id}/link-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId })
      });
      setBookingQuery("");
      await mutate();
    } finally {
      setBusy(false);
    }
  };

  const escalate = async () => {
    if (!selected || !departmentId) return;
    setBusy(true);
    try {
      await fetch(`/api/support-desk/conversations/${selected.id}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departmentId, note: escalationNote, priority: "HIGH" })
      });
      setEscalationNote("");
      await mutate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[360px,1fr,360px]">
      <aside className="space-y-4">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Bandeja</p>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="ESCALATED">Escalados</option>
            <option value="PENDING_CUSTOMER">Esperando cliente</option>
            <option value="RESOLVED">Resueltos</option>
            <option value="CLOSED">Cerrados</option>
          </select>
        </div>

        <div className="max-h-[760px] space-y-2 overflow-y-auto pr-1">
          {conversations.length ? conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                selected?.id === conversation.id ? "border-cyan-300/50 bg-cyan-400/15" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-white">
                    {conversation.booking?.bookingCode ?? conversation.visitorContext?.pageTitle ?? conversation.type}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {conversation.booking?.service ?? conversation.visitorContext?.pagePath ?? "Soporte general"}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${
                  conversation.pendingForMe ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-300"
                }`}>
                  {conversation.pendingForMe ? "Nuevo" : statusLabels[conversation.status] ?? conversation.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.16em]">
                <span className="rounded-full bg-white/10 px-2 py-1 text-slate-300">{conversation.type}</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-slate-300">{priorityLabels[conversation.priority] ?? conversation.priority}</span>
                {conversation.assignedDepartment ? (
                  <span className="rounded-full bg-cyan-400/15 px-2 py-1 text-cyan-100">{conversation.assignedDepartment.name}</span>
                ) : null}
                {conversation.visitorPresence?.active ? (
                  <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-100">Activo ahora</span>
                ) : null}
              </div>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
                {conversation.lastMessage?.content ?? "Sin mensajes visibles."}
              </p>
              <p className="mt-2 text-[10px] text-slate-500">{formatDate(conversation.updatedAt)}</p>
            </button>
          )) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
              No hay conversaciones en esta bandeja.
            </div>
          )}
        </div>
      </aside>

      <section className="min-h-[760px]">
        <ChatBox conversationId={selected?.id} enableTourCards />
      </section>

      <aside className="space-y-4">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Ficha operativa</p>
          {selected?.booking ? (
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Reserva</p>
                <p className="font-black text-white">{selected.booking.bookingCode}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cliente</p>
                <p className="font-black text-white">{selected.booking.customer.name}</p>
                <p className="text-xs text-slate-400">{selected.booking.customer.emailMasked ?? "Email protegido"}</p>
                <p className="text-xs text-slate-400">{selected.booking.customer.phoneMasked ?? "Telefono protegido"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="font-black text-white">{selected.booking.service}</p>
                <p className="mt-1 text-xs text-slate-400">{selected.booking.supplier}</p>
                <p className="mt-2 text-xs text-slate-300">Fecha: {formatDate(selected.booking.travelDate)}</p>
                <p className="text-xs text-slate-300">Hora: {selected.booking.startTime ?? "Pendiente"}</p>
                <p className="text-xs text-slate-300">Pax: {selected.booking.passengers}</p>
                <p className="text-xs text-slate-300">Pick-up: {selected.booking.pickup}</p>
                {selected.booking.flightNumber ? <p className="text-xs text-slate-300">Vuelo: {selected.booking.flightNumber}</p> : null}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Estado</p>
                  <p className="mt-1 font-black text-white">{selected.booking.status}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Pago</p>
                  <p className="mt-1 font-black text-white">{selected.booking.paymentStatus}</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-emerald-400/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">Total</p>
                  <p className="mt-1 text-2xl font-black text-emerald-100">{money.format(selected.booking.totalAmount)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-400">
              Esta conversacion no tiene reserva vinculada. Pide al cliente su codigo de referencia y buscala abajo.
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Buscar reserva</p>
          <input
            value={bookingQuery}
            onChange={(event) => setBookingQuery(event.target.value)}
            placeholder="Codigo, nombre o email"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
          />
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {(bookingData?.bookings ?? []).map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="font-black text-white">{booking.bookingCode}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-400">{booking.service}</p>
                <p className="mt-1 text-xs text-slate-400">{booking.customer.name} - {formatDate(booking.travelDate)}</p>
                <button
                  type="button"
                  disabled={busy || !selected}
                  onClick={() => void linkBooking(booking.id)}
                  className="mt-3 rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-50"
                >
                  Vincular
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Escalar a departamento</p>
          <select
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none"
          >
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
          <textarea
            value={escalationNote}
            onChange={(event) => setEscalationNote(event.target.value)}
            placeholder="Explica que debe revisar el departamento..."
            className="mt-3 min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
          />
          <button
            type="button"
            disabled={busy || !selected || !departmentId}
            onClick={() => void escalate()}
            className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
          >
            Escalar caso
          </button>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Esto crea una sala interna con mencion al departamento y conserva este chat con el cliente.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Estado del caso</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {["OPEN", "PENDING_CUSTOMER", "RESOLVED", "CLOSED"].map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy || !selected}
                onClick={() => void patchConversation({ status })}
                className={`rounded-2xl border px-3 py-2 text-xs font-black ${
                  selected?.status === status ? "border-cyan-300 bg-cyan-400/15 text-cyan-100" : "border-white/10 text-slate-300"
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
