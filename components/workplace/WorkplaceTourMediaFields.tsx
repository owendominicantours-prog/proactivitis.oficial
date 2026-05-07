"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Props = {
  heroImage?: string | null;
  gallery?: string | null;
  disabled?: boolean;
};

const parseGallery = (value?: string | null) =>
  String(value ?? "")
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  if (!response.ok) throw new Error("No se pudo subir la imagen.");
  const data = (await response.json()) as { url?: string };
  if (!data.url) throw new Error("La subida no devolvio URL.");
  return data.url;
}

export default function WorkplaceTourMediaFields({ heroImage, gallery, disabled }: Props) {
  const [hero, setHero] = useState(heroImage ?? "");
  const [items, setItems] = useState(() => parseGallery(gallery));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const galleryValue = useMemo(() => items.join("\n"), [items]);

  const handleHeroUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setHero(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadImage(file));
      }
      setItems((prev) => Array.from(new Set([...prev, ...uploaded])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron subir las fotos.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <input type="hidden" name="heroImage" value={hero} />
      <input type="hidden" name="gallery" value={galleryValue} />

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div
            className="h-28 w-full rounded-2xl bg-slate-800 bg-cover bg-center ring-1 ring-white/10 md:w-44"
            style={hero ? { backgroundImage: `url("${hero}")` } : undefined}
          />
          <div className="flex-1">
            <p className="text-sm font-black text-white">Foto principal</p>
            <p className="mt-1 text-xs text-slate-400">El proveedor vera la actualizacion como hecha por el equipo administrativo.</p>
            <label className="mt-3 inline-flex cursor-pointer rounded-2xl border border-cyan-300/30 px-4 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/10">
              Subir foto principal
              <input disabled={disabled || uploading} type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-white">Galeria del tour</p>
            <p className="mt-1 text-xs text-slate-400">{items.length} fotos cargadas. Puedes borrar cualquier foto sin tocar el tour completo.</p>
          </div>
          <label className="cursor-pointer rounded-2xl border border-cyan-300/30 px-4 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/10">
            Subir fotos
            <input disabled={disabled || uploading} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((url) => (
            <div key={url} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url("${url}")` }} />
              <button
                disabled={disabled}
                type="button"
                onClick={() => setItems((prev) => prev.filter((item) => item !== url))}
                className="w-full px-3 py-2 text-left text-xs font-black text-rose-200 hover:bg-rose-400/10 disabled:opacity-40"
              >
                Borrar foto
              </button>
            </div>
          ))}
        </div>

        {uploading ? <p className="mt-3 text-xs font-bold text-cyan-100">Subiendo imagen...</p> : null}
        {error ? <p className="mt-3 text-xs font-bold text-rose-200">{error}</p> : null}
      </div>
    </div>
  );
}
