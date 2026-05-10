import Image from "next/image";
import Link from "next/link";

const menu = [
  { label: "Dashboard", href: "/dashboard/customer" },
  { label: "Mis reservas", href: "/dashboard/customer" },
  { label: "Notificaciones", href: "/customer/notifications" },
  { label: "Perfil", href: "/customer/profile" },
  { label: "Pagos / Facturacion", href: "/customer/payments" },
  { label: "Preferencias", href: "/customer/preferences" }
];

export const CustomerSidebar = () => (
  <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col bg-white px-4 py-6 text-sm text-slate-700 shadow-xl lg:flex">
    <Link href="/dashboard/customer" className="mb-8 inline-flex rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
      <Image src="/logo.png" alt="Proactivitis" width={150} height={45} className="h-8 w-auto object-contain" />
    </Link>
    <div className="space-y-2">
      {menu.map((item) => (
        <Link key={item.label} href={item.href} className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100">
          {item.label}
        </Link>
      ))}
    </div>
  </aside>
);
