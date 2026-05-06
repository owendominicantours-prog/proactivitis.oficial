"use client";

import { useEffect, useRef, useState } from "react";

type RentCarVehicleImageFieldProps = {
  name?: string;
  defaultValue?: string;
  vehicleSlug?: string;
};

export default function RentCarVehicleImageField({
  name = "image",
  defaultValue = "",
  vehicleSlug = "rent-car"
}: RentCarVehicleImageFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const uploadFile = async (file?: File | null) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplierId", "admin");
      formData.append("tourId", vehicleSlug);
      formData.append("kind", "rent-car-vehicle");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("No se pudo subir la foto.");
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("La subida no devolvio una URL valida.");
      }

      setValue(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Error subiendo la foto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {value ? (
          <img src={value} alt="Foto del vehiculo" className="h-32 w-full object-contain p-3" />
        ) : (
          <div className="flex h-32 items-center justify-center px-4 text-center text-xs font-bold text-slate-500">
            Sube una foto real del vehiculo
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Subiendo..." : value ? "Cambiar foto" : "Subir foto"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600 transition hover:border-red-200 hover:text-red-700"
          >
            Quitar
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => void uploadFile(event.target.files?.[0])}
      />

      {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p> : null}
      {value ? <p className="break-all text-[11px] font-semibold text-slate-400">{value}</p> : null}
    </div>
  );
}
