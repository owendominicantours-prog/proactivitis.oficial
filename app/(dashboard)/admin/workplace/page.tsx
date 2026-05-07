export const dynamic = "force-dynamic";

import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { sensitiveWorkplaceActions, workplaceModules, workplacePermissions } from "@/lib/workplace";
import {
  createWorkplaceApprovalRequestAction,
  createWorkplaceDepartmentAction,
  createWorkplaceEmployeeAction,
  createWorkplaceRoleAction,
  decideWorkplaceApprovalRequestAction,
  seedWorkplaceDefaultsAction,
  toggleWorkplaceDepartmentAction,
  updateWorkplaceEmployeeRolesAction,
  updateWorkplaceEmployeeStatusAction
} from "./actions";

const statusStyles: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-800",
  SUSPENDED: "bg-rose-100 text-rose-800",
  REJECTED: "bg-slate-200 text-slate-700"
};

const formatDate = (value?: Date | null) =>
  value
    ? new Intl.DateTimeFormat("es-DO", { dateStyle: "medium", timeStyle: "short" }).format(value)
    : "Sin fecha";

const formatJsonList = (value: unknown) => {
  if (!Array.isArray(value) || value.length === 0) return "Global";
  return value.map(String).join(", ");
};

export default async function AdminWorkplacePage() {
  const [departments, roles, employees, approvals, logs] = await Promise.all([
    prisma.workplaceDepartment.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: { _count: { select: { employees: true, roles: true } } }
    }),
    prisma.workplaceRole.findMany({
      orderBy: [{ active: "desc" }, { level: "desc" }, { name: "asc" }],
      include: { department: true, _count: { select: { assignments: true } } }
    }),
    prisma.workplaceEmployee.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        user: { select: { id: true, name: true, email: true, accountStatus: true } },
        department: true,
        roles: { include: { role: true }, orderBy: { createdAt: "desc" } }
      },
      take: 80
    }),
    prisma.workplaceApprovalRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { employee: { include: { user: { select: { name: true, email: true } } } } },
      take: 40
    }),
    prisma.workplaceAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { employee: { include: { user: { select: { name: true, email: true } } } } },
      take: 30
    })
  ]);

  const approvedEmployees = employees.filter((employee) => employee.status === "APPROVED").length;
  const pendingEmployees = employees.filter((employee) => employee.status === "PENDING").length;
  const pendingApprovals = approvals.filter((approval) => approval.status === "PENDING").length;

  return (
    <div className="space-y-8 pb-12">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr,0.7fr] lg:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-200">Admin Workplace</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight lg:text-5xl">
              Sistema interno de empleados, permisos y auditoria global.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
              Controla empleados internos sin mezclarlos con clientes, suplidores o agencias. La base usa roles dinamicos,
              permisos granulares, alcance por mercado y aprobaciones para acciones sensibles.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action={seedWorkplaceDefaultsAction}>
                <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300">
                  Instalar base recomendada
                </button>
              </form>
              <Link
                href="/workplace/register"
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Registro de empleado
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Empleados aprobados", approvedEmployees],
              ["Pendientes", pendingEmployees],
              ["Roles activos", roles.filter((role) => role.active).length],
              ["Aprobaciones", pendingApprovals]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">{label}</p>
                <p className="mt-2 text-3xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Empleados</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Cuentas internas</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{employees.length} registros</span>
          </div>

          <div className="mt-5 space-y-3">
            {employees.length ? (
              employees.map((employee) => (
                <div key={employee.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                        {employee.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={employee.avatarUrl} alt={employee.user.name ?? "Empleado"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-sm font-black text-slate-600">
                            {(employee.user.name ?? "P").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-950">{employee.user.name ?? "Empleado sin nombre"}</p>
                        <p className="text-sm text-slate-600">{employee.user.email}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          {employee.jobTitle ?? "Sin cargo"} - {employee.department?.name ?? "Sin departamento"}
                        </p>
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${statusStyles[employee.status] ?? statusStyles.PENDING}`}>
                      {employee.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                    <p><strong>Paises:</strong> {formatJsonList(employee.countryScope)}</p>
                    <p><strong>Ciudades:</strong> {formatJsonList(employee.cityScope)}</p>
                    <p><strong>Nichos:</strong> {formatJsonList(employee.nicheScope)}</p>
                    <p><strong>Productos:</strong> {formatJsonList(employee.productScope)}</p>
                    <p><strong>Empresas:</strong> {formatJsonList(employee.companyScope)}</p>
                    <p><strong>Modulos:</strong> {formatJsonList(employee.moduleScope)}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {employee.roles.length ? (
                      employee.roles.map((assignment) => (
                        <span key={assignment.id} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                          {assignment.role.name}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Sin rol asignado</span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[0.8fr,1.2fr]">
                    <form action={updateWorkplaceEmployeeStatusAction} className="grid gap-2 sm:grid-cols-[1fr,auto]">
                      <input type="hidden" name="employeeId" value={employee.id} />
                      <select name="status" defaultValue={employee.status} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        <option value="PENDING">Pendiente</option>
                        <option value="APPROVED">Aprobado</option>
                        <option value="SUSPENDED">Suspendido</option>
                        <option value="REJECTED">Rechazado</option>
                      </select>
                      <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Guardar</button>
                    </form>
                    <form action={updateWorkplaceEmployeeRolesAction} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <input type="hidden" name="employeeId" value={employee.id} />
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Roles del perfil</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {roles.map((role) => (
                          <label key={role.id} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              name="roleIds"
                              value={role.id}
                              defaultChecked={employee.roles.some((assignment) => assignment.roleId === role.id)}
                              className="mt-0.5"
                            />
                            <span>
                              <strong className="block text-slate-900">{role.name}</strong>
                              <span>{role.department?.name ?? "Global"} - nivel {role.level}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      <button className="mt-3 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800">
                        Guardar roles
                      </button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-3xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                Todavia no hay empleados internos. Instala la base recomendada y crea el primer empleado.
              </p>
            )}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Nuevo empleado</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Alta interna</h2>
            <form action={createWorkplaceEmployeeAction} className="mt-5 grid gap-3">
              <input name="name" placeholder="Nombre completo" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="email" type="email" placeholder="correo@empresa.com" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="jobTitle" placeholder="Cargo: Supervisor de operaciones" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="tempPassword" placeholder="Password temporal opcional" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <div className="grid gap-3 md:grid-cols-2">
                <select name="departmentId" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <option value="">Departamento</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
                <select name="roleId" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <option value="">Rol inicial</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <textarea name="countryScope" placeholder="Paises: RD, Mexico, Colombia" className="min-h-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <textarea name="cityScope" placeholder="Ciudades: Punta Cana, Santo Domingo" className="min-h-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <textarea name="nicheScope" placeholder="Nichos: tours, rent car, hoteles" className="min-h-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <textarea name="companyScope" placeholder="Empresas/suplidores permitidos" className="min-h-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </div>
              <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950">Crear empleado pendiente</button>
            </form>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Departamentos</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Areas internas</h2>
            <form action={createWorkplaceDepartmentAction} className="mt-5 grid gap-3">
              <input name="name" placeholder="Nombre del departamento" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <textarea name="description" placeholder="Responsabilidad principal" className="min-h-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Guardar departamento</button>
            </form>
            <div className="mt-5 space-y-2">
              {departments.map((department) => (
                <div key={department.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="font-bold text-slate-900">{department.name}</p>
                    <p className="text-xs text-slate-500">{department._count.employees} empleados - {department._count.roles} roles</p>
                  </div>
                  <form action={toggleWorkplaceDepartmentAction}>
                    <input type="hidden" name="departmentId" value={department.id} />
                    <input type="hidden" name="active" value={department.active ? "false" : "true"} />
                    <button className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">
                      {department.active ? "Pausar" : "Activar"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Roles dinamicos</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Crear o actualizar rol</h2>
          <form action={createWorkplaceRoleAction} className="mt-5 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input name="name" placeholder="Nombre del rol" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="level" type="number" min="1" max="100" placeholder="Nivel jerarquico" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            </div>
            <select name="departmentId" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              <option value="">Sin departamento fijo</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
            <textarea name="description" placeholder="Descripcion del rol" className="min-h-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <div className="grid gap-3 sm:grid-cols-2">
              {workplacePermissions.map((permission) => (
                <label key={permission.key} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <input type="checkbox" name="permissions" value={permission.key} className="mt-1" />
                  <span>
                    <strong className="block text-slate-900">{permission.label}</strong>
                    <span className="text-xs text-slate-500">{permission.module}{"sensitive" in permission && permission.sensitive ? " - sensible" : ""}</span>
                  </span>
                </label>
              ))}
            </div>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Guardar rol</button>
          </form>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Matriz</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Roles existentes</h2>
          <div className="mt-5 grid gap-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{role.name}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Nivel {role.level} - {role.department?.name ?? "Global"} - {role._count.assignments} asignaciones
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${role.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                    {role.active ? "Activo" : "Pausado"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.isArray(role.permissions) ? (
                    role.permissions.map((permission) => (
                      <span key={String(permission)} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        {String(permission)}
                      </span>
                    ))
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Acciones sensibles</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Cola de aprobacion</h2>
          <form action={createWorkplaceApprovalRequestAction} className="mt-5 grid gap-3">
            <input name="title" placeholder="Titulo de la solicitud" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="actionKey" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                {sensitiveWorkplaceActions.map((action) => (
                  <option key={action.key} value={action.key}>{action.label}</option>
                ))}
              </select>
              <select name="moduleKey" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                {workplaceModules.map((module) => (
                  <option key={module.key} value={module.key}>{module.label}</option>
                ))}
              </select>
            </div>
            <select name="employeeId" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              <option value="">Solicitud del sistema/admin</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.user.name ?? employee.user.email}</option>
              ))}
            </select>
            <textarea name="description" placeholder="Motivo, riesgo y efecto esperado" className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <button className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950">Crear solicitud sensible</button>
          </form>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Decision</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Pendientes y resueltas</h2>
          <div className="mt-5 space-y-3">
            {approvals.map((approval) => (
              <div key={approval.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{approval.title}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      {approval.actionKey} - {approval.moduleKey ?? "global"} - {formatDate(approval.createdAt)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{approval.description ?? "Sin descripcion."}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[approval.status] ?? statusStyles.PENDING}`}>
                    {approval.status}
                  </span>
                </div>
                {approval.status === "PENDING" ? (
                  <form action={decideWorkplaceApprovalRequestAction} className="mt-4 grid gap-2 md:grid-cols-[1fr,auto,auto]">
                    <input type="hidden" name="requestId" value={approval.id} />
                    <input name="decisionNote" placeholder="Nota de decision" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm" />
                    <button name="decision" value="APPROVED" className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-black text-white">Aprobar</button>
                    <button name="decision" value="REJECTED" className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-black text-white">Rechazar</button>
                  </form>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">Decision: {approval.decisionNote ?? "Sin nota"} - {formatDate(approval.decidedAt)}</p>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Auditoria</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Ultimos movimientos</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Todo queda registrado</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Accion</th>
                <th className="px-4 py-3 text-left">Modulo</th>
                <th className="px-4 py-3 text-left">Empleado</th>
                <th className="px-4 py-3 text-left">Recurso</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{log.actionKey}</td>
                  <td className="px-4 py-3">{log.moduleKey ?? "global"}</td>
                  <td className="px-4 py-3">{log.employee?.user.name ?? log.employee?.user.email ?? log.actorUserId ?? "Sistema"}</td>
                  <td className="px-4 py-3">{log.resourceType ?? "-"} {log.resourceId ? `- ${log.resourceId}` : ""}</td>
                </tr>
              ))}
              {!logs.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Aun no hay eventos de auditoria.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
