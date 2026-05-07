export const dynamic = "force-dynamic";

import { Prisma } from "@prisma/client";
import { Building2, CheckCircle2, Filter, PackageCheck } from "lucide-react";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { prisma } from "@/lib/prisma";
import { requireWorkplaceContext } from "@/lib/workplace";
import { containsInsensitive, formatScopeLine, isGlobalScope, uniqueScopeItems } from "@/lib/workplaceFilters";
import { buildWorkplaceTourWhere } from "@/lib/workplaceTours";
import { requestSupplierDisableApprovalAction } from "./actions";

type SearchParams = {
  q?: string;
  status?: string;
  approval?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const statusClass = (active: boolean) =>
  active ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-amber-400/20 bg-amber-400/10 text-amber-100";

export default async function WorkplaceSuppliersPage({ searchParams }: Props) {
  const context = await requireWorkplaceContext("suppliers.view");
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const and: Prisma.SupplierProfileWhereInput[] = [];

  const companyTerms = uniqueScopeItems(context.scope.companies);
  if (!isGlobalScope(companyTerms)) {
    and.push({ OR: companyTerms.map((term) => ({ company: containsInsensitive(term) })) });
  }

  const tourWhere = buildWorkplaceTourWhere({
    ...context.scope,
    niches: context.scope.niches.length ? context.scope.niches : ["tours"],
    modules: context.scope.modules.length ? context.scope.modules : ["tours"]
  });
  and.push({ Tour: { some: tourWhere } });

  if (params.q) {
    const q = params.q.trim();
    and.push({
      OR: [
        { company: containsInsensitive(q) },
        { User: { email: containsInsensitive(q) } },
        { Tour: { some: { title: containsInsensitive(q) } } }
      ]
    });
  }
  if (params.status === "approved") and.push({ approved: true });
  if (params.status === "pending") and.push({ approved: false });

  const where = and.length ? { AND: and } satisfies Prisma.SupplierProfileWhereInput : {};
  const [rows, total, approved, productsEnabled] = await Promise.all([
    prisma.supplierProfile.findMany({
      where,
      include: {
        User: { select: { name: true, email: true, accountStatus: true } },
        _count: { select: { Tour: true, drafts: true } }
      },
      orderBy: { company: "asc" },
      take: 120
    }),
    prisma.supplierProfile.count({ where }),
    prisma.supplierProfile.count({ where: { AND: [where, { approved: true }] } }),
    prisma.supplierProfile.count({ where: { AND: [where, { productsEnabled: true }] } })
  ]);

  return (
    <WorkplaceShell
      active="suppliers"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Soporte a suplidores"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="space-y-7 pb-10">
        <section>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/15 text-lime-100">
            <Building2 className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-xs font-bold text-slate-400">Inicio / Suplidores</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Suplidores</h1>
          <p className="mt-2 text-sm text-slate-400">Soporte operativo para proveedores dentro de tu alcance.</p>
        </section>

        {params.approval === "sent" ? (
          <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 px-5 py-4 text-sm font-bold text-amber-100">
            Esta accion requiere aprobacion de un administrador. La solicitud quedo registrada.
          </div>
        ) : null}

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-5">
          <p className="font-black text-white">Estas viendo suplidores de: <span className="text-cyan-200">{formatScopeLine(context.scope)}</span></p>
        </section>

        <form action="/workplace/suppliers" className="grid gap-3 md:grid-cols-[1fr,0.45fr,auto]">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar suplidor, email o tour..." className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
          <select name="status" defaultValue={params.status ?? "all"} className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white">
            <option value="all">Todos</option>
            <option value="approved">Aprobados</option>
            <option value="pending">Pendientes</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white">
            <Filter className="h-4 w-4" aria-hidden />
            <span>Filtrar</span>
          </button>
        </form>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Suplidores", value: total, Icon: Building2 },
            { label: "Aprobados", value: approved, Icon: CheckCircle2 },
            { label: "Productos activos", value: productsEnabled, Icon: PackageCheck }
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-400">{label}</p>
                <Icon className="h-5 w-5 text-cyan-200" aria-hidden />
              </div>
              <p className="mt-3 text-3xl font-black text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Suplidor</th>
                  <th className="px-5 py-4">Contacto</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Tours</th>
                  <th className="px-5 py-4">Borradores</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.length ? rows.map((supplier) => (
                  <tr key={supplier.id} className="text-slate-200">
                    <td className="px-5 py-4 font-black text-white">{supplier.company}</td>
                    <td className="px-5 py-4">
                      <p>{supplier.User.name ?? "Sin nombre"}</p>
                      <p className="text-xs text-slate-400">{supplier.User.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(supplier.approved)}`}>
                        {supplier.approved ? "Aprobado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{supplier._count.Tour}</td>
                    <td className="px-5 py-4">{supplier._count.drafts}</td>
                    <td className="px-5 py-4">
                      <form action={requestSupplierDisableApprovalAction}>
                        <input type="hidden" name="supplierId" value={supplier.id} />
                        <button className="rounded-xl border border-amber-300/30 px-3 py-2 text-xs font-black text-amber-100 hover:bg-amber-300/10">
                          Solicitar desactivar
                        </button>
                      </form>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">No hay suplidores dentro de tu alcance.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WorkplaceShell>
  );
}
