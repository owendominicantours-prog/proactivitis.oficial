import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long"
  }).format(value);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await context.params;
  const session = await getServerSession(authOptions);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Tour: {
        include: {
          SupplierProfile: {
            select: {
              userId: true,
              company: true
            }
          }
        }
      },
      AgencyProLink: {
        select: {
          agencyUserId: true
        }
      },
      AgencyTransferLink: {
        select: {
          agencyUserId: true
        }
      }
    }
  });

  if (!booking || !booking.Tour) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const role = (session?.user?.role ?? "").toUpperCase();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email?.toLowerCase();
  const ownsBooking =
    Boolean(userId && booking.userId === userId) ||
    Boolean(userEmail && booking.customerEmail.toLowerCase() === userEmail);
  const canDownload =
    role === "ADMIN" ||
    role === "EMPLOYEE" ||
    ownsBooking ||
    Boolean(userId && booking.Tour.SupplierProfile?.userId === userId) ||
    Boolean(
      userId &&
        (booking.AgencyProLink?.agencyUserId === userId ||
          booking.AgencyTransferLink?.agencyUserId === userId)
    );

  if (!session?.user || !canDownload) {
    return NextResponse.json({ error: "No autorizado" }, { status: session?.user ? 403 : 401 });
  }

  const orderCode = booking.bookingCode ?? `#PR-${booking.id.slice(-4).toUpperCase()}`;
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc.info.Title = `Comprobante ${orderCode}`;
  doc.font("Helvetica");

  doc.fillColor("#0f172a").fontSize(24).text("Proactivitis", { align: "left" });
  doc.fontSize(10).fillColor("#64748b").text("Comprobante de reserva y pago", { align: "left" });
  doc.moveDown();

  doc.fontSize(16).fillColor("#0f172a").text(`Codigo: ${orderCode}`);
  doc.fontSize(10).fillColor("#64748b").text(`Emitido: ${formatDate(new Date())}`);
  doc.moveDown();

  const rows = [
    ["Cliente", booking.customerName ?? "Cliente Proactivitis"],
    ["Correo", booking.customerEmail],
    ["Servicio", booking.Tour.title],
    ["Fecha del servicio", formatDate(booking.travelDate)],
    ["Hora", booking.startTime ?? "Por confirmar"],
    ["Estado reserva", booking.status],
    ["Estado pago", booking.paymentStatus ?? "Pendiente"],
    ["Metodo", booking.paymentMethod ?? "No registrado"],
    ["Total", `${formatMoney(booking.totalAmount)} USD`],
    ["Proveedor", booking.Tour.SupplierProfile?.company ?? "Proactivitis"],
    ["ID interno", booking.id]
  ];

  rows.forEach(([label, value]) => {
    doc
      .fontSize(9)
      .fillColor("#64748b")
      .text(label.toUpperCase(), { continued: false })
      .fontSize(12)
      .fillColor("#0f172a")
      .text(value)
      .moveDown(0.55);
  });

  doc.moveDown();
  doc
    .fontSize(10)
    .fillColor("#475569")
    .text(
      "Este comprobante refleja la informacion registrada en la plataforma Proactivitis. Si el pago aun aparece pendiente, completa el pago desde tu cuenta para confirmar el servicio.",
      { width: doc.page.width - 96 }
    );

  doc.end();
  const buffer = await buildBuffer(doc);
  const response = new NextResponse(new Uint8Array(buffer));
  response.headers.set("Content-Type", "application/pdf");
  response.headers.set("Content-Disposition", `attachment; filename="proactivitis-recibo-${booking.id}.pdf"`);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
