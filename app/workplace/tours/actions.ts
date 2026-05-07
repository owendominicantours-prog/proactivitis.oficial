"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createNotification } from "@/lib/notificationService";
import { prisma } from "@/lib/prisma";
import { recordWorkplaceAuditLog, requireWorkplaceContext } from "@/lib/workplace";
import { ScopedTourRecord, tourMatchesWorkplaceScope } from "@/lib/workplaceTours";

const toJson = (value: unknown) => value as Prisma.InputJsonValue;
const sanitize = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");
const sanitizeBlock = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const tourSelect = {
  id: true,
  title: true,
  slug: true,
  productId: true,
  status: true,
  price: true,
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
} satisfies Prisma.TourSelect;

async function getAccessibleTour(tourId: string, permissionKey = "tours.view") {
  const context = await requireWorkplaceContext(permissionKey);
  const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: tourSelect });

  if (!tour) {
    throw new Error("Tour no encontrado.");
  }

  if (!context.isAdmin && !tourMatchesWorkplaceScope(tour as ScopedTourRecord, context.scope)) {
    throw new Error("Este tour no pertenece a tu alcance asignado.");
  }

  return { context, tour };
}

async function notifySupplierProductUpdated(tour: { id: string; SupplierProfile: { userId: string | null } }) {
  if (!tour.SupplierProfile.userId) return;

  await createNotification({
    type: "SUPPLIER_TOUR_REMINDER",
    role: "SUPPLIER",
    recipientUserId: tour.SupplierProfile.userId,
    title: "Producto actualizado",
    message: "Tu producto fue actualizado por el equipo administrativo.",
    metadata: {
      tourId: tour.id,
      referenceUrl: "/supplier/tours"
    }
  });
}

export async function updateWorkplaceTourAction(formData: FormData) {
  const tourId = sanitize(formData.get("tourId"));
  if (!tourId) throw new Error("Tour invalido.");

  const { context, tour } = await getAccessibleTour(tourId);
  const canEdit = context.isAdmin || context.permissions.has("tours.edit");
  const canMedia = context.isAdmin || context.permissions.has("tours.media");

  if (!canEdit && !canMedia) {
    throw new Error("No tienes permiso para modificar este tour.");
  }

  const data: Prisma.TourUpdateInput = {};
  const afterData: Record<string, unknown> = {};

  if (canEdit) {
    const title = sanitize(formData.get("title"));
    const shortDescription = sanitizeBlock(formData.get("shortDescription"));
    const description = sanitizeBlock(formData.get("description"));
    const timeOptions = sanitize(formData.get("timeOptions"));
    const operatingDays = sanitize(formData.get("operatingDays"));
    const status = sanitize(formData.get("status"));

    if (title) {
      data.title = title;
      afterData.title = title;
    }
    data.shortDescription = shortDescription || null;
    data.description = description || tour.title;
    data.timeOptions = timeOptions || null;
    data.operatingDays = operatingDays || null;
    if (["draft", "published", "inactive", "pending_review"].includes(status)) {
      data.status = status;
      afterData.status = status;
    }
    afterData.shortDescription = shortDescription || null;
    afterData.descriptionUpdated = true;
    afterData.timeOptions = timeOptions || null;
    afterData.operatingDays = operatingDays || null;
  }

  if (canMedia) {
    const heroImage = sanitize(formData.get("heroImage"));
    const gallery = sanitizeBlock(formData.get("gallery"))
      .split(/\n/g)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");

    data.heroImage = heroImage || null;
    data.gallery = gallery || null;
    afterData.mediaUpdated = true;
  }

  await prisma.tour.update({ where: { id: tour.id }, data });

  await notifySupplierProductUpdated(tour);

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: "workplace.tour.update",
    moduleKey: "tours",
    resourceType: "tour",
    resourceId: tour.id,
    beforeData: {
      title: tour.title,
      status: tour.status,
      heroImage: tour.heroImage
    },
    afterData
  });

  revalidatePath("/workplace/tours");
  revalidatePath(`/workplace/tours/${tour.id}`);
  redirect(`/workplace/tours/${tour.id}?saved=1`);
}

export async function requestTourDeleteApprovalAction(formData: FormData) {
  const tourId = sanitize(formData.get("tourId"));
  if (!tourId) throw new Error("Tour invalido.");

  const { context, tour } = await getAccessibleTour(tourId, "tours.view");

  const existing = await prisma.workplaceApprovalRequest.findFirst({
    where: {
      employeeId: context.employee?.id ?? undefined,
      actionKey: "tours.delete",
      resourceType: "tour",
      resourceId: tour.id,
      status: "PENDING"
    },
    select: { id: true }
  });

  if (!existing) {
    await prisma.workplaceApprovalRequest.create({
      data: {
        employeeId: context.employee?.id ?? null,
        requestedById: context.user.id,
        actionKey: "tours.delete",
        moduleKey: "tours",
        resourceType: "tour",
        resourceId: tour.id,
        title: `Eliminar tour: ${tour.title}`,
        description: "Esta accion requiere aprobacion de un administrador.",
        payload: toJson({ tourId: tour.id, title: tour.title, supplier: tour.SupplierProfile.company })
      }
    });
  }

  await recordWorkplaceAuditLog({
    actorUserId: context.user.id,
    employeeId: context.employee?.id ?? null,
    actionKey: "workplace.tour.delete_requested",
    moduleKey: "tours",
    resourceType: "tour",
    resourceId: tour.id,
    metadata: { supplier: tour.SupplierProfile.company }
  });

  revalidatePath("/workplace/tours");
  redirect("/workplace/tours?approval=sent");
}
