import Link from "next/link";
import Image from "next/image";

const sections = [
  { name: "Dashboard", href: "/admin", icon: "dashboard" },
  { name: "Landings", href: "/admin/landings" },
  { name: "Tours", href: "/admin/tours" },
  { name: "Suplidores", href: "/admin/suppliers" },
  { name: "Agencias", href: "/admin/agencies" },
  { name: "Reservas", href: "/admin/bookings" },
  { name: "Finanzas", href: "/admin/finance" },
  { name: "Reportes", href: "/admin/reports" },
  { name: "CRM", href: "/admin/crm" },
  { name: "Alertas", href: "/admin/alerts" },
  { name: "Usuarios", href: "/admin/users" },
  { name: "Ajustes", href: "/admin/settings" },
  { name: "Developer/Logs", href: "/admin/logs" },
  { name: "IA Tools", href: "/admin/ai" }
];

export const Sidebar = () => (
  <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-900/20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl">
    <Link href="/admin" className="mb-10 inline-flex rounded-2xl bg-white px-4 py-3">
      <Image src="/logo.png" alt="Proactivitis" width={170} height={50} className="h-9 w-auto object-contain" />
    </Link>
    <div className="space-y-2 text-sm">
      {sections.map((section) => (
        <Link
          key={section.name}
          href={section.href}
          className="block rounded-2xl px-4 py-2 font-semibold text-slate-50 transition hover:bg-slate-800/60"
        >
          {section.name}
        </Link>
      ))}
    </div>
  </aside>
);
