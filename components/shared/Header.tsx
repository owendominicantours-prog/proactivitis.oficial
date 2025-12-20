import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

type HeaderProps = {
  navItems: { label: string; href: string }[];
  rightSlot?: ReactNode;
  logoScale?: number;
};

export const Header = ({ navItems, rightSlot, logoScale = 2.5 }: HeaderProps) => (
  <header className="border-b bg-white shadow-sm">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center overflow-visible">
          <Image
            src="/logo.png"
            alt="Proactivitis"
            width={200}
            height={60}
            className="h-12 w-auto object-contain origin-left"
            style={{ transform: `scale(${logoScale / 2})`, transformOrigin: "left" }}
          />
        </Link>

      <div className="flex items-center gap-8 text-sm text-slate-700">
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
        {rightSlot}
      </div>
    </div>
  </header>
);
