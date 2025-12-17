"use server";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerPaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Debes iniciar sesión</p>
          <p className="mt-2 text-sm text-slate-600">Accede para ver tus pagos.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }]
    },
    select: {
      id: true,
      travelDate: true,
      totalAmount: true,
      status: true,
      Tour: {
        select: {
          title: true
        }
      }
    },
    orderBy: { travelDate: "desc" }
  });

  const totalPaid = bookings.reduce((sum, booking) => sum + (booking.status === "CANCELLED" ? 0 : booking.totalAmount), 0);
  const payment = await prisma.customerPayment.findUnique({
    where: { userId: session.user.id ?? "" }
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Pagos</h1>
          <p className="text-sm text-slate-500">Revisa tus compras y totales con claridad.</p>
        </header>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total pagado</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">${totalPaid.toFixed(2)}</p>
          <p className="text-sm text-slate-500">Consideramos solo reservas confirmadas o completadas.</p>
          {payment && (
            <p className="mt-2 text-sm text-slate-500">
              Método guardado: {payment.brand ?? "Desconocido"} • **** {payment.last4 ?? "0000"}
            </p>
          )}
        </section>
        <section className="space-y-4">
          {bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              Todavía no hay pagos registrados. Realiza una reserva para verlo aquí.
            </div>
          )}
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{booking.Tour?.title ?? "Tour"}</p>
                  <h2 className="text-lg font-semibold text-slate-900">${booking.totalAmount.toFixed(2)}</h2>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {booking.travelDate.toLocaleDateString("es-DO")}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Estado: {booking.status}. <Link href={`/customer/reservations/${booking.id}`} className="text-sky-600 underline">Ver detalles</Link>
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
