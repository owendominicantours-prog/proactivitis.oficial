"use server";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { getRentCarOption } from "@/data/rentCarFleet";
import { HIDDEN_RENT_CAR_SLUG } from "@/lib/hiddenTours";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";
import { createNotification } from "@/lib/notificationService";
import { BookingSourceEnum, BookingStatusEnum } from "@/lib/types/booking";

type RentCarReservationPayload = {
  locationId?: string;
  categorySlug?: string;
  locale?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  driverName?: string;
  pickupPlace?: string;
  dropoffPlace?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  flightNumber?: string;
  rentalDays?: number;
  estimatedTotal?: number;
};

const CODE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;
const CODE_RETRY_LIMIT = 8;

const normalizeString = (value?: string | null) => (value ?? "").trim();

const parseDateTime = (date?: string, time?: string) => {
  const dateValue = normalizeString(date);
  if (!dateValue) return null;
  const parsed = new Date(`${dateValue}T${normalizeString(time) || "10:00"}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatBookingCode = (suffix: string) => `PRO-${suffix}`;

const generateRandomSuffix = () =>
  Array.from({ length: CODE_LENGTH })
    .map(() => CODE_CHARSET[Math.floor(Math.random() * CODE_CHARSET.length)])
    .join("");

const generateBookingCode = async () => {
  for (let attempt = 0; attempt < CODE_RETRY_LIMIT; attempt++) {
    const candidate = formatBookingCode(generateRandomSuffix());
    const existing = await prisma.booking.findUnique({ where: { bookingCode: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("No se pudo generar un codigo unico.");
};

const ensureOriginalProactivitisSupplier = async () => {
  const existing = await prisma.supplierProfile.findFirst({
    where: { company: { equals: "Original Proactivitis", mode: "insensitive" } },
    include: { User: true }
  });

  if (existing) return existing;

  const email = process.env.RENT_CAR_SUPPLIER_EMAIL ?? "rentcar@proactivitis.com";
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Original Proactivitis",
      role: "SUPPLIER",
      supplierApproved: true,
      accountStatus: "APPROVED"
    },
    create: {
      id: randomUUID(),
      email,
      name: "Original Proactivitis",
      password: await bcrypt.hash(randomUUID(), 12),
      role: "SUPPLIER",
      supplierApproved: true,
      agencyApproved: false,
      accountStatus: "APPROVED"
    }
  });

  return prisma.supplierProfile.upsert({
    where: { userId: user.id },
    update: {
      company: "Original Proactivitis",
      approved: true,
      productsEnabled: true
    },
    create: {
      id: randomUUID(),
      userId: user.id,
      company: "Original Proactivitis",
      approved: true,
      productsEnabled: true
    },
    include: { User: true }
  });
};

const ensureRentCarTour = async (price: number) => {
  const supplier = await ensureOriginalProactivitisSupplier();

  const tour = await prisma.tour.upsert({
    where: { slug: HIDDEN_RENT_CAR_SLUG },
    update: {
      title: "Rent a car Proactivitis",
      price,
      duration: "Variable",
      description: "Producto interno usado para registrar reservas formales de rent car.",
      language: "Espanol / Ingles / Frances",
      includes: "Vehiculo; coordinacion de entrega; soporte Proactivitis",
      location: "Republica Dominicana",
      supplierId: supplier.id,
      featured: false,
      status: "draft"
    },
    create: {
      id: randomUUID(),
      title: "Rent a car Proactivitis",
      slug: HIDDEN_RENT_CAR_SLUG,
      productId: randomUUID(),
      price,
      duration: "Variable",
      description: "Producto interno usado para registrar reservas formales de rent car.",
      language: "Espanol / Ingles / Frances",
      includes: "Vehiculo; coordinacion de entrega; soporte Proactivitis",
      location: "Republica Dominicana",
      supplierId: supplier.id,
      featured: false,
      status: "draft"
    },
    include: {
      SupplierProfile: {
        include: { User: true }
      }
    }
  });

  return tour;
};

const ensureCustomer = async (name: string, email: string) => {
  const session = await getServerSession(authOptions);
  const sessionUser = (session?.user as { id?: string } | null) ?? null;
  if (sessionUser?.id) return sessionUser.id;

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { name },
    create: {
      id: randomUUID(),
      email: email.toLowerCase(),
      name,
      password: await bcrypt.hash(randomUUID(), 12),
      role: "CUSTOMER",
      supplierApproved: false,
      agencyApproved: false,
      accountStatus: "APPROVED"
    }
  });

  return user.id;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json().catch(() => ({}))) as RentCarReservationPayload;
    const locationId = normalizeString(payload.locationId);
    const categorySlug = normalizeString(payload.categorySlug);
    const customerName = normalizeString(payload.customerName);
    const customerEmail = normalizeString(payload.customerEmail).toLowerCase();
    const customerPhone = normalizeString(payload.customerPhone);
    const driverName = normalizeString(payload.driverName) || customerName;
    const pickupPlace = normalizeString(payload.pickupPlace);
    const dropoffPlace = normalizeString(payload.dropoffPlace);
    const pickupTime = normalizeString(payload.pickupTime) || "10:00";
    const returnTime = normalizeString(payload.returnTime) || "10:00";
    const flightNumber = normalizeString(payload.flightNumber);

    if (!locationId || !categorySlug) {
      return NextResponse.json({ ok: false, error: "Vehiculo invalido." }, { status: 400 });
    }

    if (!customerName || !customerEmail.includes("@") || !customerPhone) {
      return NextResponse.json({ ok: false, error: "Completa nombre, correo y telefono." }, { status: 400 });
    }

    if (!pickupPlace || !dropoffPlace) {
      return NextResponse.json({ ok: false, error: "Completa entrega y devolucion." }, { status: 400 });
    }

    const pickupDate = parseDateTime(payload.pickupDate, pickupTime);
    const returnDate = parseDateTime(payload.returnDate, returnTime);
    if (!pickupDate || !returnDate || returnDate <= pickupDate) {
      return NextResponse.json({ ok: false, error: "Selecciona fechas validas de entrega y devolucion." }, { status: 400 });
    }

    const settings = await getRentCarFleetSettings();
    const option = getRentCarOption(locationId, categorySlug, settings);
    if (!option) {
      return NextResponse.json({ ok: false, error: "Este vehiculo no esta disponible." }, { status: 404 });
    }

    const rentalDays = Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / 86400000));
    const estimatedTotal = option.price * rentalDays;
    const bookingCode = await generateBookingCode();
    const userId = await ensureCustomer(customerName, customerEmail);
    const rentCarTour = await ensureRentCarTour(option.price);
    const supplierUserId = rentCarTour.SupplierProfile?.User?.id ?? null;
    const pickupNotes = [
      "Rent car reservation",
      `Vehicle: ${option.model}`,
      `Class: ${option.categoryLabel}`,
      `Zone: ${option.locationName}`,
      `Daily price: $${option.price} ${option.currency}`,
      `Days: ${rentalDays}`,
      `Pickup: ${pickupPlace} - ${payload.pickupDate} ${pickupTime}`,
      `Return: ${dropoffPlace} - ${payload.returnDate} ${returnTime}`,
      flightNumber ? `Flight: ${flightNumber}` : null,
      `Driver: ${driverName}`,
      "Payment: pay later / no card charged online"
    ]
      .filter(Boolean)
      .join("\n");

    const booking = await prisma.booking.create({
      data: {
        tourId: rentCarTour.id,
        userId,
        status: BookingStatusEnum.CONFIRMED,
        source: BookingSourceEnum.WEB,
        customerName,
        customerEmail,
        customerPhone,
        bookingCode,
        travelDate: pickupDate,
        startTime: pickupTime,
        returnTravelDate: returnDate,
        returnStartTime: returnTime,
        paxAdults: 1,
        paxChildren: 0,
        passengers: 1,
        pickup: pickupPlace,
        hotel: dropoffPlace,
        originAirport: option.airportLabel,
        pickupNotes,
        flightNumber: flightNumber || null,
        totalAmount: estimatedTotal,
        supplierAmount: estimatedTotal,
        platformFee: 0,
        flowType: "rent_car",
        tripType: "rental",
        transferVehicleId: option.categorySlug,
        transferVehicleName: option.model,
        transferVehicleCategory: option.categoryLabel,
        paymentMethod: "PAY_LATER",
        paymentStatus: "PAY_LATER"
      }
    });

    await Promise.allSettled([
      createNotification({
        type: "ADMIN_BOOKING_CREATED",
        role: "ADMIN",
        title: "Nueva reserva rent car",
        message: `${option.model} - ${customerName} - ${option.locationName}`,
        bookingId: booking.id,
        metadata: {
          bookingId: booking.id,
          referenceUrl: `/admin/bookings?tab=all&bookingId=${booking.id}`,
          flowType: "rent_car",
          bookingCode
        }
      }),
      supplierUserId
        ? createNotification({
            type: "SUPPLIER_BOOKING_CREATED",
            role: "SUPPLIER",
            title: "Nueva reserva rent car",
            message: `${option.model} - ${customerName} - ${option.locationName}`,
            bookingId: booking.id,
            metadata: {
              bookingId: booking.id,
              referenceUrl: `/supplier/bookings?bookingId=${booking.id}`,
              flowType: "rent_car",
              bookingCode
            },
            recipientUserId: supplierUserId
          })
        : Promise.resolve(),
      createNotification({
        type: "CUSTOMER_BOOKING_CREATED",
        role: "CUSTOMER",
        title: "Reserva de rent car recibida",
        message: `Tu reserva ${bookingCode} para ${option.model} fue registrada.`,
        bookingId: booking.id,
        metadata: {
          bookingId: booking.id,
          referenceUrl: `/booking/confirmed?bookingId=${booking.id}`,
          flowType: "rent_car",
          bookingCode
        },
        recipientUserId: userId
      })
    ]);

    [
      "/admin/bookings",
      "/supplier/bookings",
      "/dashboard/customer",
      "/customer/reservations",
      "/booking/confirmed"
    ].forEach((path) => revalidatePath(path));

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      bookingCode,
      confirmationUrl: `/booking/confirmed?bookingId=${booking.id}&type=rent_car`
    });
  } catch (error) {
    console.error("[RentCarReservation] Failed to create reservation", error);
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar la reserva. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
