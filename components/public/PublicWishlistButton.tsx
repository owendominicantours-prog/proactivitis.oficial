"use client";

export function PublicWishlistButton() {
  return (
    <button
      type="button"
      aria-label="Ver favoritos"
      className="relative rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
    >
      ❤️ Favoritos
      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500" />
    </button>
  );
}
