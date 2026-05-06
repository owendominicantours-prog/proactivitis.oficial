import Eticket from "@/components/booking/Eticket";
import type { BookingConfirmationData } from "./helpers";

export default function BookingConfirmedEticket({
  booking,
  tour,
  supplier,
  agency,
  orderCode
}: BookingConfirmationData) {
  return (
    <Eticket
      booking={{
        id: booking.id,
        travelDate: booking.travelDate,
        startTime: booking.startTime,
        flowType: booking.flowType,
        totalAmount: booking.totalAmount,
        paxAdults: booking.paxAdults,
        paxChildren: booking.paxChildren,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        pickupNotes: booking.pickupNotes,
        hotel: booking.hotel,
        originAirport: booking.originAirport,
        flightNumber: booking.flightNumber,
        tripType: booking.tripType,
        returnTravelDate: booking.returnTravelDate,
        returnStartTime: booking.returnStartTime,
        agencyName: agency?.name ?? null,
        agencyPhone: agency?.phone ?? null
      }}
      tour={{
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        heroImage: tour.heroImage,
        meetingPoint: tour.meetingPoint,
        meetingInstructions: tour.meetingInstructions,
        duration: tour.duration,
        language: tour.language
      }}
      supplierName={supplier?.name}
      orderCode={orderCode}
    />
  );
}
