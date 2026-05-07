import Link from "next/link";

import { submitWorkplaceApplicationAction } from "./actions";

type Props = {
  searchParams?: Promise<{ submitted?: string }>;
};

export const metadata = {
  title: "Registro Workplace | Proactivitis"
};

export default async function WorkplaceRegisterPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const submitted = params.submitted === "1";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur lg:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-200">Admin Workplace</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-5xl">Registro interno de empleados</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Esta entrada es solo para personal autorizado de Proactivitis. La cuenta queda pendiente hasta que un Super Admin
            apruebe el acceso, departamento, alcance y permisos.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-slate-200">
            <p className="rounded-2xl border border-white/10 bg-white/10 p-4">Acceso separado de clientes, suplidores y agencias.</p>
            <p className="rounded-2xl border border-white/10 bg-white/10 p-4">Permisos por pais, ciudad, nicho, modulo y accion.</p>
            <p className="rounded-2xl border border-white/10 bg-white/10 p-4">Todas las acciones internas quedan auditadas.</p>
          </div>
          <Link href="/" className="mt-6 inline-flex rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
            Volver a Proactivitis
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl lg:p-8">
          {submitted ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-700">Solicitud enviada</p>
              <h2 className="mt-2 text-3xl font-black">Tu cuenta queda pendiente.</h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-900">
                Un administrador revisara tu perfil y asignara permisos antes de que puedas entrar al Workplace.
              </p>
              <Link href="/auth/login" className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                Ir al login
              </Link>
            </div>
          ) : (
            <form action={submitWorkplaceApplicationAction} className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">Solicitud de empleado</p>
                <h2 className="mt-2 text-3xl font-black">Datos de acceso</h2>
              </div>
              <input name="name" required placeholder="Nombre completo" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="email" required type="email" placeholder="correo@empresa.com" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="password" required type="password" minLength={8} placeholder="Contrasena de acceso" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <input name="jobTitle" placeholder="Cargo solicitado" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <div className="grid gap-3 md:grid-cols-2">
                <textarea name="countryScope" placeholder="Paises donde trabajaras" className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <textarea name="cityScope" placeholder="Ciudades o zonas" className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </div>
              <textarea name="nicheScope" placeholder="Nichos: tours, rent car, hoteles, soporte..." className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <button className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950">
                Enviar solicitud
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
