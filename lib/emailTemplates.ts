type BookingData = {
  id: string;
  travelDate: Date;
  startTime?: string | null;
  tripType?: string | null;
  returnTravelDate?: Date | null;
  returnStartTime?: string | null;
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
  agencyName?: string | null;
  agencyPhone?: string | null;
};

type TourData = {
  title: string;
  slug: string;
  heroImage?: string | null;
  meetingPoint?: string | null;
};

type EmailTone = "primary" | "success" | "warning" | "dark";

type EmailShellOptions = {
  eyebrow?: string;
  title: string;
  intro?: string;
  contentHtml: string;
  footerNote?: string;
  disclaimer?: string;
  reasonWhyReceived?: string;
  supportEmail?: string;
  supportLabel?: string;
  baseUrl?: string;
  tone?: EmailTone;
};

const bringItems = ["Protector solar", "Celular cargado", "Documento de identidad", "Calzado comodo"];

const toneMap: Record<EmailTone, { bg: string; text: string }> = {
  primary: { bg: "linear-gradient(135deg,#0096ff,#0074d9)", text: "#f8fbff" },
  success: { bg: "linear-gradient(135deg,#0f766e,#10b981)", text: "#f8fbff" },
  warning: { bg: "linear-gradient(135deg,#b45309,#f59e0b)", text: "#fff7ed" },
  dark: { bg: "linear-gradient(135deg,#0f172a,#1e293b)", text: "#f8fafc" }
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: undefined }).format(value);

const escapeHtml = (value: string | number | null | undefined) => {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

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

export const buildEmailShell = ({
  eyebrow = "Proactivitis",
  title,
  intro,
  contentHtml,
  footerNote,
  disclaimer,
  reasonWhyReceived,
  supportEmail = "support@proactivitis.com",
  supportLabel = "Soporte Proactivitis",
  baseUrl = "https://proactivitis.com",
  tone = "primary"
}: EmailShellOptions) => {
  const toneStyles = toneMap[tone];

  return `
    <div style="font-family:Inter,system-ui,-apple-system,sans-serif;color:#0f172a;background:#eef3fb;padding:32px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(15,23,42,0.14);border:1px solid rgba(15,23,42,0.06);">
        <div style="background:${toneStyles.bg};padding:28px 32px;color:${toneStyles.text};">
          <p style="margin:0;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;opacity:0.88;">${escapeHtml(eyebrow)}</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;color:${toneStyles.text};">${escapeHtml(title)}</h1>
          ${
            intro
              ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.65;color:${toneStyles.text};opacity:0.94;">${escapeHtml(
                  intro
                )}</p>`
              : ""
          }
        </div>
        <div style="padding:32px;">
          <div style="margin-bottom:20px;padding:16px 18px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
            <p style="margin:0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#94a3b8;">Resumen</p>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.75;color:#475569;">
              ${
                intro
                  ? escapeHtml(intro)
                  : "Este mensaje contiene informacion operativa y enlaces seguros relacionados con tu cuenta o actividad dentro de Proactivitis."
              }
            </p>
            <p style="margin:10px 0 0;font-size:13px;line-height:1.75;color:#64748b;">
              ${
                reasonWhyReceived
                  ? escapeHtml(reasonWhyReceived)
                  : "Recibes este correo porque realizaste una accion dentro de Proactivitis, como registrarte, reservar, solicitar ayuda o participar en una comunicacion operativa."
              }
            </p>
          </div>
          ${contentHtml}
        </div>
        <div style="padding:24px 32px;background:#f8fafc;border-top:1px solid rgba(15,23,42,0.06);">
          ${
            footerNote
              ? `<p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#475569;">${escapeHtml(footerNote)}</p>`
              : ""
          }
          <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:#64748b;">
            ${
              disclaimer
                ? escapeHtml(disclaimer)
                : "Este correo fue enviado por Proactivitis como parte de la gestion de tu cuenta, reserva o solicitud dentro de nuestra plataforma."
            }
          </p>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:#64748b;">
            Para tu seguridad, evita compartir este mensaje con terceros y utiliza solamente los enlaces que ves escritos dentro de este correo o en nuestro dominio oficial.
          </p>
          <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">
            Si necesitas ayuda, escribe a
            <a href="mailto:${escapeHtml(supportEmail)}" style="color:#0ea5e9;text-decoration:none;font-weight:600;">
              ${escapeHtml(supportLabel)}
            </a>
            o visita
            <a href="${escapeHtml(baseUrl)}" style="color:#0ea5e9;text-decoration:none;font-weight:600;">
              ${escapeHtml(baseUrl)}
            </a>.
          </p>
          <p style="margin:8px 0 0;font-size:12px;line-height:1.7;color:#64748b;">
            Sitio oficial: ${escapeHtml(baseUrl)} · Correo de soporte: ${escapeHtml(supportEmail)}
          </p>
        </div>
      </div>
    </div>
  `;
};

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
  const meetingPoint = tour.meetingPoint ?? "Punto aun por coordinar";
  const travelDate = formatDate(booking.travelDate);
  const isTransfer = booking.flowType === "transfer";
  const flightInfo = booking.flightNumber ? `Vuelo ${booking.flightNumber}` : "Vuelo pendiente";
  const airportLabel = booking.originAirport ? booking.originAirport : "Aeropuerto por confirmar";
  const reviewUrl = `${baseUrl}/tours/${tour.slug}#reviews`;

  return buildEmailShell({
    eyebrow: "Voucher digital",
    title: "Reserva confirmada",
    intro: "Gracias por reservar con Proactivitis. Tu servicio ya quedo confirmado y puedes guardar este voucher.",
    baseUrl,
    tone: "primary",
    disclaimer:
      "Este correo confirma la emision de tu voucher y contiene informacion operativa de tu reserva. Guardalo para presentarlo el dia del servicio.",
    reasonWhyReceived:
      "Recibes este correo porque una reserva fue confirmada con tu direccion de correo y se emitio un voucher asociado a tu servicio.",
    footerNote: supplierName
      ? `Operador asignado: ${supplierName}. Si necesitas asistencia previa al servicio, usa los enlaces seguros de este correo o nuestro soporte oficial.`
      : "Si necesitas asistencia previa al servicio, usa los enlaces seguros de este correo o nuestro soporte oficial.",
    contentHtml: `
      <p style="margin:0;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#64748b;">Codigo</p>
      <p style="margin:6px 0;font-size:32px;font-weight:700;color:#0f172a;">${escapeHtml(orderCode)}</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:24px;">
        <div>
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.4em;color:#94a3b8;">Servicio</p>
          <p style="margin:4px 0;font-size:18px;font-weight:600;color:#0f172a;">${escapeHtml(tour.title)}</p>
          <p style="margin:0;font-size:14px;color:#475569;">${escapeHtml(travelDate)}</p>
        </div>
        <div>
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.4em;color:#94a3b8;">Pasajeros</p>
          <p style="margin:4px 0;font-size:18px;font-weight:600;color:#0f172a;">${booking.paxAdults + booking.paxChildren} personas</p>
          <p style="margin:0;font-size:14px;color:#475569;">${escapeHtml(booking.startTime ?? "Horario por confirmar")}</p>
        </div>
        <div>
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.4em;color:#94a3b8;">${
            isTransfer ? "Servicio" : "Punto de encuentro"
          }</p>
          <p style="margin:4px 0;font-size:14px;font-weight:600;color:#0f172a;">${
            isTransfer ? escapeHtml(booking.hotel ?? "Hotel por confirmar") : escapeHtml(meetingPoint)
          }</p>
        </div>
      </div>
      ${
        isTransfer
          ? `
      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;">
        <div>
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#94a3b8;">Origen</p>
          <p style="margin:4px 0;font-size:14px;font-weight:600;color:#0f172a;">${escapeHtml(airportLabel)}</p>
        </div>
        <div>
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#94a3b8;">Vuelo</p>
          <p style="margin:4px 0;font-size:14px;font-weight:600;color:#0f172a;">${escapeHtml(flightInfo)}</p>
        </div>
      </div>
      `
          : ""
      }
      <div style="margin-top:32px;">
        <h2 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0f172a;">Que llevar</h2>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${buildBringList()}</ul>
      </div>
      <div style="margin-top:32px;padding:24px;border-radius:18px;border:1px solid rgba(15,23,42,0.08);background:#f8fafc;">
        <p style="margin:0;font-size:12px;color:#64748b;">Presenta tu e-ticket y confirma este codigo con el operador al llegar.</p>
        <a href="${ticketUrl}" style="display:inline-flex;margin-top:12px;padding:12px 24px;border-radius:12px;background:#0f172a;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;text-decoration:none;">
          Ver mi e-ticket
        </a>
        <a href="${reviewUrl}" style="display:inline-flex;margin-top:12px;margin-left:8px;padding:12px 24px;border-radius:12px;background:#4f46e5;color:#fff;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;text-decoration:none;">
          Dejar resena
        </a>
      </div>
      <p style="margin-top:24px;font-size:14px;color:#475569;">
        Correo enviado a ${escapeHtml(booking.customerEmail)}. Si necesitas ajustar un detalle operativo, puedes
        <a href="${whatsappLink}" style="color:#0ea5e9;font-weight:600;text-decoration:none;"> chatear por WhatsApp</a>.
      </p>
      <p style="margin-top:12px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">
        ID de reserva: ${escapeHtml(booking.id)} - Proactivitis LLC
      </p>
    `
  });
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

  return buildEmailShell({
    eyebrow: "Operacion supplier",
    title: "Nueva reserva confirmada",
    intro: `El servicio ${tour.title} ya cuenta con pago confirmado y requiere seguimiento operativo.`,
    baseUrl,
    tone: "dark",
    disclaimer:
      "Este correo fue enviado al proveedor asignado para coordinar y operar una reserva confirmada dentro de Proactivitis.",
    reasonWhyReceived:
      "Recibes este correo porque tu cuenta o empresa aparece como responsable de operar una reserva confirmada dentro de Proactivitis.",
    footerNote:
      "Revisa el panel para validar horarios, contacto del viajero, logistica y documentacion antes del servicio.",
    contentHtml: `
      <p style="margin:0;font-size:12px;letter-spacing:0.4em;text-transform:uppercase;color:#94a3b8;">Codigo interno</p>
      <p style="margin:6px 0;font-size:28px;font-weight:600;color:#0f172a;">${escapeHtml(orderCode)}</p>
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-top:20px;">
        <div style="flex:1;min-width:180px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#64748b;">Cliente</p>
          <p style="margin:4px 0;font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(customerName ?? "Huesped")}</p>
          <p style="margin:0;font-size:14px;color:#475569;">${escapeHtml(booking.customerEmail)}</p>
        </div>
        <div style="flex:1;min-width:180px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#64748b;">Fecha</p>
          <p style="margin:4px 0;font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(travelDate)}</p>
          <p style="margin:0;font-size:14px;color:#475569;">${escapeHtml(booking.startTime ?? "Horario por coordinar")}</p>
        </div>
        <div style="flex:1;min-width:180px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#64748b;">Pax</p>
          <p style="margin:4px 0;font-size:16px;font-weight:600;color:#0f172a;">${booking.paxAdults + booking.paxChildren}</p>
          <p style="margin:0;font-size:14px;color:#475569;">Total: $${booking.totalAmount.toFixed(2)} USD</p>
        </div>
      </div>
      <p style="margin:24px 0 8px;font-size:12px;letter-spacing:0.4em;text-transform:uppercase;color:#94a3b8;">Pickup</p>
      <p style="margin:0;font-size:14px;color:#0f172a;">${escapeHtml(tour.meetingPoint ?? "Punto aun por coordinar")}</p>
      <p style="margin:4px 0;font-size:14px;color:#64748b;">${escapeHtml(booking.pickupNotes ?? "Sin notas adicionales")}</p>
      ${booking.flightNumber ? `<p style="margin:12px 0 0;font-size:12px;color:#475569;">Vuelo: ${escapeHtml(booking.flightNumber)}</p>` : ""}
      <div style="margin-top:28px;padding:18px;border-radius:16px;border:1px dashed rgba(15,23,42,0.2);background:#f8fafc;">
        <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#0f172a;">Panel para revisar</p>
        <a
          href="${baseUrl}/supplier/bookings"
          style="display:inline-block;margin-top:10px;padding:10px 20px;border-radius:999px;background:#0f172a;color:#fff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;text-decoration:none;"
        >
          Ver reserva y contactos
        </a>
      </div>
      <p style="margin-top:18px;font-size:11px;color:#94a3b8;">
        Pedido ${escapeHtml(orderCode)} - Tour ${escapeHtml(tour.slug)}
      </p>
    `
  });
};

export type { BookingData, TourData, EmailShellOptions };
