import { prisma } from "@/lib/prisma";
import { parseAdminItinerary } from "@/lib/itinerary";
import { TimelineStop } from "@/components/itinerary/ItineraryTimeline";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import type { Prisma } from "@prisma/client";

const shuffleArray = <T,>(items: T[]) => items.slice().sort(() => Math.random() - 0.5);

type RecommendedTour = {
  id: string;
  slug: string;
  title: string;
  price: number;
  heroImage: string | null;
  duration: string | null;
  location: string | null;
};

export type BookingConfirmationData = {
  booking: any;
  tour: any;
  supplier: { id: string; name: string } | null;
  recommendedTours: RecommendedTour[];
  timelineStops: TimelineStop[];
  whatsappLink: string;
  summary: string;
  orderCode: string;
  travelDateLabel: string;
  passengerLabel: string;
  startTimeLabel: string;
  flowType?: "tour" | "transfer";
  discountPercent: number;
};

export async function getBookingConfirmationData(
  bookingId: string
): Promise<BookingConfirmationData | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Tour: {
        include: {
          departureDestination: {
            include: { country: true }
          },
          SupplierProfile: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!booking || !booking.Tour) {
    return null;
  }

  const tour = booking.Tour;
  const supplier = tour.SupplierProfile?.User
    ? {
        id: tour.SupplierProfile.User.id,
        name: tour.SupplierProfile.User.name ?? "Proactivitis"
      }
    : null;

  const summary = `${tour.title} · ${booking.paxAdults + booking.paxChildren} pax · ${new Date(
    booking.travelDate
  ).toLocaleDateString("es-ES", { dateStyle: "long" })}`;

  const preference = await prisma.customerPreference.findUnique({
    where: { userId: booking.userId },
    select: {
      preferredCountries: true,
      preferredDestinations: true,
      completedAt: true,
      discountEligible: true,
      discountRedeemedAt: true
    }
  });
  const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
  const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
  const applyPreferences =
    preference?.completedAt && (preferredCountries.length || preferredDestinations.length);
  const discountPercent = preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;
  const recommendedWhere: Prisma.TourWhereInput = {
    status: "published",
    slug: { not: HIDDEN_TRANSFER_SLUG },
    id: { not: tour.id }
  };
  if (applyPreferences) {
    recommendedWhere.departureDestination = {
      is: {
        ...(preferredCountries.length ? { country: { slug: { in: preferredCountries } } } : {}),
        ...(preferredDestinations.length ? { slug: { in: preferredDestinations } } : {})
      }
    };
  }

  const recommendedTours = shuffleArray(
    await prisma.tour.findMany({
      where: recommendedWhere,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        heroImage: true,
        duration: true,
        location: true
      }
    })
  ).slice(0, 3);

  const adminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const fallbackItinerary =
    (tour.description ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [timePart, ...descParts] = line.split(" - ");
        return {
          time: timePart ?? `Parada ${index + 1}`,
          title: descParts[0] ?? line,
          description: descParts.slice(1).join(" - ") || undefined
        };
      }) ?? [];
  const finalItinerary = adminItinerary.length ? adminItinerary : fallbackItinerary;
  const timelineStops: TimelineStop[] = finalItinerary.map((stop) => ({
    label: stop.title,
    description: stop.description,
    duration: stop.time
  }));

  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/?text=Hola%20Proactivitis";
  const orderCode = booking.bookingCode ?? `#PR-${booking.id.slice(-4).toUpperCase()}`;
  const travelDateLabel = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(booking.travelDate);
  const passengerLabel = `${booking.paxAdults + booking.paxChildren} pax`;
  const startTimeLabel = booking.startTime ?? "Hora por confirmar";

  return {
    booking,
    tour,
    supplier,
    recommendedTours,
    timelineStops,
    whatsappLink,
    summary,
    travelDateLabel,
    passengerLabel,
    startTimeLabel,
    orderCode,
    discountPercent
  };
}
