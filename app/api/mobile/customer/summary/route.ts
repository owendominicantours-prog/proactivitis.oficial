import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNotificationsForRecipient } from "@/lib/notificationService";

const withCors = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
};

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

const readMobileUserId = (request: Request) => {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-default";
    const decoded = jwt.verify(token, secret) as { userId?: string };
    return decoded.userId ?? null;
  } catch {
    return null;
  }
};

const toStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const isPastTravel = (value?: Date | null) => {
  if (!value) return false;
  return value.getTime() < Date.now();
};

const hasReview = (booking: { TourReviews: { id: string }[]; TransferReviews: { id: string }[] }) =>
  booking.TourReviews.length > 0 || booking.TransferReviews.length > 0;

const bookingTitle = (booking: {
  flowType?: string | null;
  transferVehicleName?: string | null;
  originAirport?: string | null;
  hotel?: string | null;
  pickup?: string | null;
  Tour?: { title: string } | null;
}) => {
  if (booking.flowType === "transfer") {
    const route = [booking.originAirport, booking.hotel || booking.pickup].filter(Boolean).join(" -> ");
    return route || booking.transferVehicleName || "Transfer privado";
  }
  return booking.Tour?.title ?? "Experiencia Proactivitis";
};

export async function GET(request: Request) {
  try {
    const userId = readMobileUserId(request);
    if (!userId) {
      return withCors(NextResponse.json({ error: "Sesion requerida." }, { status: 401 }));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true,
        CustomerPayment: {
          select: {
            method: true,
            brand: true,
            last4: true,
            stripeCustomerId: true,
            stripePaymentMethodId: true,
            updatedAt: true
          }
        },
        CustomerPreference: {
          select: {
            preferredCountries: true,
            preferredDestinations: true,
            preferredProductTypes: true,
            discountEligible: true,
            completedAt: true,
            consentMarketing: true
          }
        }
      }
    });

    if (!user || user.accountStatus === "DELETED") {
      return withCors(NextResponse.json({ error: "Sesion expirada." }, { status: 401 }));
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ userId: user.id }, { customerEmail: user.email }]
      },
      orderBy: [{ travelDate: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        bookingCode: true,
        status: true,
        flowType: true,
        travelDate: true,
        startTime: true,
        returnTravelDate: true,
        returnStartTime: true,
        totalAmount: true,
        paymentStatus: true,
        pickup: true,
        hotel: true,
        originAirport: true,
        transferVehicleName: true,
        paxAdults: true,
        paxChildren: true,
        passengers: true,
        createdAt: true,
        Tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            heroImage: true
          }
        },
        TourReviews: {
          select: {
            id: true,
            status: true,
            rating: true
          }
        },
        TransferReviews: {
          select: {
            id: true,
            status: true,
            rating: true
          }
        }
      }
    });

    const notifications = await getNotificationsForRecipient({ role: "CUSTOMER", userId: user.id, limit: 20 });
    const upcomingBookings = bookings.filter((booking) => !isPastTravel(booking.travelDate) && booking.status !== "CANCELLED");
    const completedBookings = bookings.filter(
      (booking) => booking.status === "COMPLETED" || (isPastTravel(booking.travelDate) && booking.status !== "CANCELLED")
    );
    const reviewCandidates = completedBookings.filter((booking) => !hasReview(booking));
    const paidBookings = bookings.filter((booking) => booking.paymentStatus === "paid" || booking.paymentStatus === "PAID");

    return withCors(
      NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        metrics: {
          totalBookings: bookings.length,
          upcoming: upcomingBookings.length,
          completed: completedBookings.length,
          pendingReviews: reviewCandidates.length,
          unreadNotifications: notifications.filter((notification) => !notification.isRead).length,
          totalPaid: paidBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
        },
        payment: user.CustomerPayment
          ? {
              method: user.CustomerPayment.method,
              brand: user.CustomerPayment.brand,
              last4: user.CustomerPayment.last4,
              hasStripeCustomer: Boolean(user.CustomerPayment.stripeCustomerId),
              hasSavedMethod: Boolean(user.CustomerPayment.stripePaymentMethodId || user.CustomerPayment.last4),
              updatedAt: user.CustomerPayment.updatedAt
            }
          : null,
        preference: user.CustomerPreference
          ? {
              preferredCountries: toStringList(user.CustomerPreference.preferredCountries),
              preferredDestinations: toStringList(user.CustomerPreference.preferredDestinations),
              preferredProductTypes: toStringList(user.CustomerPreference.preferredProductTypes),
              discountEligible: user.CustomerPreference.discountEligible,
              completedAt: user.CustomerPreference.completedAt,
              consentMarketing: user.CustomerPreference.consentMarketing
            }
          : null,
        bookings: bookings.slice(0, 8).map((booking) => ({
          id: booking.id,
          bookingCode: booking.bookingCode,
          status: booking.status,
          flowType: booking.flowType,
          title: bookingTitle(booking),
          travelDate: booking.travelDate,
          startTime: booking.startTime,
          returnTravelDate: booking.returnTravelDate,
          returnStartTime: booking.returnStartTime,
          totalAmount: booking.totalAmount,
          paymentStatus: booking.paymentStatus,
          pickup: booking.pickup,
          hotel: booking.hotel,
          originAirport: booking.originAirport,
          vehicleName: booking.transferVehicleName,
          passengers: booking.passengers ?? booking.paxAdults + booking.paxChildren,
          tourSlug: booking.Tour?.slug ?? null,
          tourImage: booking.Tour?.heroImage ?? null,
          hasReview: hasReview(booking)
        })),
        pendingReviews: reviewCandidates.slice(0, 5).map((booking) => ({
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          title: bookingTitle(booking),
          flowType: booking.flowType,
          travelDate: booking.travelDate,
          tourSlug: booking.Tour?.slug ?? null
        })),
        notifications: notifications.slice(0, 5).map((notification) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message ?? notification.body ?? "",
          type: notification.type,
          isRead: notification.isRead,
          bookingId: notification.bookingId,
          createdAt: notification.createdAt
        }))
      })
    );
  } catch {
    return withCors(NextResponse.json({ error: "No se pudo cargar tu cuenta." }, { status: 500 }));
  }
}
