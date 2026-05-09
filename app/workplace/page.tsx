import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Car,
  Headphones,
  KeyRound,
  MessageSquareText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  type LucideIcon
} from "lucide-react";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { getWorkplaceContext, workplacePermissions } from "@/lib/workplace";

export const metadata = {
  title: "Workplace | Proactivitis"
};

const modules: Array<{ key: string; label: string; href: string; helper: string; icon: LucideIcon; accent: string }> = [
  { key: "chat.view", label: "Chat interno", href: "/workplace/chat", helper: "Conversaciones corporativas por departamento, menciones y soporte global.", icon: MessageSquareText, accent: "from-cyan-300/25 to-sky-400/10 text-cyan-100" },
  { key: "chat.respond", label: "Asistencia", href: "/workplace/support", helper: "Responder clientes, consultar reservas y escalar casos a departamentos.", icon: Headphones, accent: "from-emerald-300/25 to-teal-400/10 text-emerald-100" },
  { key: "prodiscovery.view", label: "ProDiscovery", href: "/workplace/prodiscovery", helper: "Solicitudes privadas de grupos, propuesta, deposito y guia lider.", icon: Sparkles, accent: "from-emerald-300/25 to-cyan-400/10 text-emerald-100" },
  { key: "tours.view", label: "Tours", href: "/workplace/tours", helper: "Editor de experiencias por zona, proveedor y nicho.", icon: ShoppingBag, accent: "from-violet-300/25 to-fuchsia-400/10 text-violet-100" },
  { key: "bookings.view", label: "Reservas", href: "/workplace/bookings", helper: "Reservas asignadas al alcance operativo.", icon: BriefcaseBusiness, accent: "from-amber-300/25 to-orange-400/10 text-amber-100" },
  { key: "rent_car.view", label: "Rent Car", href: "/workplace/rent-car", helper: "Flota y reservas de vehiculos por mercado.", icon: Car, accent: "from-blue-300/25 to-cyan-400/10 text-blue-100" },
  { key: "suppliers.view", label: "Suplidores", href: "/workplace/suppliers", helper: "Soporte y revision de proveedores permitidos.", icon: Building2, accent: "from-lime-300/25 to-emerald-400/10 text-lime-100" },
  { key: "reports.view", label: "Reportes", href: "/workplace/reports", helper: "Metricas internas segun permisos.", icon: BarChart3, accent: "from-rose-300/25 to-red-400/10 text-rose-100" }
];

export default async function WorkplaceHomePage() {
  const context = await getWorkplaceContext();
  if (!context?.user) redirect("/auth/login?callbackUrl=/workplace");

  if (
    !context.isAdmin &&
    (!context.employee ||
      context.employee.status !== "APPROVED" ||
      (context.employee.accessExpiresAt && context.employee.accessExpiresAt < new Date()))
  ) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/10 p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-200">Workplace</p>
          <h1 className="mt-3 text-4xl font-black">Tu acceso interno esta pendiente.</h1>
          <p className="mt-3 text-sm text-slate-300">
            Un administrador debe aprobar tu cuenta y asignarte un rol antes de entrar al sistema operativo interno.
          </p>
        </section>
      </main>
    );
  }

  const visibleModules = modules.filter((module) => context.permissions.has(module.key));
  const permissionLabels = workplacePermissions
    .filter((permission) => context.permissions.has(permission.key))
    .map((permission) => permission.label);

  return (
    <WorkplaceShell
      active="home"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Workplace"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="mx-auto max-w-6xl space-y-7">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-200">Proactivitis Workplace</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight">Centro interno de trabajo.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Solo veras los modulos, zonas, proveedores y acciones que tu rol permite. Las acciones sensibles quedan
            sujetas a aprobacion administrativa y auditoria.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Acceso</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200">
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-3xl font-black text-white">Activo</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Permisos</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
                <KeyRound className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-3xl font-black text-white">{permissionLabels.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Codigo</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-300/10 text-amber-200">
                <BriefcaseBusiness className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-3xl font-black text-white">{context.employee?.employeeCode ?? "ADMIN"}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleModules.length ? (
            visibleModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.href} href={module.href} className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${module.accent}`}>
                    <Icon className="h-6 w-6 transition group-hover:scale-110" aria-hidden />
                  </span>
                  <p className="mt-4 text-lg font-black text-white">{module.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{module.helper}</p>
                </Link>
              );
            })
          ) : (
            <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-100">
              Tu cuenta esta aprobada, pero aun no tiene permisos operativos.
            </div>
          )}
        </section>
      </div>
    </WorkplaceShell>
  );
}
