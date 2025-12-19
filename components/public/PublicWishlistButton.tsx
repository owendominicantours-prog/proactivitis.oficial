"use client";

export function PublicWishlistButton() {
  return (
    <button
      type="button"
      aria-label="Favoritos"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 21c0 0 6-3.2 6-9.6 0-3.3-2.2-5.4-5.2-5.4-1.5 0-3 .7-3.8 1.8C8.7 7.7 7.2 7 5.7 7 2.7 7 .5 9.1.5 12.4c0 6.4 6 9.6 6 9.6"
        />
      </svg>
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
    </button>
  );
}
