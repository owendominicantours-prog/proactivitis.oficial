"use client";

import { useState, useTransition } from "react";

type Props = {
  name?: string;
  initialUrl?: string | null;
};

export default function WorkplaceAvatarUploader({ name = "avatarUrl", initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleFile = (file?: File | null) => {
    if (!file) return;
    setError("");
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/workplace/upload-avatar", { method: "POST", body });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) {
        setError(payload?.error ?? "No se pudo subir la foto.");
        return;
      }
      setUrl(String(payload.url));
    });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-3xl border border-white/10 bg-cyan-400/10">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl font-black text-cyan-200">P</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="inline-flex cursor-pointer rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950">
            {isPending ? "Subiendo..." : "Subir foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={isPending}
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Esta foto aparece en respuestas internas para que el equipo sepa quien responde.
          </p>
          {error ? <p className="mt-2 text-xs font-bold text-rose-200">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
