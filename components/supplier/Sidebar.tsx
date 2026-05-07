import Link from "next/link";
import Image from "next/image";

const menu = [
  { label: "Dashboard", href: "/supplier", icon: "dashboard" },
  { label: "Oportunidades", href: "/supplier-tour-opportunities", icon: "tour" },
  { label: "Mis Tours", href: "/supplier/tours", icon: "tour" },
  { label: "Crear Tour", href: "/supplier/tours/create", icon: "add" },
  { label: "Alojamientos", href: "/supplier/properties", icon: "hotel" },
  { label: "Reservas", href: "/supplier/bookings", icon: "calendar" },
  { label: "Calendario", href: "/supplier/calendar", icon: "calendar" },
  { label: "Finanzas", href: "/supplier/finance", icon: "finance" },
  { label: "Payouts", href: "/supplier/payouts", icon: "payout" },
  { label: "Ofertas & Promos", href: "/supplier/offers", icon: "discount" },
  { label: "Mini-sitios", href: "/supplier/minisites", icon: "globe" },
  { label: "Notificaciones", href: "/supplier/notifications", icon: "bell" },
  { label: "Perfil & Configuración", href: "/supplier/profile", icon: "settings" }
];

export const SupplierSidebar = () => (
  <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950/95 p-6 text-white shadow-xl">
    <Link href="/supplier" className="mb-10 inline-flex rounded-2xl bg-white px-4 py-3">
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
