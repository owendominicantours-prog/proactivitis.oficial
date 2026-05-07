import Link from "next/link";
import Image from "next/image";

const menu = [
  { label: "Dashboard", href: "/agency" },
  { label: "Tours / Catálogo", href: "/agency/tours" },
  { label: "Reservas", href: "/agency/bookings" },
  { label: "Calendario", href: "/agency/calendar" },
  { label: "Comisiones", href: "/agency/commissions" },
  { label: "Reportes", href: "/agency/reports" },
  { label: "Sub-agentes", href: "/agency/agents" },
  { label: "Mini-sitio", href: "/agency/minisite" },
  { label: "Promocodes", href: "/agency/promocodes" },
  { label: "Notificaciones", href: "/agency/notifications" },
  { label: "Perfil & Configuración", href: "/agency/profile" }
];

export const AgencySidebar = () => (
  <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/95 p-6 text-white shadow-xl">
    <Link href="/agency" className="mb-10 inline-flex rounded-2xl bg-white px-4 py-3">
      <Image src="/logo.png" alt="Proactivitis" width={170} height={50} className="h-9 w-auto object-contain" />
    </Link>
    <nav className="space-y-2 text-sm">
      {menu.map((item) => (
        <Link key={item.label} href={item.href} className="block rounded-2xl px-4 py-2 transition hover:bg-slate-800">
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>
);
