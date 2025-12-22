import Link from "next/link";
import { BookingConfirmedContent } from "./BookingConfirmedContent";
import { getBookingConfirmationData } from "./helpers";

type Props = {
  searchParams?: {
    bookingId?: string;
    bookingCode?: string;
  };
};

const BookingMissingMessage = ({ bookingId }: { bookingId?: string }) => (
  <div className="min-h-screen bg-slate-50">
    <main className="mx-auto max-w-4xl px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Reserva no encontrada</p>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">No encontramos tu e-ticket</h1>
      <p className="mt-4 text-sm text-slate-600">
        {bookingId
          ? "La reserva no está disponible en este momento. Si pagaste, espera unos segundos y vuelve a intentarlo."
          : "Necesitamos identificador de reserva para mostrarte el comprobante."}
      </p>
      <div className="mt-8 flex flex-center justify-center gap-4">
        <Link
          href="/tours"
          className="rounded-full border border-slate-900 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
        >
          Volver a tours
        </Link>
        <Link
          href="/"
          className="rounded-full border border-transparent bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  </div>
);

export default async function BookingConfirmedRedirectPage({ searchParams }: Props) {
  const bookingId =
    (typeof searchParams?.bookingId === "string" && searchParams.bookingId) ||
    (typeof searchParams?.bookingCode === "string" && searchParams.bookingCode) ||
    null;

  if (!bookingId) {
    return <BookingMissingMessage />;
  }

  const confirmationData = await getBookingConfirmationData(bookingId);
  if (!confirmationData) {
    return <BookingMissingMessage bookingId={bookingId} />;
  }

  return <BookingConfirmedContent {...confirmationData} />;
}
