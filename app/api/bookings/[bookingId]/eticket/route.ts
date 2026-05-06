import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDataURL } from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildBuffer = (doc: PDFKit.PDFDocument) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => {
      const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(Buffer.from(merged));
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

  const isRentCar = booking.flowType === "rent_car";
  const orderCode = booking.bookingCode ?? `#PR-${booking.id.slice(-4).toUpperCase()}`;
  const serviceTitle =
    isRentCar && booking.transferVehicleName ? booking.transferVehicleName : booking.Tour.title;
  const qrPayload = `${booking.id}|${booking.Tour.slug}|${booking.travelDate.toISOString()}`;
  const qrDataUrl = await toDataURL(qrPayload, { width: 220, margin: 3 });
  const qrBase = Buffer.from(qrDataUrl.split(",")[1] ?? "", "base64");

  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc.info.Title = `E-Ticket ${orderCode}`;
  doc.font("Helvetica");

  doc.fillColor("#0f172a").fontSize(24).text("Proactivitis", { align: "left" });
  doc.fontSize(10).fillColor("#64748b").text("Voucher digital", { align: "left" });
  doc.moveDown(0.5);

  doc
    .fontSize(14)
    .fillColor("#0f172a")
    .text(`Codigo: ${orderCode}`, { continued: true })
    .fontSize(10)
    .fillColor("#94a3b8")
    .text(`  - ${serviceTitle}`);

  doc.moveDown();
  doc.image(qrBase, doc.page.width - 48 - 120, doc.y - 6, { width: 120 });

  doc
    .fontSize(12)
    .fillColor("#0f172a")
    .text(isRentCar ? "Datos de la reserva rent car" : "Datos del tour", { underline: true })
    .moveDown(0.5);
  doc
    .fontSize(11)
    .fillColor("#0f172a")
    .text(`${isRentCar ? "Vehiculo" : "Tour"}: ${serviceTitle}`)
    .text(`Fecha: ${booking.travelDate.toLocaleDateString("es-ES", { dateStyle: "long" })}`)
    .text(`Hora: ${booking.startTime ?? "Por confirmar"}`)
    .text(isRentCar ? `Estado: Reservado - pago pendiente` : `Pasajeros: ${booking.paxAdults + booking.paxChildren}`)
    .text(`${isRentCar ? "Entrega" : "Punto de encuentro"}: ${booking.pickup ?? booking.Tour.meetingPoint ?? "Coordinar con el operador"}`)
    .text(`${isRentCar ? "Devolucion" : "Hotel"}: ${booking.hotel ?? "No proporcionado"}`)
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
    .text(`Telefono: ${booking.customerPhone ?? "No proporcionado"}`)
    .text(`Proveedor: ${booking.Tour.SupplierProfile?.company ?? "Proactivitis"}`)
    .moveDown();

  if (booking.pickupNotes) {
    doc
      .fontSize(12)
      .fillColor("#0f172a")
      .text("Resumen operativo", { underline: true })
      .moveDown(0.3)
      .fontSize(10)
      .fillColor("#334155")
      .text(booking.pickupNotes, { width: doc.page.width - 96 })
      .moveDown();
  }

  doc
    .fontSize(12)
    .fillColor("#0f172a")
    .text(isRentCar ? "Que llevar para retirar el vehiculo" : "Que llevar", { underline: true })
    .moveDown(0.5);

  const bringItems = isRentCar
    ? ["Licencia vigente", "Documento de identidad", "Metodo de garantia", "Confirmacion de reserva"]
    : ["Protector solar", "Calzado comodo", "Documentacion", "Ropa ligera"];

  bringItems.forEach((item) => {
    doc.fontSize(11).text(`- ${item}`);
  });

  doc.moveDown(2);
  doc.fontSize(10).fillColor("#475569").text(
    isRentCar
      ? "Este documento digital sirve como comprobante de reserva. Presentalo al equipo de Proactivitis durante la coordinacion del vehiculo."
      : "Este documento digital sirve como comprobante de pago. Presentalo al guia junto al codigo QR.",
    { width: doc.page.width - 96 }
  );

  doc.end();
  const buffer = await buildBuffer(doc);
  const response = new NextResponse(new Uint8Array(buffer));
  response.headers.set("Content-Type", "application/pdf");
  response.headers.set("Content-Disposition", `attachment; filename="proactivitis-eticket-${booking.id}.pdf"`);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
