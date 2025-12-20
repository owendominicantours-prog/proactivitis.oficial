import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

type HeaderProps = {
  navItems: { label: string; href: string }[];
  navDisplay?: "inline" | "dropdown";
  rightSlot?: ReactNode;
  logoScale?: number;
};

export const Header = ({ navItems, navDisplay = "inline", rightSlot, logoScale = 2.5 }: HeaderProps) => (
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
        {navDisplay === "inline" ? (
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
        ) : (
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50">
              Menú
              <span className="text-base leading-4">▾</span>
            </button>
            <div className="pointer-events-auto invisible absolute left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white opacity-0 shadow-lg transition duration-150 group-hover:visible group-hover:opacity-100">
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        {rightSlot}
      </div>
    </div>
  </header>
);
