import Eticket from "@/components/booking/Eticket";
import { getRentCarOptions } from "@/data/rentCarFleet";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";
import type { BookingConfirmationData } from "./helpers";

export default async function BookingConfirmedEticket({
  booking,
  tour,
  supplier,
  agency,
  orderCode
}: BookingConfirmationData) {
  const isRentCar = booking.flowType === "rent_car";
  let rentCarImage: string | null = null;
  let rentCarTitle: string | null = null;

  if (isRentCar) {
    const settings = await getRentCarFleetSettings();
    const vehicleId = (booking as any).transferVehicleId as string | null | undefined;
    const airportLabel = booking.originAirport as string | null | undefined;
    const options = getRentCarOptions(undefined, settings);
    const option = options.find((item) => {
      if (item.categorySlug !== vehicleId) return false;
      if (airportLabel && item.airportLabel !== airportLabel) return false;
      return true;
    }) ?? options.find((item) => item.categorySlug === vehicleId);

    rentCarImage = option?.image ?? null;
    rentCarTitle = (booking as any).transferVehicleName ?? option?.model ?? null;
  }

  return (
    <Eticket
      booking={{
        id: booking.id,
        travelDate: booking.travelDate,
        startTime: booking.startTime,
        flowType: booking.flowType,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        vehicleName: (booking as any).transferVehicleName,
        vehicleCategory: (booking as any).transferVehicleCategory,
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
        title: rentCarTitle ?? tour.title,
        heroImage: rentCarImage ?? tour.heroImage,
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
