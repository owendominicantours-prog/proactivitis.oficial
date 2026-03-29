import Image from "next/image";
import { toDataURL } from "qrcode";
import EticketActions from "@/components/booking/EticketActions";
import { buildBookingPresentation } from "@/lib/bookingPresentation";

type BookingSummary = {
  id: string;
  travelDate: Date;
  startTime?: string | null;
  flowType?: string | null;
  tripType?: string | null;
  returnTravelDate?: Date | null;
  returnStartTime?: string | null;
  totalAmount: number;
  paxAdults: number;
  paxChildren: number;
  customerName?: string | null;
  customerEmail: string;
  pickupNotes?: string | null;
  hotel?: string | null;
  originAirport?: string | null;
  flightNumber?: string | null;
  agencyName?: string | null;
  agencyPhone?: string | null;
};

type TourSummary = {
  id: string;
  slug: string;
  title: string;
  heroImage?: string | null;
  meetingPoint?: string | null;
  meetingInstructions?: string | null;
  duration?: string | null;
  language?: string | null;
};

type EticketProps = {
  booking: BookingSummary;
  tour: TourSummary;
  supplierName?: string | null;
  variant?: "full" | "compact";
  orderCode?: string;
};

const bringItems = ["Protector solar", "Calzado cómodo", "Documentación", "Ropa ligera"];

export default async function Eticket({ booking, tour, supplierName, variant = "full", orderCode }: EticketProps) {
  const qrPayload = `${booking.id}|${tour.slug}|${booking.travelDate.toISOString()}`;
  const qrSize = variant === "full" ? 220 : 160;
  const qrDataUrl = await toDataURL(qrPayload, { width: qrSize, margin: 2 });
  const totalGuests = booking.paxAdults + booking.paxChildren;
  const heroImage = tour.heroImage ?? "/fototours/fototour.jpeg";
  const meetingPoint = tour.meetingPoint ?? "Punto aún por coordinar";
  const pickupTime = booking.startTime ?? "Hora por confirmar";
  const arrivalDate = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(booking.travelDate);
  const returnDateLabel = booking.returnTravelDate
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(booking.returnTravelDate))
    : null;
  const presentation = buildBookingPresentation({
    flowType: booking.flowType,
    tripType: booking.tripType,
    originAirport: booking.originAirport,
    flightNumber: booking.flightNumber,
    hotel: booking.hotel,
    pickup: tour.meetingPoint,
    pickupNotes: booking.pickupNotes,
    returnTravelDate: booking.returnTravelDate,
    returnStartTime: booking.returnStartTime,
    startTime: booking.startTime,
    travelDateValue: booking.travelDate,
    language: tour.language,
    duration: tour.duration,
    meetingPoint: tour.meetingPoint
  });
  const meetingLabel = variant === "full" ? "Punto de encuentro" : "Encuentro";
  const containerClass =
    variant === "full"
      ? "rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
      : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm";
  const displayOrderCode = orderCode ?? `#PR-${booking.id.slice(-4).toUpperCase()}`;
  const actions = variant === "full" ? (
    <EticketActions bookingId={booking.id} tourTitle={tour.title} orderCode={displayOrderCode} />
  ) : null;

  return (
    <section id={variant === "full" ? "eticket" : `eticket-${booking.id}`} className={containerClass}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Proactivitis" width={45} height={45} className="rounded-full" priority />
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Voucher digital</p>
            <p className="text-base font-black uppercase tracking-[0.2em] text-slate-900">Proactivitis</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Estado</p>
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
            PAGADO
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr,1fr,1fr]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Codigo</p>
          <p className="text-2xl font-black text-slate-900">{displayOrderCode}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Tour</p>
          <p className="text-base font-semibold text-slate-800">{tour.title}</p>
          <p className="text-sm text-slate-500">{arrivalDate}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Pax</p>
          <p className="text-lg font-semibold text-slate-800">{totalGuests} personas</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{pickupTime}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Resumen operativo</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Pasajero principal</p>
            <p className="text-sm font-semibold text-slate-900">{booking.customerName ?? "Pendiente"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Fecha de ida</p>
            <p className="text-sm font-semibold text-slate-900">{arrivalDate}</p>
          </div>
          {booking.flowType === "transfer" && booking.tripType === "round-trip" ? (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Fecha de regreso</p>
              <p className="text-sm font-semibold text-slate-900">
                {returnDateLabel ?? "Pendiente"}
                {booking.returnStartTime ? ` · ${booking.returnStartTime}` : ""}
              </p>
            </div>
          ) : null}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{presentation.routeLabel}</p>
            <p className="text-sm font-semibold text-slate-900">{presentation.routeValue}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Agencia</p>
            <p className="text-sm font-semibold text-slate-900">{booking.agencyName ?? "Reserva directa"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Códigos internos</p>
            <p className="text-sm font-semibold text-slate-900">{displayOrderCode} · {booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="space-y-1 xl:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{presentation.notesLabel}</p>
            <p className="text-sm font-semibold text-slate-900">{presentation.notesValue}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="relative h-52 w-full overflow-hidden rounded-3xl bg-slate-100">
            <Image src={heroImage} alt={tour.title} fill className="object-cover" priority />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{meetingLabel}</p>
              <p className="text-sm font-semibold text-slate-900">{meetingPoint}</p>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(meetingPoint)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600"
              >
                Abrir en Google Maps
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{presentation.kind === "transfer" ? "Hora del servicio" : "Hora del tour"}</p>
              <p className="text-sm font-semibold text-slate-900">{pickupTime}</p>
              <p className="text-xs text-slate-500">Inicio y pick-up coordinados con tu proveedor.</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center shadow-inner">
            <div className="relative mx-auto h-36 w-36">
              <Image
                src={qrDataUrl}
                alt="QR e-ticket"
                width={qrSize}
                height={qrSize}
                unoptimized
                className="h-full w-full"
                priority
              />
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">Escanéalo con el guía</p>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Total pagado</p>
              <p className="text-lg font-semibold text-slate-900">${booking.totalAmount.toFixed(2)} USD</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Titular</p>
              <p className="text-sm font-semibold text-slate-900">{booking.customerName ?? "Viajero Proactivitis"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Proveedor</p>
              <p className="text-sm font-semibold text-slate-900">{supplierName ?? "Proactivitis"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {booking.flowType === "transfer" && booking.tripType === "round-trip" ? "Pickup regreso" : "Hotel"}
          </p>
          <p className="text-sm font-semibold text-slate-900">{booking.hotel ?? "No proporcionado"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{presentation.primaryDetailsLabel}</p>
          <p className="text-sm font-semibold text-slate-900">{presentation.primaryDetailsValue}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Qué llevar</p>
          <ul className="text-sm text-slate-600">
            {bringItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Origen / vuelo</p>
          <p className="text-sm font-semibold text-slate-900">
            {booking.originAirport ?? "Origen pendiente"}
            {booking.flightNumber ? ` · ${booking.flightNumber}` : ""}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Canal</p>
          <p className="text-sm font-semibold text-slate-900">
            {booking.agencyName ? `Agencia · ${booking.agencyName}` : "Reserva directa"}
          </p>
          {booking.agencyPhone && <p className="text-xs text-slate-500">{booking.agencyPhone}</p>}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Tipo</p>
          <p className="text-sm font-semibold text-slate-900">
            {booking.tripType === "round-trip" ? "Ida y vuelta" : "Servicio principal"}
          </p>
        </div>
      </div>
      {booking.flowType === "transfer" && booking.tripType === "round-trip" && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-700">Datos del regreso</p>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <p className="text-sm font-semibold text-slate-900">{returnDateLabel ?? "Fecha pendiente"}</p>
            <p className="text-sm font-semibold text-slate-900">{booking.returnStartTime ?? "Hora pendiente"}</p>
          </div>
          <p className="mt-2 text-sm text-slate-700">
            Recogida de regreso: <span className="font-semibold text-slate-900">{booking.hotel ?? "Pendiente"}</span>
          </p>
        </div>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Código QR</p>
          <p className="text-xs text-slate-600">Úsalo en tu celular o imprime la hoja para mostrar al guía.</p>
        </div>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Política de cambio</p>
          <p className="text-sm text-slate-700">
            Cambios gratuitos hasta 48 horas antes del tour. Después de esa ventana, se aplican cargos según la
            disponibilidad del operador.
          </p>
        </div>
      </div>
      {actions}
    </section>
  );
}
