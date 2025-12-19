import { notFound, redirect } from "next/navigation";

type Props = {
  searchParams?: {
    bookingId?: string;
    bookingCode?: string;
  };
};

export default function BookingConfirmedRedirectPage({ searchParams }: Props) {
  const bookingId =
    (typeof searchParams?.bookingId === "string" && searchParams.bookingId) ||
    (typeof searchParams?.bookingCode === "string" && searchParams.bookingCode) ||
    null;

  if (!bookingId) {
    notFound();
  }

  redirect(`/booking/confirmed/${bookingId}`);
}
