import Link from "next/link";
import { TrustBadges } from "@/components/shared/TrustBadges";

export const Footer = () => (
  <footer className="w-full border-t border-slate-200 bg-white/80 py-8">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p>© {new Date().getFullYear()} Owen Dominicanproactivitis Limited</p>
        <TrustBadges locale="es" compact />
      </div>
      <div className="flex gap-4">
        <Link href="/privacy" className="hover:text-brand">
          Privacidad
        </Link>
        <Link href="/terms" className="hover:text-brand">
          Términos
        </Link>
      </div>
    </div>
  </footer>
);
