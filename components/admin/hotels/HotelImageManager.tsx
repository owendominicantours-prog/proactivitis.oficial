"use client";

import { useMemo, useRef, useState } from "react";

type BlobItem = {
  url: string;
  pathname: string;
  uploadedAt: string;
};

type HotelImageManagerProps = {
  heroValue?: string;
  galleryValues?: string[];
};

const splitLines = (value: string) =>
  value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

export default function HotelImageManager({ heroValue = "", galleryValues = [] }: HotelImageManagerProps) {
  const [heroImage, setHeroImage] = useState(heroValue);
  const [gallery, setGallery] = useState<string[]>(galleryValues.filter(Boolean));
  const [manualGallery, setManualGallery] = useState(galleryValues.join("\n"));
  const [manualHero, setManualHero] = useState(heroValue);
  const [items, setItems] = useState<BlobItem[]>([]);
  const [openLibrary, setOpenLibrary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedGallery = useMemo(() => {
    const fromManual = splitLines(manualGallery);
    return Array.from(new Set([...gallery, ...fromManual]));
  }, [gallery, manualGallery]);

  const refreshLibrary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blob/list?prefix=tours/&limit=200");
      if (!res.ok) throw new Error("No se pudo cargar la galeria.");
      const data = await res.json();
      const fetched = (data.items ?? []) as BlobItem[];
      const sorted = [...fetched].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
      setItems(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando galeria.");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, kind: "hotel-hero" | "hotel-gallery") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("No se pudo subir la imagen.");
      const data = await res.json();
      return String(data.url ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo imagen.");
      return "";
    } finally {
      setLoading(false);
    }
  };

  const onUploadHero = async (file?: File | null) => {
    if (!file) return;
    const url = await uploadFile(file, "hotel-hero");
    if (!url) return;
    setHeroImage(url);
    setManualHero(url);
  };

  const onUploadGallery = async (files?: FileList | null) => {
    if (!files?.length) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, "hotel-gallery");
      if (url) uploaded.push(url);
    }
    if (!uploaded.length) return;
    setGallery((prev) => Array.from(new Set([...prev, ...uploaded])));
    setManualGallery((prev) => `${prev}${prev.trim() ? "\n" : ""}${uploaded.join("\n")}`);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="heroImage" value={manualHero.trim() || heroImage.trim()} />
      <textarea readOnly className="hidden" name="galleryImages" value={normalizedGallery.join("\n")} />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Foto principal</p>
          <div className="mt-3 h-36 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {heroImage ? (
              <img src={heroImage} alt="Hero hotel" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">Sin imagen</div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => heroInputRef.current?.click()}
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Subir hero
            </button>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void onUploadHero(event.target.files?.[0])}
            />
          </div>
          <input
            value={manualHero}
            onChange={(event) => {
              const value = event.target.value;
              setManualHero(value);
              setHeroImage(value.trim());
            }}
            placeholder="https://.../hero.jpg"
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Galeria</p>
          <div className="mt-3 grid max-h-36 grid-cols-4 gap-2 overflow-y-auto">
            {normalizedGallery.map((url) => (
              <div key={url} className="relative h-16 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                <img src={url} alt="Gallery" className="h-full w-full object-cover" />
              </div>
            ))}
            {!normalizedGallery.length ? (
              <div className="col-span-4 flex h-16 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-500">
                Sin fotos de galeria
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Subir galeria
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => void onUploadGallery(event.target.files)}
            />
            <button
              type="button"
              onClick={async () => {
                setOpenLibrary((prev) => !prev);
                if (!openLibrary) await refreshLibrary();
              }}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
            >
              Biblioteca
            </button>
          </div>
          <textarea
            value={manualGallery}
            onChange={(event) => setManualGallery(event.target.value)}
            rows={4}
            placeholder="URLs de galeria, una por linea"
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {openLibrary ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Biblioteca de imagenes</p>
          {loading ? <p className="mt-2 text-sm text-slate-500">Cargando...</p> : null}
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-3 grid max-h-64 grid-cols-2 gap-3 overflow-y-auto md:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.pathname}
                type="button"
                onClick={() => {
                  setGallery((prev) => Array.from(new Set([...prev, item.url])));
                  setManualGallery((prev) => `${prev}${prev.trim() ? "\n" : ""}${item.url}`);
                }}
                className="group relative h-24 overflow-hidden rounded-lg border border-slate-200"
              >
                <img src={item.url} alt={item.pathname} className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

