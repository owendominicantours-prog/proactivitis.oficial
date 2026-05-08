export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Headphones } from "lucide-react";

import SupportDeskClient from "@/components/workplace/SupportDeskClient";
import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { prisma } from "@/lib/prisma";
import { getWorkplaceContext } from "@/lib/workplace";
import { isSupportSupervisor } from "@/lib/supportDesk";

type Props = {
  searchParams?: Promise<{ conversationId?: string }>;
};

export const metadata = {
  title: "Asistencia | Workplace"
};

export default async function WorkplaceSupportPage({ searchParams }: Props) {
  const context = await getWorkplaceContext();
  if (!context?.user) redirect("/auth/login?callbackUrl=/workplace/support");
  if (!context.isAdmin && !context.permissions.has("chat.respond")) redirect("/workplace");

  const params = (searchParams ? await searchParams : undefined) ?? {};
  const departments = await prisma.workplaceDepartment.findMany({
    where: { active: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" }
  });
  const employees = await prisma.workplaceEmployee.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      departmentId: true,
      jobTitle: true,
      user: { select: { name: true, email: true } }
    },
    orderBy: [{ department: { name: "asc" } }, { user: { name: "asc" } }],
    take: 160
  });
  const canSupervisor = isSupportSupervisor(context);

  return (
    <WorkplaceShell
      active="support"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Asistencia"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="space-y-6 pb-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-100">
            <Headphones className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-200">Asistencia publica</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Support Desk de clientes.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            Responde chats de la web, vincula reservas por codigo, consulta datos operativos seguros y escala casos
            tecnicos a departamentos sin perder el historial con el cliente.
          </p>
        </section>

        <SupportDeskClient
          departments={departments}
          employees={employees.map((employee) => ({
            id: employee.id,
            departmentId: employee.departmentId,
            name: employee.user.name ?? employee.user.email ?? "Empleado",
            email: employee.user.email,
            jobTitle: employee.jobTitle
          }))}
          canSupervisor={canSupervisor}
          initialConversationId={params.conversationId ?? null}
        />
      </div>
    </WorkplaceShell>
  );
}
