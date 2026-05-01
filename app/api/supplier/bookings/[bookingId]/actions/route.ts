import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notificationService";
import { sendEmail } from "@/lib/email";
import { buildEmailShell } from "@/lib/emailTemplates";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  process.env.NEXTAUTH_URL ??
  "https://proactivitis.com";

const buildConfirmTimeHtml = ({
  customerName,
  serviceName,
  startTime,
  hotel,
  note
}: {
  customerName: string;
  serviceName: string;
  startTime?: string | null;
  hotel?: string | null;
  note?: string;
}) =>
  buildEmailShell({
    eyebrow: "Actualizacion operativa",
    title: "Hora de recogida confirmada",
    intro: `Hola ${customerName}, tu proveedor ya confirmo la logistica principal para ${serviceName}.`,
    baseUrl: APP_BASE_URL,
    tone: "success",
    disclaimer:
      "Este correo fue enviado por Proactivitis para informarte una actualizacion operacional relacionada con tu reserva.",
    footerNote: "Si necesitas cambiar un detalle antes del servicio, responde por los canales oficiales de soporte o WhatsApp.",
    contentHtml: `
      <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#94a3b8;">Detalles confirmados</p>
        <p style="margin:10px 0 0;font-size:14px;color:#475569;">Punto de encuentro: <strong>${hotel ?? "Pendiente"}</strong></p>
        <p style="margin:6px 0 0;font-size:14px;color:#475569;">Hora exacta: <strong>${startTime ?? "Por confirmar"}</strong></p>
        <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#0f172a;">${note ?? "Por favor espera en el lobby principal unos minutos antes de la hora acordada."}</p>
      </div>
    `
  });

const buildRequestInfoHtml = ({
  customerName,
  note
}: {
  customerName: string;
  note: string;
}) =>
  buildEmailShell({
    eyebrow: "Accion requerida",
    title: "Necesitamos un dato adicional",
    intro: `Hola ${customerName}, tu proveedor necesita una confirmacion para completar la operacion de tu reserva.`,
    baseUrl: APP_BASE_URL,
    tone: "warning",
    disclaimer:
      "Este correo fue enviado por Proactivitis para solicitar informacion adicional necesaria para operar tu reserva correctamente.",
    footerNote: "Responder cuanto antes ayuda a evitar retrasos o cambios de ultima hora en el servicio.",
    contentHtml: `
      <div style="padding:20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
        <p style="margin:0;font-size:14px;line-height:1.7;color:#0f172a;">${note}</p>
      </div>
    `
  });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const params = await context.params;
  const bookingId = params?.bookingId;
  if (!bookingId) {
    return NextResponse.json({ error: "ID de reserva faltante." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supplierProfile = await prisma.supplierProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!supplierProfile) {
    return NextResponse.json({ error: "Perfil de proveedor no encontrado." }, { status: 403 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { Tour: true }
  });
  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }
  if (!booking.Tour || booking.Tour.supplierId !== supplierProfile.id) {
    return NextResponse.json({ error: "No tienes permiso para operar esta reserva." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;
  if (!action) {
    return NextResponse.json({ error: "Accion invalida." }, { status: 400 });
  }

  const customerName = booking.customerName ?? "viajero";

  switch (action) {
    case "confirmTime": {
      const serviceName = booking.Tour?.title ?? "tu servicio";
      const html = buildConfirmTimeHtml({
        customerName,
        serviceName,
        startTime: booking.startTime ?? body.startTime,
        hotel: booking.hotel ?? booking.pickup,
        note: body.note
      });
      await sendEmail({
        to: booking.customerEmail,
        subject: `Hora de recogida confirmada - ${serviceName}`,
        html
      });
      return NextResponse.json({ ok: true });
    }
    case "requestInfo": {
      const option =
        body.type === "room"
          ? "Necesitamos el numero de habitacion para coordinar correctamente tu servicio."
          : body.type === "paymentProof"
          ? "Envianos, por favor, el comprobante de pago para validar la reserva."
          : "Informanos si tienes algun retraso o cambio relevante antes del servicio.";
      const html = buildRequestInfoHtml({ customerName, note: option });
      await sendEmail({
        to: booking.customerEmail,
        subject: "Tu proveedor necesita mas informacion",
        html
      });
      return NextResponse.json({ ok: true });
    }
    case "note": {
      const message = body.message as string | undefined;
      if (!message) {
        return NextResponse.json({ error: "El mensaje es requerido." }, { status: 400 });
      }
      await createNotification({
        type: "ADMIN_SYSTEM_ALERT",
        role: "ADMIN",
        title: `Nota del supplier ${customerName}`,
        message,
        metadata: {
          bookingId: booking.id,
          supplierNote: message
        }
      });
      return NextResponse.json({ ok: true });
    }
    case "markComplete": {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" }
      });
      await createNotification({
        type: "SUPPLIER_BOOKING_MODIFIED",
        role: "ADMIN",
        title: `Reserva ${booking.bookingCode ?? booking.id} completada`,
        message: `${customerName} confirmo el servicio.`,
        metadata: { bookingId }
      });
      return NextResponse.json({ ok: true });
    }
    case "cancel": {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancellationAt: new Date(),
          cancellationByRole: "SUPPLIER"
        }
      });
      await createNotification({
        type: "SUPPLIER_BOOKING_CANCELLED",
        role: "ADMIN",
        title: `Reserva ${booking.bookingCode ?? booking.id} cancelada`,
        message: `${customerName} cancelo el servicio.`,
        metadata: { bookingId }
      });
      return NextResponse.json({ ok: true });
    }
    case "requestCancel": {
      const reason = (body.reason as string | undefined)?.trim();
      if (!reason) {
        return NextResponse.json({ error: "El motivo es requerido." }, { status: 400 });
      }
      await createNotification({
        type: "ADMIN_SYSTEM_ALERT",
        role: "ADMIN",
        title: `Solicitud de cancelacion ${booking.bookingCode ?? booking.id}`,
        message: `Motivo: ${reason}`,
        metadata: { bookingId, supplier: customerName }
      });
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Accion no soportada." }, { status: 400 });
  }
}
