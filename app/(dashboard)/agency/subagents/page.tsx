import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteAgencyProLink } from "./actions";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

export default async function AgencySubagentsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tus enlaces.</div>;
  }

  const links = await prisma.agencyProLink.findMany({
    where: { agencyUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 24,
    include: {
      Tour: {
        select: {
          title: true,
          slug: true,
          price: true
        }
      },
      Booking: {
        select: {
          id: true
        }
      }
    }
  });

  const totalBookings = links.reduce((sum, link) => sum + link.Booking.length, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">AgencyPro</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Enlaces comerciales</h1>
        <p className="mt-2 text-sm text-slate-600">
          Gestiona los enlaces AgencyPro que ya creaste, revisa su precio final y elimina los que no quieras seguir usando.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Links activos</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{links.filter((link) => link.active).length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas generadas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalBookings}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total de enlaces</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{links.length}</p>
        </article>
      </section>

      <section className="space-y-3">
        {links.length ? (
          links.map((link) => (
            <article key={link.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{link.Tour?.title ?? "Tour"}</h2>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {link.active ? "Activo" : "Pausado"}
                    </span>
                  </div>
                  <p className="mt-2 break-all text-sm text-slate-500">
                    Link:{" "}
                    <a
                      href={`https://proactivitis.com/agency-pro/${link.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-sky-700 underline"
                    >
                      {link.slug}
                    </a>
                  </p>
                  {link.note ? <p className="mt-3 text-sm text-slate-600">{link.note}</p> : null}
                </div>

                <div className="grid min-w-[260px] gap-3 sm:grid-cols-3 lg:w-[360px]">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Precio final</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(link.price)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Base web</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrency(link.Tour?.price ?? link.basePrice)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Reservas</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{link.Booking.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`https://proactivitis.com/agency-pro/${link.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 hover:border-slate-300"
                >
                  Abrir enlace
                </a>
                {link.Tour?.slug ? (
                  <Link
                    href={`/tours/${link.Tour.slug}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 hover:border-slate-300"
                  >
                    Ver tour base
                  </Link>
                ) : null}
                <form action={deleteAgencyProLink}>
                  <input type="hidden" name="linkId" value={link.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-700 hover:border-rose-300 hover:bg-rose-100"
                  >
                    Eliminar link
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
            No tienes enlaces AgencyPro creados todavía. Genera uno desde el catálogo de tours para empezar a vender con tu propio precio.
          </div>
        )}
      </section>
    </div>
  );
}
