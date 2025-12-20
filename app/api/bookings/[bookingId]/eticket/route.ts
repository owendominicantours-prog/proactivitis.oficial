import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDataURL } from "qrcode";

const buildBuffer = (doc: PDFKit.PDFDocument) =>
  new Promise<Buffer>((resolve) => {
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => {
      const buffers = chunks.map((chunk) => Buffer.from(chunk));
      resolve(Buffer.concat(buffers));
    });
  });

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await context.params;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Tour: {
        include: {
          SupplierProfile: {
            include: {
              User: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      User: true
    }
  });
  if (!booking || !booking.Tour) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const qrPayload = `${booking.id}|${booking.Tour.slug}|${booking.travelDate.toISOString()}`;
  const qrDataUrl = await toDataURL(qrPayload, { width: 220, margin: 3 });
  const qrBase = Buffer.from(qrDataUrl.split(",")[1], "base64");

  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc.info.Title = `E-Ticket ${booking.id}`;
  doc.font("Helvetica");

  doc.fillColor("#0f172a").fontSize(24).text("Proactivitis", { align: "left" });
  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text("Voucher digital", { align: "left", letterSpacing: 1.5 });
  doc.moveDown(0.5);

  doc
    .fontSize(14)
    .fillColor("#0f172a")
    .text(`Código: #PR-${booking.id.slice(-4).toUpperCase()}`, { continued: true })
    .fontSize(10)
    .fillColor("#94a3b8")
    .text(`  · ${booking.Tour.title}`);

  doc.moveDown();
  doc.image(qrBase, doc.page.width - 48 - 120, doc.y - 6, { width: 120 });
  doc
    .fontSize(12)
    .fillColor("#0f172a")
    .text("Datos del tour", { underline: true })
    .moveDown(0.5);
  doc
    .fontSize(11)
    .fillColor("#0f172a")
    .text(`Tour: ${booking.Tour.title}`)
    .text(`Fecha: ${booking.travelDate.toLocaleDateString("es-ES", { dateStyle: "long" })}`)
    .text(`Hora: ${booking.startTime ?? "Por confirmar"}`)
    .text(`Pasajeros: ${booking.paxAdults + booking.paxChildren}`)
    .text(`Punto de encuentro: ${booking.Tour.meetingPoint ?? "Coordinar con el operador"}`)
    .text(`Hotel: ${booking.hotel ?? "No proporcionado"}`)
    .moveDown();

  doc
    .fontSize(12)
    .fillColor("#0f172a")
    .text("Contactos", { underline: true })
    .moveDown(0.3)
    .fontSize(11)
    .fillColor("#0f172a")
    .text(`Cliente: ${booking.customerName ?? booking.User.name ?? "Viajero Proactivitis"}`)
    .text(`Email: ${booking.customerEmail}`)
    .text(`Proveedor: ${booking.Tour.SupplierProfile?.company ?? "Proactivitis"}`)
    .moveDown();

  doc
    .fontSize(12)
    .fillColor("#0f172a")
    .text("Qué llevar", { underline: true })
    .moveDown(0.5);
  ["Protector solar", "Calzado cómodo", "Documentación", "Ropa ligera"].forEach((item) => {
    doc.fontSize(11).text(`• ${item}`);
  });

  doc.moveDown(2);
  doc
    .fontSize(10)
    .fillColor("#475569")
    .text(
      "Este documento digital sirve como comprobante de pago. Preséntalo al guía junto al código QR.",
      { width: doc.page.width - 96 }
    );

  doc.end();
  const buffer = await buildBuffer(doc);
  const response = new NextResponse(buffer);
  response.headers.set("Content-Type", "application/pdf");
  response.headers.set("Content-Disposition", `inline; filename="proactivitis-eticket-${booking.id}.pdf"`);
  return response;
}
