"use server";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerPaymentMethod from "@/components/customer/CustomerPaymentMethod";

export default async function CustomerProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Debes iniciar sesión</p>
          <p className="mt-2 text-sm text-slate-600">Accede para ver y editar tu perfil.</p>
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { Booking: true }
  });
  const payment = user
    ? await prisma.customerPayment.findUnique({
        where: { userId: user.id }
      })
    : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Usuario no encontrado</p>
          <p className="mt-2 text-sm text-slate-600">Contacta soporte para reactivar tu cuenta.</p>
        </div>
      </div>
    );
  }

  const completed = user.Booking.filter((booking) => booking.status === "COMPLETED").length;
  const upcoming = user.Booking.filter((booking) => booking.status === "CONFIRMED").length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Mi perfil</h1>
          <p className="text-sm text-slate-500">Tu información personal y métricas de viaje.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Nombre</p>
            <p className="text-lg font-semibold text-slate-900">{user.name ?? "Sin nombre"}</p>
            <p className="text-sm text-slate-600">Email: {user.email}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas confirmadas</p>
            <p className="text-3xl font-semibold text-slate-900">{upcoming}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Experiencias completadas</p>
            <p className="text-3xl font-semibold text-slate-900">{completed}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Preferencias</h2>
            <Link
              href="/customer/preferences"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 hover:underline"
            >
              Editar
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-600">Mantén tu perfil actualizado para recibir recomendaciones personalizadas.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <CustomerPaymentMethod initialPayment={payment} title="Metodo de pago seguro" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs uppercase tracking-[0.3em] text-slate-500">Soporte</h3>
          <p className="mt-2 text-sm text-slate-600">
            Si necesitas asistencia personalizada, responda este correo para que el equipo que te acompaña pueda ayudarte.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-900">soporte@proactivitis.com</p>
        </section>
      </div>
    </div>
  );
}
