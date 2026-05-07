import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Workplace | Proactivitis"
};

export default async function WorkplaceHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/workplace");

  const employee = await prisma.workplaceEmployee.findUnique({
    where: { userId: session.user.id },
    include: {
      department: true,
      roles: { include: { role: true } }
    }
  });

  if (!employee) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/10 p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-200">Workplace</p>
          <h1 className="mt-3 text-4xl font-black">No tienes perfil interno.</h1>
          <p className="mt-3 text-sm text-slate-300">Solicita acceso como empleado para que un administrador apruebe tu cuenta.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-200">Proactivitis Workplace</p>
          <h1 className="mt-3 text-4xl font-black">Hola, {session.user.name ?? "equipo"}.</h1>
          <p className="mt-3 text-sm text-slate-300">
            Estado: <strong>{employee.status}</strong> - Departamento: {employee.department?.name ?? "sin asignar"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-950">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Acceso</p>
            <p className="mt-2 text-2xl font-black">{employee.status === "APPROVED" ? "Activo" : "Pendiente"}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-950">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Roles</p>
            <p className="mt-2 text-2xl font-black">{employee.roles.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-950">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Codigo</p>
            <p className="mt-2 text-2xl font-black">{employee.employeeCode ?? "N/A"}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950">
          <h2 className="text-2xl font-black">Permisos asignados</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {employee.roles.length ? (
              employee.roles.map((assignment) => (
                <span key={assignment.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {assignment.role.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">Todavia no tienes roles asignados.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
