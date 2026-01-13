"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type BlobItem = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
};

type BlogCoverPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function BlogCoverPicker({ value, onChange }: BlogCoverPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasValue = Boolean(value);
  const previewUrl = hasValue ? value : "/fototours/fotosimple.jpg";

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blob/list?prefix=tours/&limit=200");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "No se pudo cargar la galeria.");
      }
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando galeria.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void fetchItems();
    }
  }, [open]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "blog");
    setLoading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "No se pudo subir la imagen.");
      }
      const data = await res.json();
      if (data.url) {
        onChange(String(data.url));
        await fetchItems();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo imagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleUpload(file);
    event.target.value = "";
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image src={previewUrl} alt="Cover" fill className="object-cover" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50"
            >
              Elegir de galeria
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-800"
            >
              Subir imagen
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700"
          />
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </div>
      </div>

      {open ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Galeria</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Cerrar
            </button>
          </div>
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Cargando...</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sortedItems.map((item) => (
                <button
                  key={item.pathname}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    setOpen(false);
                  }}
                  className="group relative h-28 overflow-hidden rounded-xl border border-slate-200"
                >
                  <Image src={item.url} alt={item.pathname} fill className="object-cover" />
                  <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
