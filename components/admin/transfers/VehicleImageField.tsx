"use client";

import { useRef, useState } from "react";

type VehicleImageFieldProps = {
  name?: string;
  label?: string;
  defaultValue?: string;
  supplierId?: string;
};

export default function VehicleImageField({
  name = "imageUrl",
  label = "Imagen (URL)",
  defaultValue = "",
  supplierId = "admin"
}: VehicleImageFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploadFile = async (file?: File | null) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplierId", supplierId);
      formData.append("kind", "vehicle-image");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("No se pudo subir la imagen");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("No se recibió URL");
      setValue(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
        <input
          name={name}
          type="url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:border-slate-400"
          disabled={loading}
        >
          {loading ? "Subiendo..." : "Subir imagen"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void uploadFile(event.target.files?.[0])}
        />
      </div>

      {value ? (
        <div className="h-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <img src={value} alt="Preview vehiculo" className="h-full w-full object-cover" />
        </div>
      ) : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

