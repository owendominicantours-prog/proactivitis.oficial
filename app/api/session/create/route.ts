import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { BookingStatusEnum } from "@/lib/types/booking";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { buildCustomerEticketEmail, buildSupplierBookingEmail } from "@/lib/emailTemplates";

type Body = {
  bookingId?: string;
  sessionId?: string;
  paymentIntentId?: string;
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const buildCookie = (name: string, value: string) => {
  const secure = process.env.NODE_ENV === "production";
  const segments = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${COOKIE_MAX_AGE}`
  ];
  if (secure) {
    segments.push("Secure");
  }
  return segments.join("; ");
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const bookingId = body.bookingId;
  if (!bookingId) {
    return NextResponse.json({ ok: false, error: "Reserva inv√°lida" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      User: true,
      Tour: {
        include: {
          SupplierProfile: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });
  if (!booking || !booking.User || !booking.Tour) {
    return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Configuraci√≥n faltante" }, { status: 500 });
  }

  const stripe = getStripe();

  const paymentIntentId = body.paymentIntentId ?? booking.stripePaymentIntentId;
  const stripeSessionId = body.sessionId ?? booking.stripeSessionId;
  let paymentStatus = booking.paymentStatus;

  if (!paymentIntentId && !stripeSessionId) {
    return NextResponse.json({ ok: false, error: "Falta la sesiÛn de pago" }, { status: 400 });
  }

  if (paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const intentPaid = ["succeeded", "requires_capture"].includes(paymentIntent.status);
    if (!intentPaid) {
      return NextResponse.json({ ok: false, error: "El pago a˙n no est· confirmado" }, { status: 402 });
    }
    paymentStatus = paymentIntent.status ?? paymentStatus;
  } else if (stripeSessionId) {
    const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "El pago a˙n no est· confirmado" }, { status: 402 });
    }
    paymentStatus = stripeSession.payment_status ?? paymentStatus;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatusEnum.CONFIRMED,
      paymentStatus
    }
  });

  const tour = booking.Tour;
  const supplierProfile = tour.SupplierProfile;
  const supplierUser = supplierProfile?.User;
  const supplierEmail = supplierUser?.email;
  const supplierName = supplierUser?.name ?? supplierProfile?.company ?? "Proactivitis";
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const ticketUrl = `${baseUrl}/booking/confirmed/${bookingId}`;
  const orderCode = `#PR-${bookingId.slice(-4).toUpperCase()}`;
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/?text=Hola%20Proactivitis";
  const tourData = {
    title: tour.title,
    slug: tour.slug,
    heroImage: tour.heroImage,
    meetingPoint: tour.meetingPoint
  };
  const bookingDetails = {
    id: booking.id,
    travelDate: booking.travelDate,
    startTime: booking.startTime,
    totalAmount: booking.totalAmount,
    paxAdults: booking.paxAdults,
    paxChildren: booking.paxChildren,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    pickupNotes: booking.pickupNotes,
    hotel: booking.hotel
  };
  const customerHtml = buildCustomerEticketEmail({
    booking: bookingDetails,
    tour: tourData,
    supplierName,
    orderCode,
    ticketUrl,
    baseUrl,
    whatsappLink
  });
  const supplierHtml = supplierEmail
    ? buildSupplierBookingEmail({
        booking: bookingDetails,
        tour: tourData,
        customerName: booking.customerName,
        orderCode,
        baseUrl
      })
    : null;
  const emailTasks = [
    sendEmail({
      to: booking.customerEmail,
      subject: `Tu reserva ${orderCode} est√° confirmada`,
      html: customerHtml
    }).catch((error) => {
      console.warn("No se pudo enviar el correo de confirmaci√≥n al cliente", error);
    })
  ];
  if (supplierEmail) {
    emailTasks.push(
      sendEmail({
        to: supplierEmail,
        subject: `Nueva reserva ${orderCode} para ${tour.title}`,
        html: supplierHtml ?? ""
      }).catch((error) => {
        console.warn("No se pudo enviar el correo al proveedor", error);
      })
    );
  }
  await Promise.all(emailTasks);

  const tokenPayload = {
    sub: booking.User.id,
    email: booking.User.email,
    name: booking.User.name ?? "Viajero",
    role: booking.User.role ?? "CUSTOMER",
    supplierApproved: booking.User.supplierApproved ? "true" : "false"
  };

  const jwtToken = await encode({
    token: tokenPayload,
    secret,
    maxAge: COOKIE_MAX_AGE
  });

  if (!jwtToken) {
    return NextResponse.json({ ok: false, error: "No se pudo iniciar sesi√≥n" }, { status: 500 });
  }

  const response = NextResponse.json({
    ok: true,
    bookingId,
    user: {
      id: booking.User.id,
      email: booking.User.email,
      name: booking.User.name
    }
  });

  response.headers.append("Set-Cookie", buildCookie("__Secure-next-auth.session-token", jwtToken));
  response.headers.append("Set-Cookie", buildCookie("next-auth.session-token", jwtToken));
  return response;
}
