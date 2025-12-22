import Link from "next/link";
import { cookies } from "next/headers";
import { BookingConfirmedContent } from "./BookingConfirmedContent";
import { getBookingConfirmationData } from "./helpers";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const normalizeSearchParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

export const dynamic = "force-dynamic";

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
  const resolvedSearchParams = (await searchParams) ?? {};
  const queryBookingId = normalizeSearchParam(resolvedSearchParams.bookingId);
  const queryBookingCode = normalizeSearchParam(resolvedSearchParams.bookingCode);
  const cookieBookingId = (await cookies()).get("bookingId")?.value ?? null;
  const bookingId = queryBookingId ?? queryBookingCode ?? cookieBookingId ?? null;

  if (!bookingId) {
    return <BookingMissingMessage />;
  }

  const confirmationData = await getBookingConfirmationData(bookingId);
  if (!confirmationData) {
    return <BookingMissingMessage bookingId={bookingId} />;
  }

  return <BookingConfirmedContent {...confirmationData} />;
}
