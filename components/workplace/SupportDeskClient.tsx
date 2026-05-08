"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarClock,
  GitBranch,
  Headphones,
  Inbox,
  Link2,
  MessageSquareQuote,
  Plane,
  Search,
  StickyNote,
  UserCog,
  UserRound
} from "lucide-react";

import { ChatBox } from "@/components/ChatBox";
import { fetcher } from "@/lib/fetcher";

type Department = { id: string; name: string; slug: string };
type Employee = { id: string; departmentId?: string | null; name: string; email?: string | null; jobTitle?: string | null };

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
  assignedEmployee?: {
    id: string;
    name?: string | null;
    email?: string | null;
    jobTitle?: string | null;
    avatarUrl?: string | null;
  } | null;
  booking?: SupportBooking | null;
  internalNote?: string | null;
  sla?: {
    state: string;
    label: string;
    minutesWaiting: number;
    shouldEscalate: boolean;
  };
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
  employees: Employee[];
  canSupervisor: boolean;
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

const supportTemplates = [
  "Hola, gracias por escribirnos. Estoy revisando tu caso ahora mismo.",
  "Puedes confirmarme tu numero de reserva o el email usado para reservar?",
  "Ya escale este caso al departamento correspondiente. Te aviso en cuanto tenga respuesta.",
  "Gracias por esperar. Estamos coordinando los detalles para darte una respuesta precisa.",
  "Listo, quedo actualizado. Hay algo mas en lo que pueda ayudarte?"
];

const slaStyles: Record<string, string> = {
  fresh: "bg-emerald-400/15 text-emerald-100",
  due: "bg-cyan-400/15 text-cyan-100",
  warning: "bg-amber-300/15 text-amber-100",
  breached: "bg-rose-400/15 text-rose-100",
  ok: "bg-white/10 text-slate-300"
};

export default function SupportDeskClient({ departments, employees, canSupervisor, initialConversationId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"mine" | "team">("mine");
  const [bookingQuery, setBookingQuery] = useState("");
  const [escalationNote, setEscalationNote] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [noteDraft, setNoteDraft] = useState("");
  const [assignDepartmentId, setAssignDepartmentId] = useState("");
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [busy, setBusy] = useState(false);

  const conversationsUrl = `/api/support-desk/conversations?status=${encodeURIComponent(statusFilter)}${
    canSupervisor && viewMode === "team" ? "&view=team" : ""
  }`;
  const { data, mutate } = useSWR<{ conversations: SupportConversation[]; canSupervisor?: boolean }>(conversationsUrl, fetcher, {
    refreshInterval: 5000
  });
  const bookingUrl = bookingQuery.trim().length >= 3 ? `/api/support-desk/bookings?q=${encodeURIComponent(bookingQuery.trim())}` : null;
  const { data: bookingData } = useSWR<{ bookings: SupportBooking[] }>(bookingUrl, fetcher, { refreshInterval: 0 });

  const conversations = useMemo(() => data?.conversations ?? [], [data?.conversations]);
  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0] ?? null,
    [conversations, selectedId]
  );
  const assignableEmployees = useMemo(
    () => employees.filter((employee) => !assignDepartmentId || employee.departmentId === assignDepartmentId),
    [assignDepartmentId, employees]
  );

  useEffect(() => {
    setNoteDraft(selected?.internalNote ?? "");
    setAssignDepartmentId(selected?.assignedDepartment?.id ?? "");
    setAssignEmployeeId(selected?.assignedEmployee?.id ?? "");
  }, [selected?.id, selected?.internalNote, selected?.assignedDepartment?.id, selected?.assignedEmployee?.id]);

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

  const saveInternalNote = async () => {
    await patchConversation({ internalNote: noteDraft });
  };

  const assignConversation = async () => {
    await patchConversation({
      assignedDepartmentId: assignDepartmentId,
      assignedEmployeeId: assignEmployeeId
    });
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
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <Inbox className="h-4 w-4" aria-hidden />
            <span>Bandeja</span>
          </p>
          {canSupervisor ? (
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
              {[
                ["mine", "Mia"],
                ["team", "Supervisor"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setViewMode(value as "mine" | "team")}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${
                    viewMode === value ? "bg-cyan-300 text-slate-950" : "text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
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
                {conversation.sla ? (
                  <span className={`rounded-full px-2 py-1 ${slaStyles[conversation.sla.state] ?? slaStyles.ok}`}>
                    {conversation.sla.label}
                    {conversation.sla.minutesWaiting ? ` ${conversation.sla.minutesWaiting}m` : ""}
                  </span>
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
        <ChatBox conversationId={selected?.id} enableTourCards quickReplies={supportTemplates} />
      </section>

      <aside className="space-y-4">
        {selected?.sla && selected.sla.state !== "ok" ? (
          <section className={`rounded-[2rem] border border-white/10 p-4 ${slaStyles[selected.sla.state] ?? slaStyles.ok}`}>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em]">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <span>SLA</span>
            </p>
            <p className="mt-2 text-sm font-black">{selected.sla.label}</p>
            <p className="mt-1 text-xs opacity-80">
              {selected.sla.minutesWaiting ? `${selected.sla.minutesWaiting} minutos esperando respuesta.` : "Caso al dia."}
            </p>
          </section>
        ) : null}

        {canSupervisor ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              <UserCog className="h-4 w-4" aria-hidden />
              <span>Supervisor</span>
            </p>
            <select
              value={assignDepartmentId}
              onChange={(event) => {
                setAssignDepartmentId(event.target.value);
                setAssignEmployeeId("");
              }}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">Sin departamento</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
            <select
              value={assignEmployeeId}
              onChange={(event) => setAssignEmployeeId(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">Sin agente especifico</option>
              {assignableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}{employee.jobTitle ? ` - ${employee.jobTitle}` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !selected}
              onClick={() => void assignConversation()}
              className="mt-3 w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
            >
              Asignar caso
            </button>
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <StickyNote className="h-4 w-4" aria-hidden />
            <span>Notas internas</span>
          </p>
          <textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Nota privada del equipo. No se muestra al cliente."
            className="mt-3 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
          />
          <button
            type="button"
            disabled={busy || !selected}
            onClick={() => void saveInternalNote()}
            className="mt-3 w-full rounded-2xl border border-cyan-300/30 px-4 py-3 text-sm font-black text-cyan-100 disabled:opacity-50"
          >
            Guardar nota
          </button>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <MessageSquareQuote className="h-4 w-4" aria-hidden />
            <span>Plantillas</span>
          </p>
          <div className="mt-3 space-y-2 text-xs text-slate-400">
            {supportTemplates.slice(0, 4).map((template) => (
              <p key={template} className="rounded-2xl border border-white/10 bg-white/5 p-3">{template}</p>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <BriefcaseBusiness className="h-4 w-4" aria-hidden />
            <span>Ficha operativa</span>
          </p>
          {selected?.booking ? (
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden />
                  <span>Reserva</span>
                </p>
                <p className="font-black text-white">{selected.booking.bookingCode}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                  <span>Cliente</span>
                </p>
                <p className="font-black text-white">{selected.booking.customer.name}</p>
                <p className="text-xs text-slate-400">{selected.booking.customer.emailMasked ?? "Email protegido"}</p>
                <p className="text-xs text-slate-400">{selected.booking.customer.phoneMasked ?? "Telefono protegido"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="font-black text-white">{selected.booking.service}</p>
                <p className="mt-1 text-xs text-slate-400">{selected.booking.supplier}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  <span>Fecha: {formatDate(selected.booking.travelDate)}</span>
                </p>
                <p className="text-xs text-slate-300">Hora: {selected.booking.startTime ?? "Pendiente"}</p>
                <p className="text-xs text-slate-300">Pax: {selected.booking.passengers}</p>
                <p className="text-xs text-slate-300">Pick-up: {selected.booking.pickup}</p>
                {selected.booking.flightNumber ? (
                  <p className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Plane className="h-3.5 w-3.5" aria-hidden />
                    <span>Vuelo: {selected.booking.flightNumber}</span>
                  </p>
                ) : null}
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
                  <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                    <BadgeDollarSign className="h-3.5 w-3.5" aria-hidden />
                    <span>Total</span>
                  </p>
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
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <Search className="h-4 w-4" aria-hidden />
            <span>Buscar reserva</span>
          </p>
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
                  <span className="inline-flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" aria-hidden />
                    Vincular
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <GitBranch className="h-4 w-4" aria-hidden />
            <span>Escalar a departamento</span>
          </p>
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
            <span className="inline-flex items-center justify-center gap-2">
              <GitBranch className="h-4 w-4" aria-hidden />
              Escalar caso
            </span>
          </button>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Esto crea una sala interna con mencion al departamento y conserva este chat con el cliente.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <Headphones className="h-4 w-4" aria-hidden />
            <span>Estado del caso</span>
          </p>
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
