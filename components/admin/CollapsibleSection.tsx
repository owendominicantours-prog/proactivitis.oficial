"use client";

import { ReactNode, useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: string;
  children: ReactNode;
};

export default function CollapsibleSection({
  title,
  description,
  defaultOpen = true,
  badge,
  children
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{title}</p>
            {badge && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold text-slate-600">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 underline-offset-4 transition hover:text-slate-900"
        >
          {open ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      <div className={`${open ? "block" : "hidden"} space-y-6`}>{children}</div>
    </section>
  );
}
