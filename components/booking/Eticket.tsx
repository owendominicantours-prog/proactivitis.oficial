import Image from "next/image";
import { toDataURL } from "qrcode";
import EticketActions from "@/components/booking/EticketActions";

type BookingSummary = {
  id: string;
  travelDate: Date;
  startTime?: string | null;
  totalAmount: number;
  paxAdults: number;
  paxChildren: number;
  customerName?: string | null;
  customerEmail: string;
  pickupNotes?: string | null;
  hotel?: string | null;
};

type TourSummary = {
  id: string;
  slug: string;
  title: string;
  heroImage?: string | null;
  meetingPoint?: string | null;
  meetingInstructions?: string | null;
  duration?: string | null;
};

type EticketProps = {
  booking: BookingSummary;
  tour: TourSummary;
  supplierName?: string | null;
  variant?: "full" | "compact";
};

const bringItems = ["Protector solar", "Calzado cómodo", "Documentación", "Ropa ligera"];

export default async function Eticket({ booking, tour, supplierName, variant = "full" }: EticketProps) {
  const qrPayload = `${booking.id}|${tour.slug}|${booking.travelDate.toISOString()}`;
  const qrSize = variant === "full" ? 220 : 160;
  const qrDataUrl = await toDataURL(qrPayload, { width: qrSize, margin: 2 });
  const totalGuests = booking.paxAdults + booking.paxChildren;
  const heroImage = tour.heroImage ?? "/fototours/fototour.jpeg";
  const meetingPoint = tour.meetingPoint ?? "Punto aún por coordinar";
  const pickupTime = booking.startTime ?? "Hora por confirmar";
  const arrivalDate = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(booking.travelDate);
  const meetingLabel = variant === "full" ? "Punto de encuentro" : "Encuentro";
  const containerClass =
    variant === "full"
      ? "rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
      : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm";
  const actions = variant === "full" ? (
    <EticketActions bookingId={booking.id} tourTitle={tour.title} orderCode={`#PR-${booking.id.slice(-4).toUpperCase()}`} />
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
          <p className="text-2xl font-black text-slate-900">{`#PR-${booking.id.slice(-4).toUpperCase()}`}</p>
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
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Hora del tour</p>
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Hotel</p>
          <p className="text-sm font-semibold text-slate-900">{booking.hotel ?? "No proporcionado"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Pickup notes</p>
          <p className="text-sm font-semibold text-slate-900">{booking.pickupNotes ?? "Coordinar con el proveedor"}</p>
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
