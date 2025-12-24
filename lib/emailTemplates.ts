type BookingData = {
  id: string;
  travelDate: Date;
  startTime?: string | null;
  totalAmount: number;
  paxAdults: number;
  paxChildren: number;
  customerName?: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  pickupNotes?: string | null;
  hotel?: string | null;
  originAirport?: string | null;
  flightNumber?: string | null;
  flowType?: string | null;
};

type TourData = {
  title: string;
  slug: string;
  heroImage?: string | null;
  meetingPoint?: string | null;
};

const bringItems = ["Protector solar", "Celular cargado", "Documentación", "Calzado cómodo"];

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: undefined }).format(value);

const buildBringList = () =>
  bringItems
    .map(
      (item) => `
        <li style="margin-bottom:4px;">
          ${item}
        </li>
      `
    )
    .join("");

export const buildCustomerEticketEmail = ({
  booking,
  tour,
  supplierName,
  ticketUrl,
  orderCode,
  baseUrl,
  whatsappLink
}: {
  booking: BookingData;
  tour: TourData;
  supplierName?: string | null;
  ticketUrl: string;
  orderCode: string;
  baseUrl: string;
  whatsappLink: string;
}) => {
  const meetingPoint = tour.meetingPoint ?? "Punto aún por coordinar";
  const travelDate = formatDate(booking.travelDate);
  const isTransfer = booking.flowType === "transfer";
  const flightInfo = booking.flightNumber ? `Vuelo ${booking.flightNumber}` : "Vuelo pendiente";
  const airportLabel = booking.originAirport ? booking.originAirport : "Aeropuerto por confirmar";
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;color:#0f172a;background:#ecf2ff;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:30px;overflow:hidden;box-shadow:0 30px 90px rgba(2,6,23,0.15);">
        <div
          style="background:linear-gradient(135deg,#0096ff,#0074d9);padding:28px;display:flex;flex-direction:column;gap:12px;"
        >
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${baseUrl}/logo.png" alt="Proactivitis" width="54" height="54" style="border-radius:50%;" />
            <div>
              <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#cfe0ff;">
                Voucher digital
              </p>
              <h1 style="margin:4px 0 0;font-size:24px;color:#fff;">Reserva confirmada</h1>
            </div>
          </div>
          <p style="margin:0;font-size:16px;color:#f6f8ff;">¡Gracias por reservar con Proactivitis! Ya puedes guardar este voucher.</p>
        </div>
        <div style="padding:36px;">
          <p style="margin:0;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#64748b;">
            Código
          </p>
          <p style="margin:6px 0;font-size:32px;font-weight:700;color:#0f172a;">${orderCode}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:24px;">
            <div>
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.4em;color:#94a3b8;">Tour</p>
              <p style="margin:4px 0;font-size:18px;font-weight:600;color:#0f172a;">${tour.title}</p>
              <p style="margin:0;font-size:14px;color:#475569;">${travelDate}</p>
            </div>
            <div>
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.4em;color:#94a3b8;">Pasajeros</p>
              <p style="margin:4px 0;font-size:18px;font-weight:600;color:#0f172a;">${booking.paxAdults + booking.paxChildren} personas</p>
              <p style="margin:0;font-size:14px;color:#475569;">${booking.startTime ?? "Horario por confirmar"}</p>
            </div>
            <div>
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.4em;color:#94a3b8;">${isTransfer ? "Traslado" : "Punto de encuentro"}</p>
              <p style="margin:4px 0;font-size:14px;font-weight:600;color:#0f172a;">${isTransfer ? booking.hotel ?? "Hotel por confirmar" : meetingPoint}</p>
            </div>
          </div>
          ${
            isTransfer
              ? `
          <div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">
            <div>
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#94a3b8;">Origen</p>
              <p style="margin:4px 0;font-size:14px;font-weight:600;color:#0f172a;">${airportLabel}</p>
            </div>
            <div>
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#94a3b8;">${flightInfo}</p>
              <p style="margin:4px 0;font-size:14px;font-weight:600;color:#0f172a;">Traslado confirmado</p>
            </div>
          </div>
          `
              : ""
          }
          <div style="margin-top:32px;">
            <h2 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0f172a;">Qué llevar</h2>
            <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${buildBringList()}</ul>
          </div>
          <div style="margin-top:32px;padding:24px;border-radius:18px;border:1px solid rgba(15,23,42,0.08);background:#f8fafc;">
            <p style="margin:0;font-size:12px;color:#64748b;">Tu guía verificará el código QR cuando llegues.</p>
            <a href="${ticketUrl}" style="display:inline-flex;margin-top:12px;padding:12px 24px;border-radius:12px;background:#0f172a;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;text-decoration:none;">
              Ver mi e-ticket
            </a>
          </div>
    <p style="margin-top:24px;font-size:14px;color:#475569;">
      Mensaje enviado a ${booking.customerEmail}. Si tenés dudas sobre el punto de encuentro podés <a href="${whatsappLink}" style="color:#0ea5e9;font-weight:600;">chatear por WhatsApp</a>.
    </p>
        </div>
        <div style="padding:24px;background:#f8fafc;text-align:center;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">
          ID de reserva: ${booking.id} · Proactivitis LLC
        </div>
      </div>
    </div>
  `;
};

export const buildSupplierBookingEmail = ({
  booking,
  tour,
  customerName,
  orderCode,
  baseUrl
}: {
  booking: BookingData;
  tour: TourData;
  customerName?: string | null;
  orderCode: string;
  baseUrl: string;
}) => {
  const travelDate = formatDate(booking.travelDate);
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;color:#0f172a;background:#f1f5f9;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;border:1px solid rgba(15,23,42,0.08);overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,0.1);">
        <div style="padding:28px 32px;background:#0f172a;color:#fff;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">Nueva reserva confirmada</h1>
          <p style="margin:6px 0 0;font-size:14px;">Tour: ${tour.title}</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.4em;text-transform:uppercase;color:#94a3b8;">Código interno</p>
          <p style="margin:6px 0;font-size:28px;font-weight:600;color:#0f172a;">${orderCode}</p>
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-top:20px;">
            <div style="flex:1;min-width:180px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#64748b;">Cliente</p>
              <p style="margin:4px 0;font-size:16px;font-weight:600;color:#0f172a;">${customerName ?? "Huésped"}</p>
              <p style="margin:0;font-size:14px;color:#475569;">${booking.customerEmail}</p>
            </div>
            <div style="flex:1;min-width:180px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#64748b;">Fecha</p>
              <p style="margin:4px 0;font-size:16px;font-weight:600;color:#0f172a;">${travelDate}</p>
              <p style="margin:0;font-size:14px;color:#475569;">${booking.startTime ?? "Horario por coordinar"}</p>
            </div>
            <div style="flex:1;min-width:180px;">
              <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#64748b;">Pax</p>
              <p style="margin:4px 0;font-size:16px;font-weight:600;color:#0f172a;">${booking.paxAdults + booking.paxChildren}</p>
              <p style="margin:0;font-size:14px;color:#475569;">Total: $${booking.totalAmount.toFixed(2)} USD</p>
            </div>
          </div>
          <p style="margin:24px 0 8px;font-size:12px;letter-spacing:0.4em;text-transform:uppercase;color:#94a3b8;">Pickup</p>
          <p style="margin:0;font-size:14px;color:#0f172a;">${tour.meetingPoint ?? "Punto aún por coordinar"}</p>
          <p style="margin:4px 0;font-size:14px;color:#64748b;">${booking.pickupNotes ?? "Sin notas adicionales"}</p>
          ${booking.flightNumber ? `<p style="margin:12px 0 0;font-size:12px;color:#475569;">Vuelo: ${booking.flightNumber}</p>` : ""}
          <div style="margin-top:28px;padding:18px;border-radius:16px;border:1px dashed rgba(15,23,42,0.2);background:#f8fafc;">
            <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#0f172a;">Panel para revisar</p>
            <a
              href="${baseUrl}/supplier/bookings"
              style="display:inline-block;margin-top:10px;padding:10px 20px;border-radius:999px;background:#0f172a;color:#fff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;text-decoration:none;"
            >
              Ver reserva y contactos
            </a>
          </div>
        </div>
        <div style="padding:20px;background:#f8fafc;text-align:center;font-size:11px;color:#64748b;">
          Pedido #{orderCode} · Tour ID ${tour.slug}
        </div>
      </div>
    </div>
  `;
};

export type { BookingData, TourData };
