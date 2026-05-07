import { redirect } from "next/navigation";

import WorkplaceAvatarUploader from "@/components/workplace/WorkplaceAvatarUploader";
import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import { getWorkplaceContext } from "@/lib/workplace";
import { updateWorkplaceProfileAction } from "./actions";

export const metadata = {
  title: "Mi perfil | Workplace"
};

export default async function WorkplaceProfilePage() {
  const context = await getWorkplaceContext();
  if (!context?.user) redirect("/auth/login?callbackUrl=/workplace/profile");

  return (
    <WorkplaceShell
      active="profile"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Workplace"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-200">Perfil interno</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Identidad de trabajo.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            La foto, departamento y cargo se muestran en el chat corporativo para que cada respuesta tenga contexto real.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.8fr,1.2fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Cuenta</p>
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="text-slate-400">Nombre:</span> <strong>{context.user.name ?? "Equipo Proactivitis"}</strong></p>
              <p><span className="text-slate-400">Email:</span> <strong>{context.user.email}</strong></p>
              <p><span className="text-slate-400">Departamento:</span> <strong>{context.employee?.department?.name ?? "Administracion"}</strong></p>
              <p><span className="text-slate-400">Cargo:</span> <strong>{context.employee?.jobTitle ?? (context.isAdmin ? "Super Admin" : "Pendiente")}</strong></p>
            </div>
          </article>

          {context.employee ? (
            <form action={updateWorkplaceProfileAction} className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
              <WorkplaceAvatarUploader initialUrl={context.employee.avatarUrl} />
              <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950">
                Guardar perfil
              </button>
            </form>
          ) : (
            <article className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-5 text-sm text-cyan-50">
              Tu cuenta admin responde como Administracion Proactivitis. Los empleados operativos pueden subir foto laboral aqui.
            </article>
          )}
        </section>
      </div>
    </WorkplaceShell>
  );
}
