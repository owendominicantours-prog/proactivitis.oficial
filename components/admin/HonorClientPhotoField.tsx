"use client";

import { useState } from "react";

type HonorClientPhotoFieldProps = {
  name?: string;
  defaultValue?: string | null;
};

export default function HonorClientPhotoField({ name = "photoUrl", defaultValue = "" }: HonorClientPhotoFieldProps) {
  const [photoUrl, setPhotoUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("kind", "honor-client");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) {
        throw new Error("No se pudo subir la imagen.");
      }

      setPhotoUrl(String(payload.url));
    } catch (uploadError) {
      console.error(uploadError);
      setError("Error subiendo imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={photoUrl} />
      <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Foto de perfil</label>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="https://..."
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
        />
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
          {uploading ? "Subiendo..." : "Subir foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {photoUrl ? (
        <div className="h-20 w-20 overflow-hidden rounded-full border border-amber-200 bg-slate-900/90">
          <img src={photoUrl} alt="Preview cliente honor" className="h-full w-full object-cover" />
        </div>
      ) : null}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
