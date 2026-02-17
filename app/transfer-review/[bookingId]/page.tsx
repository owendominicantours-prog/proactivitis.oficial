import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TransferReviewForm from "@/components/public/TransferReviewForm";

type PageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function TransferReviewPage({ params }: PageProps) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      flowType: true,
      customerName: true,
      customerEmail: true,
      travelDate: true,
      Tour: {
        select: {
          title: true
        }
      },
      TransferReviews: {
        select: { id: true },
        take: 1
      }
    }
  });

  if (!booking || (booking.flowType ?? "").toLowerCase() !== "transfer") {
    notFound();
  }

  const hasReview = booking.TransferReviews.length > 0;
  const travelDateLabel = new Intl.DateTimeFormat("es-DO", {
    dateStyle: "long",
    timeZone: "America/Santo_Domingo"
  }).format(booking.travelDate);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resena de traslado</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{booking.Tour.title}</h1>
          <p className="mt-2 text-sm text-slate-600">Fecha del servicio: {travelDateLabel}</p>
        </section>

        {hasReview ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 shadow-sm">
            <h2 className="text-xl font-semibold">Ya recibimos tu resena</h2>
            <p className="mt-2 text-sm">
              Gracias por compartir tu experiencia. Nuestro equipo la revisara antes de publicarla.
            </p>
            <Link href="/" className="mt-4 inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
              Volver al inicio
            </Link>
          </section>
        ) : (
          <TransferReviewForm
            bookingId={booking.id}
            defaultName={booking.customerName}
            defaultEmail={booking.customerEmail}
          />
        )}
      </div>
    </main>
  );
}
