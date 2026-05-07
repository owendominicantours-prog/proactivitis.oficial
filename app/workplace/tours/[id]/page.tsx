export const dynamic = "force-dynamic";

import Link from "next/link";

import WorkplaceShell from "@/components/workplace/WorkplaceShell";
import WorkplaceTourMediaFields from "@/components/workplace/WorkplaceTourMediaFields";
import { prisma } from "@/lib/prisma";
import { requireWorkplaceContext } from "@/lib/workplace";
import { getTourZoneLabel, ScopedTourRecord, tourMatchesWorkplaceScope } from "@/lib/workplaceTours";
import { requestTourDeleteApprovalAction, updateWorkplaceTourAction } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
};

const galleryLines = (value?: string | null) =>
  String(value ?? "")
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");

export default async function WorkplaceTourEditPage({ params, searchParams }: Props) {
  const context = await requireWorkplaceContext("tours.view");
  const { id } = await params;
  const resolvedSearch = (searchParams ? await searchParams : undefined) ?? {};
  const tour = await prisma.tour.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      productId: true,
      price: true,
      duration: true,
      shortDescription: true,
      description: true,
      timeOptions: true,
      operatingDays: true,
      status: true,
      location: true,
      category: true,
      countryId: true,
      heroImage: true,
      gallery: true,
      createdAt: true,
      SupplierProfile: { select: { id: true, company: true, userId: true } },
      country: { select: { code: true, name: true, slug: true } },
      destination: { select: { name: true, slug: true } },
      microZone: { select: { name: true, slug: true } },
      departureDestination: { select: { name: true, slug: true } }
    }
  });

  if (!tour || (!context.isAdmin && !tourMatchesWorkplaceScope(tour as ScopedTourRecord, context.scope))) {
    return (
      <WorkplaceShell
        active="tours"
        employeeName={context.user.name}
        department={context.employee?.department?.name ?? "Operaciones Tours"}
        permissions={context.permissions}
        scope={context.scope}
      >
        <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6">
          <h1 className="text-2xl font-black">Tour no disponible</h1>
          <p className="mt-2 text-sm text-rose-100">Este producto no existe o no pertenece a tu alcance asignado.</p>
          <Link href="/workplace/tours" className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm font-black">
            Volver a tours
          </Link>
        </div>
      </WorkplaceShell>
    );
  }

  const canEdit = context.isAdmin || context.permissions.has("tours.edit");
  const canMedia = context.isAdmin || context.permissions.has("tours.media");
  const readOnly = !canEdit;

  return (
    <WorkplaceShell
      active="tours"
      employeeName={context.user.name}
      department={context.employee?.department?.name ?? "Operaciones Tours"}
      permissions={context.permissions}
      scope={context.scope}
    >
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Tours / Editor</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{tour.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {tour.SupplierProfile.company} - {getTourZoneLabel(tour as ScopedTourRecord)} - codigo {tour.productId}
            </p>
          </div>
          <Link href="/workplace/tours" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-slate-200">
            Volver
          </Link>
        </div>

        {resolvedSearch.saved ? (
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm font-bold text-emerald-100">
            Cambios guardados. El proveedor recibio una notificacion generica del equipo administrativo.
          </div>
        ) : null}

        <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-4 text-sm text-cyan-100">
          Estas editando dentro de tu alcance asignado. El sistema no muestra ni permite tocar productos fuera de tu zona, nicho o proveedor.
        </section>

        <form action={updateWorkplaceTourAction} className="grid gap-6 xl:grid-cols-[1fr,0.45fr]">
          <input type="hidden" name="tourId" value={tour.id} />

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Informacion del tour</p>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Nombre</span>
                  <input
                    name="title"
                    defaultValue={tour.title}
                    disabled={readOnly}
                    className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Descripcion corta</span>
                  <textarea
                    name="shortDescription"
                    defaultValue={tour.shortDescription ?? ""}
                    disabled={readOnly}
                    rows={3}
                    className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Descripcion principal</span>
                  <textarea
                    name="description"
                    defaultValue={tour.description}
                    disabled={readOnly}
                    rows={9}
                    className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm leading-relaxed text-white outline-none disabled:opacity-60"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Horarios y estado</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Horarios</span>
                  <input
                    name="timeOptions"
                    defaultValue={tour.timeOptions ?? ""}
                    disabled={readOnly}
                    className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Dias de operacion</span>
                  <input
                    name="operatingDays"
                    defaultValue={tour.operatingDays ?? ""}
                    disabled={readOnly}
                    className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Estado</span>
                  <select
                    name="status"
                    defaultValue={tour.status}
                    disabled={readOnly}
                    className="rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  >
                    <option value="published">Activo</option>
                    <option value="draft">Borrador</option>
                    <option value="inactive">Inactivo</option>
                    <option value="pending_review">Revision</option>
                  </select>
                </label>
              </div>
            </section>

            <section id="media" className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Fotos</p>
              <div className="mt-5">
                <WorkplaceTourMediaFields heroImage={tour.heroImage} gallery={galleryLines(tour.gallery)} disabled={!canMedia} />
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="sticky top-24 rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Resumen operativo</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p><strong className="text-white">Proveedor:</strong> {tour.SupplierProfile.company}</p>
                <p><strong className="text-white">Zona:</strong> {getTourZoneLabel(tour as ScopedTourRecord)}</p>
                <p><strong className="text-white">Precio:</strong> US$ {tour.price.toFixed(2)}</p>
                <p><strong className="text-white">Estado:</strong> {tour.status}</p>
              </div>
              <button
                disabled={!canEdit && !canMedia}
                className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Guardar cambios
              </button>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Las ediciones se registran en auditoria. El proveedor recibe una notificacion sin ver datos internos del empleado.
              </p>
            </div>
          </aside>
        </form>

        <section className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
          <p className="text-sm font-black text-amber-100">Accion bloqueada por seguridad</p>
          <p className="mt-1 text-sm text-amber-100/80">Eliminar un tour requiere aprobacion de un administrador.</p>
          <form action={requestTourDeleteApprovalAction} className="mt-4">
            <input type="hidden" name="tourId" value={tour.id} />
            <button className="rounded-2xl border border-amber-300/30 px-5 py-3 text-sm font-black text-amber-100 hover:bg-amber-300/10">
              Solicitar eliminacion
            </button>
          </form>
        </section>
      </div>
    </WorkplaceShell>
  );
}
