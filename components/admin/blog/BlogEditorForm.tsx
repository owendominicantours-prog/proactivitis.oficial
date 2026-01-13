"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "./RichTextEditor";

type TourOption = {
  id: string;
  title: string;
  slug: string;
};

type BlogEditorFormProps = {
  action: (formData: FormData) => void;
  tours: TourOption[];
  initial?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    contentHtml?: string;
    status?: string;
    tourIds?: string[];
  };
};

export default function BlogEditorForm({ action, tours, initial }: BlogEditorFormProps) {
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const selectedTourIds = useMemo(() => new Set(initial?.tourIds ?? []), [initial?.tourIds]);

  return (
    <form action={action} className="space-y-6">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <textarea name="contentHtml" value={contentHtml} readOnly hidden />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Titulo</span>
          <input
            name="title"
            defaultValue={initial?.title ?? ""}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Slug</span>
          <input
            name="slug"
            defaultValue={initial?.slug ?? ""}
            placeholder="se-genera-si-lo-dejas-vacio"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-600">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Descripcion corta</span>
        <textarea
          name="excerpt"
          defaultValue={initial?.excerpt ?? ""}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Imagen principal</span>
          <input
            name="coverImage"
            defaultValue={initial?.coverImage ?? ""}
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Estado</span>
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Contenido</p>
        <RichTextEditor
          value={contentHtml}
          onChange={setContentHtml}
          placeholder="Escribe el contenido del blog..."
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Tours relacionados</p>
          <span className="text-xs text-slate-500">{tours.length} disponibles</span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {tours.map((tour) => (
            <label key={tour.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="tourIds"
                value={tour.id}
                defaultChecked={selectedTourIds.has(tour.id)}
              />
              <span className="font-medium text-slate-900">{tour.title}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{tour.slug}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800"
      >
        Guardar blog
      </button>
    </form>
  );
}
