import Link from "next/link";
import { PartnerApplication } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { approveApplication, rejectApplication, ensureSupplierProfileAction } from "./actions";

type SearchParams = {
  q?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const statusBadgeColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const formatServiceTypes = (value: string | null) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

export default async function PartnerApplicationsPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();

  const applications: PartnerApplication[] = await prisma.partnerApplication.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }
  });

  const rows = query
    ? applications.filter((application) =>
        [application.companyName, application.contactName, application.email, application.country]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      )
    : applications;

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Solicitudes</p>
        <h1 className="text-3xl font-semibold text-slate-900">Registro de suplidores y agencias</h1>
        <p className="text-sm text-slate-600">Revisa documentacion y aprueba en minutos con vista compacta.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pendientes</p><p className="mt-2 text-3xl font-semibold text-slate-900">{applications.length}</p></article>
        <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-indigo-700">Filtradas</p><p className="mt-2 text-3xl font-semibold text-indigo-900">{rows.length}</p></article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-sky-700">Accion</p><p className="mt-2 text-sm font-semibold text-sky-900">Aprobar, rechazar o crear perfil</p></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col text-sm text-slate-600 md:col-span-2">
            Buscar solicitud
            <input name="q" defaultValue={params.q ?? ""} placeholder="Empresa, contacto, email, pais" className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
        </form>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No hay solicitudes pendientes para este filtro.</p>
        ) : (
          rows.map((application) => (
            <article key={application.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{application.companyName}</p>
                  <p className="text-sm text-slate-600">{application.contactName} | {application.contactRole}</p>
                  <p className="text-sm text-slate-600">{application.email} | {application.phone}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 font-semibold ${statusBadgeColor(application.status)}`}>{application.status}</span>
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600">{new Date(application.createdAt).toLocaleDateString("es-ES")}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Servicios</p>
                  <p>{formatServiceTypes(application.serviceTypes).join(", ") || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pais</p>
                  <p>{application.country || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Website</p>
                  {application.website ? (
                    <Link href={application.website} className="text-sky-700 hover:underline">{application.website}</Link>
                  ) : (
                    <p>No especificado</p>
                  )}
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-700">{application.description}</div>

              {application.documentUrl && (
                <div className="mt-3 text-sm">
                  <Link href={application.documentUrl} className="text-sky-700 hover:underline">{application.documentName ?? "Ver documento"}</Link>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <form action={approveApplication} method="post">
                  <input type="hidden" name="applicationId" value={application.id} />
                  <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500">Aprobar</button>
                </form>
                <form action={rejectApplication} method="post">
                  <input type="hidden" name="applicationId" value={application.id} />
                  <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-500">Rechazar</button>
                </form>
                <form action={ensureSupplierProfileAction} method="post">
                  <input type="hidden" name="applicationId" value={application.id} />
                  <button type="submit" className="rounded-lg border border-sky-300 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50">Asignar perfil</button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
