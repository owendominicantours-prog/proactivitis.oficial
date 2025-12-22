"use server";

import type Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { BookingSourceEnum, BookingStatusEnum } from "@/lib/types/booking";
import { createNotification } from "@/lib/notificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

type PaymentIntentPayload = {
  tourId?: string;
  tourTitle?: string;
  tourImage?: string;
  tourPrice?: number | string;
  date?: string;
  time?: string;
  adults?: number;
  youth?: number;
  child?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneCountry?: string;
  pickupPreference?: "pickup" | "later";
  pickupLocation?: string;
  language?: string;
  specialRequirements?: string;
  paymentOption?: "now" | "later";
};

const parsePositive = (value: number | string | undefined, fallback: number) => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? fallback : Math.max(fallback, value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : Math.max(fallback, parsed);
  }
  return fallback;
};

const parseTravelDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeString = (value: string | undefined) => (value ? value.trim() : null);

const parsePriceValue = (value: number | string | undefined, fallback: number) => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? fallback : value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const formatDateLabel = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long"
  }).format(value);

const buildBookingSummary = (title: string, travelDate: Date, pax: number, startTime?: string | null) => {
  const base = `${title} — ${pax} pax — ${formatDateLabel(travelDate)}`;
  return startTime ? `${base} — ${startTime}` : base;
};

const ensureCustomerSession = async (name: string, email: string) => {
  const session = await getServerSession(authOptions);
  const sessionUser = (session?.user as { id?: string } | null) ?? null;
  if (sessionUser?.id) {
    return sessionUser.id;
  }

  const [user] = await Promise.all([
    prisma.user.upsert({
      where: { email: email.toLowerCase() },
      create: {
        id: randomUUID(),
        email: email.toLowerCase(),
        name,
        password: randomUUID()
      },
      update: {
        name
      }
    })
  ]);

  const secret = process.env.JWT_SECRET ?? "proactivitis-default";
  const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "7d" });
  const sessionBase =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  await fetch(`${sessionBase}/api/session/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });

  return user.id;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json().catch(() => ({}))) as PaymentIntentPayload;
    const tourId = payload.tourId;

    if (!tourId) {
      return NextResponse.json({ error: "Necesitamos saber qué tour estás reservando." }, { status: 400 });
    }

  if (!payload.firstName || !payload.lastName) {
    return NextResponse.json({ error: "Ingresa nombre y apellido completos." }, { status: 400 });
  }

  if (!payload.email || !payload.email.includes("@")) {
    return NextResponse.json({ error: "Ingresa un correo válido." }, { status: 400 });
  }

  const travelDate = parseTravelDate(payload.date);
  if (!travelDate) {
    return NextResponse.json({ error: "Selecciona una fecha válida." }, { status: 400 });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (travelDate < today) {
    return NextResponse.json({ error: "La fecha debe ser posterior a hoy." }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      SupplierProfile: {
        include: {
          User: {
            select: {
              id: true
            }
          }
        }
      }
    }
  });

  if (!tour) {
    return NextResponse.json({ error: "No encontramos el tour indicado." }, { status: 404 });
  }

  const adults = parsePositive(payload.adults, 1);
  const youth = parsePositive(payload.youth, 0);
  const child = parsePositive(payload.child, 0);
  const passengerCount = Math.max(1, adults + youth + child);
  const pricePerPerson = parsePriceValue(payload.tourPrice, tour.price);
  const totalAmount = Math.round(pricePerPerson * passengerCount * 100) / 100;

  const customerName = `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();
  const customerEmail = payload.email.trim().toLowerCase();
  const customerPhone = normalizeString(payload.phone);
  const pickupPreference = payload.pickupPreference ?? "later";
  const pickupLocation =
    pickupPreference === "pickup" ? normalizeString(payload.pickupLocation) : "Decidiré el punto más tarde";
  const pickupNotes = [normalizeString(payload.specialRequirements), payload.language]
    .filter(Boolean)
    .join(" · ");

  const startTime = normalizeString(payload.time) ?? null;
  const summary = buildBookingSummary(
    payload.tourTitle ?? tour.title,
    travelDate,
    passengerCount,
    startTime
  );

  let userId: string;
  try {
    userId = await ensureCustomerSession(customerName, customerEmail);
  } catch (error) {
    console.error("Error creando sesión temporal", error);
    return NextResponse.json({ error: "No pudimos iniciar tu sesión. Intenta nuevamente." }, { status: 500 });
  }

  const booking = await prisma.booking.create({
    data: {
      tourId,
      customerName,
      customerEmail,
      customerPhone,
      travelDate,
      paxAdults: adults,
      paxChildren: youth + child,
      passengers: passengerCount,
      pickup: pickupLocation,
      pickupNotes: pickupNotes || undefined,
      startTime,
      totalAmount,
      userId,
      status: BookingStatusEnum.PAYMENT_PENDING,
      source: BookingSourceEnum.WEB,
      paymentMethod: payload.paymentOption === "later" ? "PAY_LATER" : "CARD"
    }
  });

  await createNotification({
    type: "ADMIN_BOOKING_CREATED",
    role: "ADMIN",
    title: "Nueva reserva en la web",
    message: `Reserva para ${summary}.`,
    bookingId: booking.id,
    metadata: {
      tourId: tour.id,
      pax: passengerCount.toString()
    }
  });

  if (tour.SupplierProfile?.userId) {
    await createNotification({
      type: "SUPPLIER_BOOKING_CREATED",
      role: "SUPPLIER",
      title: `Reserva nueva en ${tour.title}`,
      message: `Tienes una reserva para ${summary}.`,
      bookingId: booking.id,
      metadata: {
        tourId: tour.id
      },
      recipientUserId: tour.SupplierProfile.userId
    });
  }

  const stripeClient = getStripe();
  const currency = (process.env.STRIPE_CURRENCY ?? "usd").toLowerCase();
  const platformSharePercent = Math.min(Math.max(tour.platformSharePercent ?? 20, 20), 50);
  const centsAmount = Math.round(totalAmount * 100);
  const platformFeeAmount = Math.round((centsAmount * platformSharePercent) / 100);
  const supplierAmount = centsAmount - platformFeeAmount;
  const supplierAccountId = tour.SupplierProfile?.stripeAccountId;

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: centsAmount,
    currency,
    description: summary,
    metadata: {
      phoneCountry: payload.phoneCountry ?? "unknown",
      bookingId: booking.id,
      tourId: tour.id,
      pax: passengerCount.toString(),
      startTime: startTime ?? "",
      paymentOption: payload.paymentOption ?? "now",
      pickupPreference,
      supplierAccountId: supplierAccountId ?? "not-configured",
      platformSharePercent: platformSharePercent.toString(),
      holdForProvider: "true"
    },
    automatic_payment_methods: {
      enabled: true
    }
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status ?? booking.paymentStatus,
      platformFee: totalAmount,
      supplierAmount: 0
    }
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/supplier/bookings");
  revalidatePath("/agency/bookings");
  revalidatePath("/dashboard/customer");

  return NextResponse.json({
    bookingId: booking.id,
    amount: totalAmount,
    clientSecret: paymentIntent.client_secret ?? null
  });
  } catch (error) {
    console.error("Checkout payment-intent failed", error);
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo preparar el pago por un error inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
