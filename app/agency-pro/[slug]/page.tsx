import Link from "next/link";
import { notFound } from "next/navigation";
import { findAgencyProLinkBySlug } from "@/lib/agencyPro";

export const dynamic = "force-dynamic";

export default async function AgencyProLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const link = await findAgencyProLinkBySlug(resolvedParams.slug);
  if (!link || !link.active) {
    return notFound();
  }

  const tour = link.Tour;
  const agency = link.AgencyUser;
  const agencyName = agency.AgencyProfile?.companyName ?? agency.name ?? "Tu agencia";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Oferta exclusiva</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">{tour.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{tour.subtitle ?? tour.description}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right text-lg font-semibold text-slate-900">
              <span className="text-sm uppercase tracking-[0.3em] text-slate-500">Precio especial</span>
              <span className="text-2xl text-sky-600">${link.price.toFixed(2)}</span>
              <span className="text-xs text-slate-500">Listado oficial: ${link.basePrice.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Agencia</p>
              <p className="text-sm font-semibold text-slate-900">{agencyName}</p>
              <p className="text-xs text-slate-500">ID {agency.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Markup de agencia</p>
              <p className="text-sm font-semibold text-slate-900">${link.markup.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Link</p>
              <p className="text-sm text-sky-600 underline">{link.slug}</p>
            </div>
          </div>
          {link.note && (
            <p className="mt-4 rounded-2xl border border-slate-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
              {link.note}
            </p>
          )}
          <div className="mt-6">
            <Link
              href={`/tours/${tour.slug}?agencyLink=${link.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-500"
            >
              Reservar con {agencyName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
