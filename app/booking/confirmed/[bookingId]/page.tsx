import { notFound } from "next/navigation";
import { BookingConfirmedContent } from "../BookingConfirmedContent";
import { getBookingConfirmationData } from "../helpers";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    bookingId?: string;
  };
  searchParams: {
    session_id?: string;
    bookingId?: string;
    nxtPbookingId?: string;
  };
};

export default async function BookingConfirmedPage({ params, searchParams }: Props) {
  const bookingId = params.bookingId ?? searchParams.bookingId ?? searchParams.nxtPbookingId;
  if (!bookingId) {
    notFound();
  }

  const confirmationData = await getBookingConfirmationData(bookingId);
  if (!confirmationData) {
    notFound();
  }

  return <BookingConfirmedContent {...confirmationData} />;
}
