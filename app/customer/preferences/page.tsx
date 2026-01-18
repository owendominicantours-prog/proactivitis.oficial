import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerPreferencesForm } from "@/components/customer/CustomerPreferencesForm";

export default async function CustomerPreferencesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Debes iniciar sesion</p>
          <p className="mt-2 text-sm text-slate-600">Accede para personalizar tus preferencias.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Usuario no encontrado</p>
          <p className="mt-2 text-sm text-slate-600">Contacta soporte para reactivar tu cuenta.</p>
        </div>
      </div>
    );
  }

  const [preference, countries, destinations] = await Promise.all([
    prisma.customerPreference.findUnique({
      where: { userId: user.id },
      select: {
        preferredCountries: true,
        preferredDestinations: true,
        preferredProductTypes: true,
        consentMarketing: true,
        completedAt: true
      }
    }),
    prisma.country.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" }
    }),
    prisma.destination.findMany({
      select: { name: true, slug: true, country: { select: { name: true } } },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preferencias</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Personaliza tu cuenta
          </h1>
          <p className="text-sm text-slate-600">
            Ajusta tus intereses para ver tours y traslados mas relevantes para ti.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <CustomerPreferencesForm
            countries={countries}
            destinations={destinations.map((destination) => ({
              name: destination.name,
              slug: destination.slug,
              country: destination.country.name
            }))}
            initial={
              preference
                ? {
                    preferredCountries: preference.preferredCountries as string[] | undefined,
                    preferredDestinations: preference.preferredDestinations as string[] | undefined,
                    preferredProductTypes: preference.preferredProductTypes as string[] | undefined,
                    consentMarketing: preference.consentMarketing ?? false,
                    completedAt: preference.completedAt?.toISOString()
                  }
                : null
            }
          />
        </section>
      </div>
    </div>
  );
}
