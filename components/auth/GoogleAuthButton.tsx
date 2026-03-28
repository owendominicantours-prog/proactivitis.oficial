"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

type GoogleAuthButtonProps = {
  label?: string;
  callbackUrl?: string;
  className?: string;
};

export default function GoogleAuthButton({
  label = "Continuar con Google",
  callbackUrl = "/portal",
  className = ""
}: GoogleAuthButtonProps) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProviders = async () => {
      try {
        const response = await fetch("/api/auth/providers");
        if (!response.ok) return;
        const providers = (await response.json()) as Record<string, unknown>;
        if (active) {
          setAvailable(Boolean(providers.google));
        }
      } catch {
        if (active) {
          setAvailable(false);
        }
      }
    };

    void loadProviders();

    return () => {
      active = false;
    };
  }, []);

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        await signIn("google", { callbackUrl });
      }}
      className={
        className ||
        "flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
      }
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.2 2.9-7.1 0-.7-.1-1.4-.2-2H12Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H3.4v2.5A10 10 0 0 0 12 22Z"
        />
        <path
          fill="#4A90E2"
          d="M6.6 14.1A6 6 0 0 1 6.3 12c0-.7.1-1.4.3-2.1V7.4H3.4A10 10 0 0 0 2 12c0 1.6.4 3.2 1.4 4.6l3.2-2.5Z"
        />
        <path
          fill="#FBBC05"
          d="M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0 0 3.4 7.4l3.2 2.5c.8-2.3 2.9-4 5.4-4Z"
        />
      </svg>
      {loading ? "Conectando..." : label}
    </button>
  );
}
