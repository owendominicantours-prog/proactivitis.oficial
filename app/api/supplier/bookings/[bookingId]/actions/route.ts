import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notificationService";
import { sendEmail } from "@/lib/email";

const ACTION_TEMPLATES = {
  confirmTime: ({ customerName, startTime, hotel, note }: { customerName: string; startTime?: string | null; hotel?: string | null; note?: string }) => `
    <p>Hola ${customerName},</p>
    <p>Tu suplidor ha confirmado los detalles de tu servicio:</p>
    <ul>
      <li><strong>Punto de encuentro:</strong> ${hotel ?? "Pendiente"}</li>
      <li><strong>Hora exacta:</strong> ${startTime ?? "Por confirmar"}</li>
      <li><strong>Nota del suplidor:</strong> ${note ?? "Por favor espera en el lobby principal."}</li>
    </ul>
    <p>Gracias por confiar en Proactivitis.</p>
  `,
  requestInfo: ({ customerName, note }: { customerName: string; note: string }) => `
    <p>Hola ${customerName},</p>
    <p>${note}</p>
    <p>Gracias por colaborar con Proactivitis.</p>
  `
};

export async function POST(request: NextRequest, { params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { Tour: true }
  });
  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;
  if (!action) {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  const customerName = booking.customerName ?? "viajero";

  switch (action) {
    case "confirmTime": {
      const html = ACTION_TEMPLATES.confirmTime({
        customerName,
        startTime: booking.startTime ?? body.startTime,
        hotel: booking.hotel ?? booking.pickup,
        note: body.note
      });
      await sendEmail({
        to: booking.customerEmail,
        subject: `🕒 Hora de recogida confirmada - ${booking.Tour?.title ?? "tu servicio"}`,
        html
      });
      return NextResponse.json({ ok: true });
    }
    case "requestInfo": {
      const option =
        body.type === "room"
          ? "Necesitamos el número de habitación."
          : body.type === "paymentProof"
            ? "Envía, por favor, el comprobante de pago."
            : "Infórmanos si tienes un retraso.";
      const html = ACTION_TEMPLATES.requestInfo({ customerName, note: option });
      await sendEmail({
        to: booking.customerEmail,
        subject: "Tu proveedor necesita más información",
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
    default:
      return NextResponse.json({ error: "Acción no soportada." }, { status: 400 });
  }
}
