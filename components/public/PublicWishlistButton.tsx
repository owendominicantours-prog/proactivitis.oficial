"use client";

export function PublicWishlistButton() {
  return (
    <button
      type="button"
      aria-label="Favoritos"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
    >
      ❤️
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
    </button>
  );
}
