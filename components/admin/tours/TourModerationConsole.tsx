"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DynamicImage } from "@/components/shared/DynamicImage";
import {
  approveTour,
  deleteTourAction,
  requestChanges,
  sendToReview,
  togglePauseTour
} from "@/lib/actions/tourModeration";
import { TOUR_DELETE_REASONS } from "@/lib/constants/tourDeletion";

export type SimpleTourRecord = {
  id: string;
  slug: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  language: string;
  includes: string;
  location: string;
  supplier: {
    name: string;
  };
  status: string;
  heroImage?: string | null;
  country?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<string, { text: string; color: string }> = {
  published: { text: "Publicado", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  draft: { text: "Borrador", color: "bg-slate-50 text-slate-600 border border-slate-200" },
  under_review: { text: "En revisión", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  pending: { text: "Pendiente", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  needs_changes: { text: "Necesita cambios", color: "bg-rose-50 text-rose-700 border border-rose-200" },
  paused: { text: "Pausado", color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  seo_only: { text: "SEO only", color: "bg-cyan-50 text-cyan-700 border border-cyan-200" }
};

const badgeClasses = (status: string) =>
  statusLabels[status]?.color ?? "bg-slate-50 text-slate-600 border border-slate-200";

type SegmentKey = "all" | "review_queue" | "published" | "draft" | "paused";

const segmentConfig: { key: SegmentKey; label: string; matcher: (status: string) => boolean }[] = [
  { key: "all", label: "Todos", matcher: () => true },
  {
    key: "review_queue",
    label: "Revisión",
    matcher: (status) => ["under_review", "pending", "needs_changes"].includes(status)
  },
  { key: "published", label: "Publicados", matcher: (status) => status === "published" },
  { key: "draft", label: "Borradores", matcher: (status) => status === "draft" },
  { key: "paused", label: "Pausados", matcher: (status) => status === "paused" }
];

type Props = {
  tours: SimpleTourRecord[];
};

export const TourModerationConsole = ({ tours }: Props) => {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<SegmentKey>("review_queue");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [selectedId, setSelectedId] = useState(tours[0]?.id ?? "");

  const suppliers = useMemo(() => Array.from(new Set(tours.map((tour) => tour.supplier.name))).sort(), [tours]);

  const segmentCounts = useMemo(() => {
    return segmentConfig.reduce<Record<SegmentKey, number>>((acc, item) => {
      acc[item.key] = tours.filter((tour) => item.matcher(tour.status)).length;
      return acc;
    }, { all: 0, review_queue: 0, published: 0, draft: 0, paused: 0 });
  }, [tours]);

  const filteredTours = useMemo(() => {
    return tours
      .filter((tour) => segmentConfig.find((item) => item.key === segment)?.matcher(tour.status) ?? true)
      .filter((tour) =>
        search
          ? [tour.title, tour.slug, tour.id, tour.location, tour.country]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
          : true
      )
      .filter((tour) => (supplierFilter ? tour.supplier.name === supplierFilter : true))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tours, search, segment, supplierFilter]);

  useEffect(() => {
    if (!filteredTours.length) {
      setSelectedId("");
      return;
    }
    const exists = filteredTours.some((tour) => tour.id === selectedId);
    if (!exists) setSelectedId(filteredTours[0].id);
  }, [filteredTours, selectedId]);

  const selectedTour = filteredTours.find((tour) => tour.id === selectedId) ?? filteredTours[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {segmentConfig.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSegment(item.key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  segment === item.key
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {item.label} ({segmentCounts[item.key]})
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <input
              type="text"
              placeholder="Buscar por nombre, slug, ID o destino"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none lg:col-span-2"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
            >
              <option value="">Todos los suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3">
          {filteredTours.map((tour) => (
            <button
              key={tour.id}
              type="button"
              onClick={() => setSelectedId(tour.id)}
              className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-slate-400 ${
                selectedTour?.id === tour.id ? "border-slate-900 ring-2 ring-slate-100" : "border-slate-200"
              }`}
            >
              <div className="flex gap-3">
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <DynamicImage
                    src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                    alt={tour.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">{tour.title}</h3>
                    <span className={`${badgeClasses(tour.status)} rounded-full px-2 py-1 text-[11px] font-semibold`}>
                      {statusLabels[tour.status]?.text ?? tour.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{tour.supplier.name} · {tour.country ?? tour.location}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Duración: {tour.duration}</span>
                    <span>Precio: USD {tour.price.toFixed(0)}</span>
                    <span>Actualizado: {new Date(tour.updatedAt).toLocaleDateString("es-DO")}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {!filteredTours.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No hay tours para este filtro.
            </div>
          )}
        </section>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {selectedTour ? <TourDetailPanel tour={selectedTour} /> : <p className="text-sm text-slate-500">Selecciona un tour para revisar.</p>}
      </aside>
    </div>
  );
};

const TourDetailPanel = ({ tour }: { tour: SimpleTourRecord }) => {
  const coverImage = tour.heroImage ?? "/fototours/fototour.jpeg";

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState(TOUR_DELETE_REASONS[0]?.value ?? "");
  const [moderationNote, setModerationNote] = useState("");

  const openDeleteDialog = () => {
    setDeleteReason(TOUR_DELETE_REASONS[0]?.value ?? "");
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const canSendToReview = ["draft", "needs_changes", "paused"].includes(tour.status);
  const canApprove = ["under_review", "pending", "needs_changes", "draft", "paused"].includes(tour.status);
  const canPauseToggle = ["published", "paused"].includes(tour.status);

  return (
    <div className="space-y-4">
      <div className="h-52 overflow-hidden rounded-xl bg-slate-100">
        <DynamicImage src={coverImage} alt={tour.title} className="h-full w-full object-cover" />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
          <span className={`${badgeClasses(tour.status)} rounded-full px-2 py-1 text-[11px] font-semibold`}>
            {statusLabels[tour.status]?.text ?? tour.status}
          </span>
        </div>
        <p className="text-sm text-slate-500">{tour.supplier.name} · {tour.country ?? tour.location}</p>
      </div>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <p><span className="font-semibold text-slate-900">Slug:</span> {tour.slug}</p>
        <p><span className="font-semibold text-slate-900">Precio:</span> USD {tour.price.toFixed(0)}</p>
        <p><span className="font-semibold text-slate-900">Duración:</span> {tour.duration}</p>
        <p><span className="font-semibold text-slate-900">Idiomas:</span> {tour.language}</p>
        <p><span className="font-semibold text-slate-900">Creado:</span> {new Date(tour.createdAt).toLocaleString("es-DO")}</p>
        <p><span className="font-semibold text-slate-900">Actualizado:</span> {new Date(tour.updatedAt).toLocaleString("es-DO")}</p>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p className="line-clamp-6">{tour.description}</p>
        <p><span className="font-semibold text-slate-900">Incluye:</span> {tour.includes}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/tours/preview/${tour.id}`} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-500">
          Preview admin
        </Link>
        {tour.status === "published" && (
          <Link href={`/tours/${tour.slug}`} target="_blank" className="rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
            Ver pública
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Nota de revisión
          <textarea
            value={moderationNote}
            onChange={(event) => setModerationNote(event.target.value)}
            rows={3}
            placeholder="Notas para proveedor o registro interno"
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="space-y-3">
        {canSendToReview && (
          <form action={sendToReview}>
            <input type="hidden" name="tourId" value={tour.id} />
            <button type="submit" className="w-full rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100">
              Enviar a revisión
            </button>
          </form>
        )}

        {canApprove && (
          <form action={approveTour} className="space-y-2">
            <input type="hidden" name="tourId" value={tour.id} />
            <input type="hidden" name="note" value={moderationNote} />
            <button type="submit" className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Aprobar y publicar
            </button>
          </form>
        )}

        <form action={requestChanges} className="space-y-2">
          <input type="hidden" name="tourId" value={tour.id} />
          <textarea
            required
            name="note"
            rows={2}
            placeholder="Qué debe corregir el supplier"
            className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 shadow-sm focus:border-amber-300 focus:outline-none"
          />
          <button type="submit" className="w-full rounded-md border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200">
            Solicitar cambios
          </button>
        </form>

        {canPauseToggle && (
          <form action={togglePauseTour}>
            <input type="hidden" name="tourId" value={tour.id} />
            <input type="hidden" name="currentStatus" value={tour.status} />
            <button type="submit" className="w-full rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
              {tour.status === "paused" ? "Reactivar publicación" : "Pausar publicación"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={openDeleteDialog}
          className="w-full rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-600 hover:border-rose-400"
        >
          Eliminar tour
        </button>
      </div>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Eliminar tour</p>
                <p className="text-xs text-slate-500">Selecciona motivo y confirma.</p>
              </div>
              <button type="button" onClick={closeDeleteDialog} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                Cerrar
              </button>
            </div>
            <form action={deleteTourAction} onSubmit={closeDeleteDialog} className="mt-4 space-y-4">
              <input type="hidden" name="tourId" value={tour.id} />
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Motivo
                <select
                  name="reason"
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400"
                  required
                >
                  {TOUR_DELETE_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeDeleteDialog} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300">
                  Cancelar
                </button>
                <button type="submit" className="rounded-full bg-rose-600 px-4 py-1 text-xs font-semibold text-white hover:bg-rose-700">
                  Confirmar eliminación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

