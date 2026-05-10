export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import PaymentElementStep from "@/components/booking/PaymentElementStep";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { BookingStatusEnum } from "@/lib/types/booking";

type Props = {
  params: Promise<{ id?: string }>;
};

const paidStatuses = new Set(["paid", "succeeded", "requires_capture"]);
const reusableIntentStatuses = new Set(["requires_payment_method", "requires_confirmation", "requires_action", "processing"]);

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://proactivitis.com").replace(/\/+$/, "");

async function ensurePaymentIntent(booking: Awaited<ReturnType<typeof getOwnedBooking>>) {
  if (!booking) {
    throw new Error("Reserva no encontrada.");
  }

  const stripe = getStripe();
  const currency = (process.env.STRIPE_CURRENCY ?? "usd").toLowerCase();
  const amount = Math.round(booking.totalAmount * 100);

  if (amount <= 0) {
    throw new Error("El monto de esta reserva no permite pago online.");
  }

  if (booking.stripePaymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId).catch(() => null);
    if (existing && paidStatuses.has(existing.status)) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatusEnum.CONFIRMED,
          paymentStatus: existing.status
        }
      });
      revalidatePath("/dashboard/customer");
      revalidatePath(`/dashboard/customer/reservas/${booking.id}`);
      return { alreadyPaid: true as const, clientSecret: null, paymentStatus: existing.status };
    }

    if (existing?.client_secret && reusableIntentStatuses.has(existing.status)) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: existing.status }
      });
      return { alreadyPaid: false as const, clientSecret: existing.client_secret, paymentStatus: existing.status };
    }
  }

  const intent = await stripe.paymentIntents.create({
    amount,
    currency,
    description: `Pago de reserva ${booking.bookingCode ?? booking.id}`,
    metadata: {
      bookingId: booking.id,
      tourId: booking.tourId,
      paymentSource: "customer-dashboard"
    },
    automatic_payment_methods: {
      enabled: true
    }
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      stripePaymentIntentId: intent.id,
      paymentStatus: intent.status,
      paymentMethod: "CARD"
    }
  });

  revalidatePath("/dashboard/customer");
  revalidatePath(`/dashboard/customer/reservas/${booking.id}`);

  if (!intent.client_secret) {
    throw new Error("Stripe no devolvio el formulario de pago.");
  }

  return { alreadyPaid: false as const, clientSecret: intent.client_secret, paymentStatus: intent.status };
}

async function getOwnedBooking(bookingId: string, userId?: string, email?: string | null) {
  const normalizedEmail = email?.toLowerCase();
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        userId ? { userId } : undefined,
        normalizedEmail ? { customerEmail: normalizedEmail } : undefined
      ].filter(Boolean) as any
    },
    include: {
      Tour: {
        select: {
          title: true,
          slug: true,
          heroImage: true
        }
      }
    }
  });
}

export default async function CustomerBookingPaymentPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email && !session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/customer/reservas/${id}/pagar`)}`);
  }

  const booking = await getOwnedBooking(id, session.user.id, session.user.email);
  if (!booking) {
    notFound();
  }

  if (booking.status === BookingStatusEnum.CANCELLED) {
    redirect(`/dashboard/customer/reservas/${booking.id}`);
  }

  let payment:
    | { alreadyPaid: true; clientSecret: null; paymentStatus: string }
    | { alreadyPaid: false; clientSecret: string; paymentStatus: string };
  let paymentError: string | null = null;

  try {
    payment = await ensurePaymentIntent(booking);
  } catch (error) {
    payment = { alreadyPaid: false, clientSecret: "", paymentStatus: booking.paymentStatus ?? "pending" };
    paymentError = error instanceof Error ? error.message : "No se pudo preparar el pago.";
  }

  const baseUrl = getBaseUrl();
  const orderCode = booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase();

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Pago pendiente</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Completar pago</h1>
        <p className="mt-2 text-sm text-slate-600">
          Reserva {orderCode} - {booking.Tour?.title ?? "Servicio Proactivitis"}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">${booking.totalAmount.toFixed(2)} USD</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Estado</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{payment.paymentStatus}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Retorno</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{baseUrl.replace(/^https?:\/\//, "")}</p>
          </div>
        </div>
      </div>

      {payment.alreadyPaid ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          Este pago ya fue confirmado.
          <Link href={`/dashboard/customer/reservas/${booking.id}`} className="ml-2 font-semibold underline">
            Volver a la reserva
          </Link>
        </div>
      ) : paymentError ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          {paymentError}
        </div>
      ) : (
        <PaymentElementStep bookingId={booking.id} clientSecret={payment.clientSecret} amount={booking.totalAmount} />
      )}
    </section>
  );
}
