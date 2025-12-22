import { notFound } from "next/navigation";
import { BookingConfirmedContent } from "../BookingConfirmedContent";
import { getBookingConfirmationData } from "../helpers";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    bookingId?: string;
  }>;
  searchParams?: Promise<{
    session_id?: string;
    bookingId?: string;
    nxtPbookingId?: string;
  }>;
};

export default async function BookingConfirmedPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const bookingId = resolvedParams.bookingId ?? resolvedSearchParams.bookingId ?? resolvedSearchParams.nxtPbookingId;
  if (!bookingId) {
    notFound();
  }

  const confirmationData = await getBookingConfirmationData(bookingId);
  if (!confirmationData) {
    notFound();
  }

  return <BookingConfirmedContent {...confirmationData} />;
}
