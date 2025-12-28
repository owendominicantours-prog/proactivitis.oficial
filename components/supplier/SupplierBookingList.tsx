"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Phone, MessageCircle, Slack } from "lucide-react";

export type SupplierBookingSummary = {
  id: string;
  bookingCode: string;
  travelDate: string;
  travelDateValue: string;
  startTime: string | null;
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
  flightNumber?: string | null;
  pickupNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  whatsappNumber?: string | null;
};

type RequestInfoOption = {
  label: string;
  value: "room" | "paymentProof" | "delay";
  message: string;
};

const requestOptions: RequestInfoOption[] = [
  { label: "Solicitar número de habitación", value: "room", message: "Por favor envíanos tu número de habitación para coordinar el pickup." },
  { label: "Solicitar comprobante de pago", value: "paymentProof", message: "Nos puedes enviar el comprobante de pago para cerrar los detalles financieros." },
  { label: "Informar retraso", value: "delay", message: "Tu transporte podría tener un retraso; te avisaremos cuándo salimos." }
];

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  PAYMENT_PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200"
};

type Props = {
  bookings: SupplierBookingSummary[];
};

export function SupplierBookingList({ bookings }: Props) {
  const [selectedBooking, setSelectedBooking] = useState<SupplierBookingSummary | null>(null);
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [requestOption, setRequestOption] = useState<RequestInfoOption | null>(null);

  const openModal = (booking: SupplierBookingSummary) => {
    setSelectedBooking(booking);
    setModalStatus(null);
    setModalError(null);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setRequestOption(null);
  };

  const handleConfirmTime = async () => {
    if (!selectedBooking) return;
    try {
      const response = await fetch(`/api/supplier/bookings/${selectedBooking.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirmTime" })
      });
      if (!response.ok) throw new Error("No se pudo confirmar la hora.");
      setModalStatus("Correo de confirmación enviado.");
    } catch (error) {
      setModalError((error as Error).message);
    }
  };

  const handleRequestInfo = async (option: RequestInfoOption) => {
    if (!selectedBooking) return;
    try {
      const response = await fetch(`/api/supplier/bookings/${selectedBooking.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "requestInfo", type: option.value })
      });
      if (!response.ok) throw new Error("No se pudo enviar la solicitud.");
      setRequestOption(option);
      setModalStatus("Solicitud enviada al cliente.");
    } catch (error) {
      setModalError((error as Error).message);
    }
  };

  const handleSendNote = async (message: string) => {
    if (!selectedBooking) return;
    try {
      const response = await fetch(`/api/supplier/bookings/${selectedBooking.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "note", message })
      });
      if (!response.ok) throw new Error("No se pudo enviar la nota.");
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
            `Última actualización ${new Date(selectedBooking.updatedAt).toLocaleString("es-ES")}`
          ]
        : null,
    [selectedBooking]
  );

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  ID {booking.bookingCode.slice(-6).toUpperCase()}
                </p>
                <h2 className="text-lg font-semibold text-slate-900">{booking.tourTitle}</h2>
                <p className="text-sm text-slate-500">
                  {booking.pax} personas · Pickup {booking.hotel ?? booking.pickup ?? "Pendiente"} · {booking.startTime ?? "Hora por confirmar"}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${statusColors[booking.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                {booking.status}
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <p className="text-sm text-slate-700">
                <span className="text-xs uppercase text-slate-500">Cliente</span>
                <br />
                <strong>{booking.customerName ?? "Invitado"}</strong>
              </p>
              <p className="text-sm text-slate-700">
                <span className="text-xs uppercase text-slate-500">Pickup</span>
                <br />
                {booking.hotel ?? booking.pickup ?? "Pendiente"}
              </p>
              <p className="text-sm text-slate-700">
                <span className="text-xs uppercase text-slate-500">Hora</span>
                <br />
                {booking.startTime ?? "Pendiente"}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em]">
              <a
                href={`https://wa.me/${booking.whatsappNumber?.replace(/\D/g, "") ?? "18093949877"}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600"
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={() => openModal(booking)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
              >
                <Check className="h-4 w-4 text-slate-500" />
                Ver detalles
              </button>
            </div>
          </article>
        ))}
      </div>

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
                  <span className="text-xs uppercase text-slate-500">Logística</span>
                  <br />
                  Pickup {selectedBooking.hotel ?? selectedBooking.pickup ?? "Pendiente"}, hora {selectedBooking.startTime ?? "Pendiente"}
                </p>
                <p>
                  <span className="text-xs uppercase text-slate-500">Vuelo</span>
                  <br />
                  {selectedBooking.flightNumber ?? "No registrado"}
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
                <span className="text-xs uppercase text-slate-500">Comisión plataforma</span>
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

            <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Acciones</p>
                <span className="text-xs text-slate-500">{selectedBooking.status}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleConfirmTime}
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
