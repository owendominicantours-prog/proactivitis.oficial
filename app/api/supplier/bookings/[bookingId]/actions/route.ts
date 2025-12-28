import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notificationService";
import { sendEmail } from "@/lib/email";

const ACTION_LABELS: Record<string, { subject: string; template: (params: { customerName: string; startTime?: string | null; note?: string }) => string }> = {
  confirmTime: {
    subject: "Tu proveedor confirmó la hora de recogida",
    template: ({ customerName, startTime }) => `
      <p>Hola ${customerName},</p>
      <p>Tu proveedor Proactivitis confirmó la recogida a las ${startTime ?? "hora pactada"}.</p>
      <p>Te esperamos al punto de encuentro.</p>
    `
  },
  requestInfo: {
    subject: "Tu proveedor necesita más información",
    template: ({ customerName, note }) => `
      <p>Hola ${customerName},</p>
      <p>${note}</p>
    `
  }
};

export async function POST(request: NextRequest, { params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId }
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
  const payload = {
    to: booking.customerEmail,
    subject: "",
    html: ""
  };

  switch (action) {
    case "confirmTime": {
      payload.subject = ACTION_LABELS.confirmTime.subject;
      payload.html = ACTION_LABELS.confirmTime.template({
        customerName,
        startTime: booking.startTime
      });
      break;
    }
    case "requestInfo": {
      const type = body.type as string | undefined;
      const option = type === "room" ? "Necesitamos el número de habitación." : type === "paymentProof" ? "Envía, por favor, el comprobante de pago." : "Infórmanos si tienes un retraso.";
      payload.subject = ACTION_LABELS.requestInfo.subject;
      payload.html = ACTION_LABELS.requestInfo.template({ customerName, note: option });
      break;
    }
    case "note": {
      const message = body.message as string | undefined;
      if (!message) {
        return NextResponse.json({ error: "El mensaje es requerido." }, { status: 400 });
      }
      await createNotification({
        type: "ADMIN_SYSTEM_ALERT",
        role: "ADMIN",
        title: `Nota del supplier ${booking.customerName ?? "sin nombre"}`,
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

  try {
    await sendEmail(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Supplier action failed", error);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 });
  }
}
