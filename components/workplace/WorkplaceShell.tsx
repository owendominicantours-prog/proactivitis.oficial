import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Car,
  Headphones,
  Home,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  MessageSquareText,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { getWorkplaceContext } from "@/lib/workplace";
import {
  WorkplaceHeaderNotifications,
  WorkplaceNavNotificationBadge
} from "@/components/workplace/WorkplaceLiveNotifications";
import {
  emptyWorkplaceNotificationSummary,
  getWorkplaceNotificationSummary
} from "@/lib/workplaceNotifications";

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

const navItems: Array<{ label: string; href: string; key: string; permission: string | null; icon: LucideIcon }> = [
  { label: "Inicio", href: "/workplace", key: "home", permission: null, icon: Home },
  { label: "Chat", href: "/workplace/chat", key: "chat", permission: "chat.view", icon: MessageSquareText },
  { label: "Asistencia", href: "/workplace/support", key: "support", permission: "chat.respond", icon: Headphones },
  { label: "ProDiscovery", href: "/workplace/prodiscovery", key: "prodiscovery", permission: "prodiscovery.view", icon: Sparkles },
  { label: "Reservas", href: "/workplace/bookings", key: "bookings", permission: "bookings.view", icon: BriefcaseBusiness },
  { label: "Tours", href: "/workplace/tours", key: "tours", permission: "tours.view", icon: ShoppingBag },
  { label: "Transfer", href: "/workplace/transfers", key: "transfers", permission: "transfers.view", icon: Plane },
  { label: "Rent Car", href: "/workplace/rent-car", key: "rent_car", permission: "rent_car.view", icon: Car },
  { label: "Suplidores", href: "/workplace/suppliers", key: "suppliers", permission: "suppliers.view", icon: Building2 },
  { label: "Reportes", href: "/workplace/reports", key: "reports", permission: "reports.view", icon: BarChart3 }
];

const shortScope = (items: string[], fallback: string) => (items.length ? items.slice(0, 3).join(", ") : fallback);
type PermissionLabel = { label: string; icon: LucideIcon };

export default async function WorkplaceShell({ children, active, employeeName, department, permissions, scope }: Props) {
  const notificationContext = await getWorkplaceContext();
  const notifications = notificationContext?.user
    ? await getWorkplaceNotificationSummary(notificationContext)
    : emptyWorkplaceNotificationSummary;
  const visibleNav = navItems.filter((item) => !item.permission || permissions.has(item.permission));
  const activePermissionLabels = [
    permissions.has("tours.view") ? { label: "Ver tours", icon: ShoppingBag } : null,
    permissions.has("tours.edit") ? { label: "Editar tours", icon: KeyRound } : null,
    permissions.has("tours.media") ? { label: "Gestionar fotos", icon: ImageIcon } : null,
    permissions.has("prodiscovery.view") ? { label: "Ver ProDiscovery", icon: Sparkles } : null,
    permissions.has("prodiscovery.manage") ? { label: "Trabajar propuestas", icon: KeyRound } : null,
    permissions.has("bookings.view") ? { label: "Ver reservas", icon: BriefcaseBusiness } : null,
    permissions.has("rent_car.view") ? { label: "Ver rent car", icon: Car } : null,
    permissions.has("suppliers.view") ? { label: "Ver suplidores", icon: Building2 } : null,
    permissions.has("chat.view") ? { label: "Ver chat", icon: MessageSquareText } : null,
    permissions.has("chat.respond") ? { label: "Responder chat", icon: Headphones } : null
  ].filter((item): item is PermissionLabel => Boolean(item));

  return (
    <main className="min-h-screen bg-[#071120] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#081324] p-5 lg:block">
        <Link href="/workplace" className="block">
          <span className="inline-flex rounded-[22px] border border-white/10 bg-white px-4 py-3 shadow-lg shadow-cyan-950/30">
            <Image src="/logo.png" alt="Proactivitis" width={180} height={54} className="h-10 w-auto object-contain" priority />
          </span>
          <span className="mt-3 block text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">Workplace</span>
        </Link>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/15 text-cyan-200">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs text-slate-400">Mi area de trabajo</p>
              <p className="mt-1 font-black">{department ?? "Area pendiente"}</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active === item.key ? "bg-cyan-400/15 text-cyan-100 shadow-lg shadow-cyan-950/20" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${active === item.key ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-cyan-200"}`}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">{item.label}</span>
              {item.key === "chat" || item.key === "support" || item.key === "prodiscovery" ? (
                <WorkplaceNavNotificationBadge kind={item.key} initial={notifications} />
              ) : null}
            </Link>
          );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-xs text-slate-400">Permisos activos</p>
            <div className="mt-3 space-y-2">
              {activePermissionLabels.length ? (
                activePermissionLabels.map((item) => {
                  const Icon = item.icon ?? ShieldCheck;
                  return (
                  <p key={item.label} className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
                    <span>{item.label}</span>
                  </p>
                );
                })
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
          <Link href="/api/auth/signout" className="flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 px-4 py-3 text-center text-sm font-bold text-rose-200">
            <LogOut className="h-4 w-4" aria-hidden />
            <span>Cerrar sesion</span>
          </Link>
        </div>
      </aside>

      <section className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#071120]/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <Link href="/workplace" className="inline-flex rounded-2xl bg-white px-3 py-2">
                <Image src="/logo.png" alt="Proactivitis" width={138} height={42} className="h-7 w-auto object-contain" />
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <WorkplaceHeaderNotifications initial={notifications} />
            <div className="text-right">
              <Link href="/workplace/profile" className="block rounded-2xl px-3 py-2 transition hover:bg-white/5">
                <p className="font-black">{employeeName ?? "Equipo Proactivitis"}</p>
                <p className="text-xs text-slate-400">{department ?? "Workplace"}</p>
              </Link>
            </div>
            </div>
          </div>
        </header>
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </section>
    </main>
  );
}
