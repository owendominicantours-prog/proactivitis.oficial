import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  active: string;
  employeeName?: string | null;
  department?: string | null;
  permissions: Set<string>;
  scope: {
    countries: string[];
    cities: string[];
    niches: string[];
    products: string[];
    companies: string[];
    modules: string[];
  };
};

const navItems = [
  { label: "Inicio", href: "/workplace", key: "home", permission: null },
  { label: "Chat", href: "/workplace/chat", key: "chat", permission: "chat.view" },
  { label: "Asistencia", href: "/workplace/support", key: "support", permission: "chat.respond" },
  { label: "Reservas", href: "/workplace/bookings", key: "bookings", permission: "bookings.view" },
  { label: "Tours", href: "/workplace/tours", key: "tours", permission: "tours.view" },
  { label: "Transfer", href: "/workplace/transfers", key: "transfers", permission: "transfers.view" },
  { label: "Rent Car", href: "/workplace/rent-car", key: "rent_car", permission: "rent_car.view" },
  { label: "Suplidores", href: "/workplace/suppliers", key: "suppliers", permission: "suppliers.view" },
  { label: "Reportes", href: "/workplace/reports", key: "reports", permission: "reports.view" }
];

const shortScope = (items: string[], fallback: string) => (items.length ? items.slice(0, 3).join(", ") : fallback);

export default function WorkplaceShell({ children, active, employeeName, department, permissions, scope }: Props) {
  const visibleNav = navItems.filter((item) => !item.permission || permissions.has(item.permission));
  const activePermissionLabels = [
    permissions.has("tours.view") ? "Ver tours" : null,
    permissions.has("tours.edit") ? "Editar tours" : null,
    permissions.has("tours.media") ? "Gestionar fotos" : null,
    permissions.has("bookings.view") ? "Ver reservas" : null,
    permissions.has("rent_car.view") ? "Ver rent car" : null,
    permissions.has("suppliers.view") ? "Ver suplidores" : null,
    permissions.has("chat.view") ? "Ver chat" : null,
    permissions.has("chat.respond") ? "Responder chat" : null
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#071120] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#081324] p-5 lg:block">
        <Link href="/workplace" className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-xl font-black text-slate-950">P</div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em]">Proactivitis</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">Workplace</p>
          </div>
        </Link>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Mi area de trabajo</p>
          <p className="mt-1 font-black">{department ?? "Area pendiente"}</p>
        </div>

        <nav className="mt-8 space-y-2">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active === item.key ? "bg-cyan-400/15 text-cyan-200" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-xs text-slate-400">Permisos activos</p>
            <div className="mt-3 space-y-2">
              {activePermissionLabels.length ? (
                activePermissionLabels.map((label) => (
                  <p key={String(label)} className="text-xs font-bold text-slate-200">
                    <span className="mr-2 text-cyan-300">+</span>{label}
                  </p>
                ))
              ) : (
                <p className="text-xs text-slate-400">Sin permisos operativos.</p>
              )}
            </div>
            <div className="mt-4 space-y-1 text-xs text-slate-300">
              <p>Zona: {shortScope(scope.cities, "Global")}</p>
              <p>Nicho: {shortScope(scope.niches, "Global")}</p>
              <p>Proveedor: {shortScope(scope.companies, "Global")}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="block rounded-2xl border border-rose-400/30 px-4 py-3 text-center text-sm font-bold text-rose-200">
            Cerrar sesion
          </Link>
        </div>
      </aside>

      <section className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#071120]/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <p className="text-sm font-black uppercase tracking-[0.18em]">Proactivitis</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">Workplace</p>
            </div>
            <div className="ml-auto text-right">
              <Link href="/workplace/profile" className="block rounded-2xl px-3 py-2 transition hover:bg-white/5">
                <p className="font-black">{employeeName ?? "Equipo Proactivitis"}</p>
                <p className="text-xs text-slate-400">{department ?? "Workplace"}</p>
              </Link>
            </div>
          </div>
        </header>
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </section>
    </main>
  );
}
