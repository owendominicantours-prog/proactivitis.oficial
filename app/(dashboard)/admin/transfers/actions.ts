"use server";

import { TransferLocationType, VehicleCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const TRANSFER_ADMIN_PATH = "/(dashboard)/admin/transfers";

function refreshTransfers() {
  revalidatePath("/dashboard");
  revalidatePath(TRANSFER_ADMIN_PATH);
  revalidatePath("/sitemap-transfers.xml");
}

export async function addTransferCountryAction(formData: FormData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const code = formData.get("code");
  const shortDescription = formData.get("shortDescription");

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Ingresa el nombre del país.");
  }
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    throw new Error("Ingresa un slug válido para el país.");
  }
  if (!code || typeof code !== "string" || !code.trim()) {
    throw new Error("Ingresa el código ISO del país.");
  }

  await prisma.country.upsert({
    where: { slug: slug.trim() },
    update: {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      shortDescription: typeof shortDescription === "string" ? shortDescription.trim() : undefined
    },
    create: {
      name: name.trim(),
      slug: slug.trim(),
      code: code.trim().toUpperCase(),
      shortDescription: typeof shortDescription === "string" ? shortDescription.trim() : undefined
    }
  });

  refreshTransfers();
}

export async function addTransferZoneAction(formData: FormData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const description = formData.get("description");
  const countryId = formData.get("countryId");

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Ingresa el nombre de la zona.");
  }
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    throw new Error("Ingresa un slug para la zona.");
  }
  if (!countryId || typeof countryId !== "string" || !countryId.trim()) {
    throw new Error("Selecciona el país.");
  }

  const country = await prisma.country.findUnique({ where: { id: countryId.trim() } });
  if (!country) {
    throw new Error("País no encontrado.");
  }

  await prisma.transferZoneV2.upsert({
    where: { slug: slug.trim() },
    update: {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
      countryCode: country.code,
      active: true
    },
    create: {
      name: name.trim(),
      slug: slug.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
      countryCode: country.code
    }
  });

  refreshTransfers();
}

export async function updateTransferZoneAction(formData: FormData) {
  const zoneId = formData.get("zoneId");
  const name = formData.get("name");
  const slug = formData.get("slug");
  const description = formData.get("description");

  if (!zoneId || typeof zoneId !== "string" || !zoneId.trim()) {
    throw new Error("Identificador de zona inválido.");
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Ingresa el nombre de la zona.");
  }
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    throw new Error("Ingresa un slug para la zona.");
  }

  const zone = await prisma.transferZoneV2.findUnique({ where: { id: zoneId.trim() } });
  if (!zone) {
    throw new Error("Zona no encontrada.");
  }

  const slugConflict = await prisma.transferZoneV2.findFirst({
    where: {
      slug: slug.trim(),
      NOT: { id: zone.id }
    }
  });
  if (slugConflict) {
    throw new Error("Ya existe otra zona con ese slug.");
  }

  await prisma.transferZoneV2.update({
    where: { id: zone.id },
    data: {
      name: name.trim(),
      slug: slug.trim(),
      description: typeof description === "string" ? description.trim() : undefined
    }
  });

  refreshTransfers();
}

export async function deleteTransferZoneAction(formData: FormData) {
  const zoneId = formData.get("zoneId");

  if (!zoneId || typeof zoneId !== "string" || !zoneId.trim()) {
    throw new Error("Identificador de zona inválido.");
  }

  const zone = await prisma.transferZoneV2.findUnique({ where: { id: zoneId.trim() }, include: { locations: true } });
  if (!zone) {
    throw new Error("Zona no encontrada.");
  }
  if (zone.locations.length > 0) {
    throw new Error("No se puede eliminar una zona que tiene locations asignadas.");
  }

  await prisma.transferZoneV2.delete({ where: { id: zone.id } });
  refreshTransfers();
}

export async function addTransferLocationAction(formData: FormData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const type = formData.get("type");
  const zoneId = formData.get("zoneId");
  const address = formData.get("address");
  const description = formData.get("description");

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Ingresa el nombre del location.");
  }
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    throw new Error("Ingresa un slug para el location.");
  }
  if (!zoneId || typeof zoneId !== "string" || !zoneId.trim()) {
    throw new Error("Selecciona la zona.");
  }
  if (!type || typeof type !== "string" || !Object.values(TransferLocationType).includes(type as TransferLocationType)) {
    throw new Error("Selecciona el tipo de location.");
  }

  const zone = await prisma.transferZoneV2.findUnique({ where: { id: zoneId.trim() } });
  if (!zone) {
    throw new Error("Zona no encontrada.");
  }

  await prisma.transferLocation.upsert({
    where: { slug: slug.trim() },
    update: {
      name: name.trim(),
      type: type as TransferLocationType,
      description: typeof description === "string" ? description.trim() : undefined,
      address: typeof address === "string" ? address.trim() : undefined,
      zoneId: zone.id,
      countryCode: zone.countryCode,
      active: true
    },
    create: {
      name: name.trim(),
      slug: slug.trim(),
      type: type as TransferLocationType,
      description: typeof description === "string" ? description.trim() : undefined,
      address: typeof address === "string" ? address.trim() : undefined,
      zoneId: zone.id,
      countryCode: zone.countryCode
    }
  });

  refreshTransfers();
}

export async function addTransferVehicleAction(formData: FormData) {
  const vehicleId = formData.get("vehicleId");
  const name = formData.get("name");
  const slug = formData.get("slug");
  const minPax = formData.get("minPax");
  const maxPax = formData.get("maxPax");
  const category = formData.get("category");
  const imageUrl = formData.get("imageUrl");

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Ingresa el nombre del vehículo.");
  }
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    throw new Error("Ingresa el slug del vehículo.");
  }
  const min = Number(minPax);
  const max = Number(maxPax);
  if (Number.isNaN(min) || Number.isNaN(max) || min <= 0 || max <= 0 || min > max) {
    throw new Error("Ingresa un rango de pasajeros válido.");
  }
  if (!category || typeof category !== "string" || !Object.values(VehicleCategory).includes(category as VehicleCategory)) {
    throw new Error("Selecciona la categoría del vehículo.");
  }

  const normalizedSlug = slug.trim();
  const slugConflict = await prisma.transferVehicle.findFirst({
    where: {
      slug: normalizedSlug,
      ...(vehicleId && typeof vehicleId === "string"
        ? { NOT: { id: vehicleId.trim() } }
        : undefined)
    }
  });
  if (slugConflict) {
    throw new Error("Ya existe un vehículo con ese slug.");
  }

  const payload = {
    name: name.trim(),
    slug: normalizedSlug,
    minPax: min,
    maxPax: max,
    category: category as VehicleCategory,
    imageUrl: typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : undefined
  };

  if (vehicleId && typeof vehicleId === "string" && vehicleId.trim()) {
    const existingVehicle = await prisma.transferVehicle.findUnique({ where: { id: vehicleId.trim() } });
    if (!existingVehicle) {
      throw new Error("Vehículo no encontrado.");
    }
    await prisma.transferVehicle.update({
      where: { id: existingVehicle.id },
      data: payload
    });
  } else {
    await prisma.transferVehicle.create({
      data: {
        ...payload,
        active: true
      }
    });
  }

  refreshTransfers();
}

export async function addTransferRouteAction(formData: FormData) {
  const zoneAId = formData.get("zoneAId");
  const zoneBId = formData.get("zoneBId");

  if (!zoneAId || typeof zoneAId !== "string" || !zoneAId.trim()) {
    throw new Error("Selecciona la zona de origen.");
  }
  if (!zoneBId || typeof zoneBId !== "string" || !zoneBId.trim()) {
    throw new Error("Selecciona la zona de destino.");
  }
  const [zoneA, zoneB] = await Promise.all([
    prisma.transferZoneV2.findUnique({ where: { id: zoneAId.trim() } }),
    prisma.transferZoneV2.findUnique({ where: { id: zoneBId.trim() } })
  ]);

  if (!zoneA || !zoneB) {
    throw new Error("Una de las zonas no existe.");
  }
  if (zoneA.countryCode !== zoneB.countryCode) {
    throw new Error("Las zonas deben pertenecer al mismo país.");
  }

  const sorted = [zoneA, zoneB].sort((a, b) => (a.id < b.id ? -1 : 1));

  await prisma.transferRoute.upsert({
    where: {
      zoneAId_zoneBId: {
        zoneAId: sorted[0].id,
        zoneBId: sorted[1].id
      }
    },
    update: { active: true, countryCode: zoneA.countryCode },
    create: {
      zoneAId: sorted[0].id,
      zoneBId: sorted[1].id,
      countryCode: zoneA.countryCode
    }
  });

  refreshTransfers();
}

export async function upsertTransferRoutePriceAction(formData: FormData) {
  const routeId = formData.get("routeId");
  const vehicleId = formData.get("vehicleId");
  const priceValue = formData.get("price");

  if (!routeId || typeof routeId !== "string" || !routeId.trim()) {
    throw new Error("Selecciona una ruta.");
  }
  if (!vehicleId || typeof vehicleId !== "string" || !vehicleId.trim()) {
    throw new Error("Selecciona un vehículo.");
  }
  const price = Number(priceValue);
  if (Number.isNaN(price) || price <= 0) {
    throw new Error("Ingresa un precio válido.");
  }

  await prisma.transferRoutePrice.upsert({
    where: {
      routeId_vehicleId: {
        routeId: routeId.trim(),
        vehicleId: vehicleId.trim()
      }
    },
    update: { price },
    create: {
      routeId: routeId.trim(),
      vehicleId: vehicleId.trim(),
      price
    }
  });

  refreshTransfers();
}

export async function addTransferRouteOverrideAction(formData: FormData) {
  const routeId = formData.get("routeId");
  const vehicleId = formData.get("vehicleId");
  const originLocationId = formData.get("originLocationId");
  const destinationLocationId = formData.get("destinationLocationId");
  const priceValue = formData.get("price");
  const notes = formData.get("notes");

  if (!routeId || typeof routeId !== "string" || !routeId.trim()) {
    throw new Error("Selecciona una ruta.");
  }
  if (!vehicleId || typeof vehicleId !== "string" || !vehicleId.trim()) {
    throw new Error("Selecciona un vehículo.");
  }
  const price = Number(priceValue);
  if (Number.isNaN(price) || price <= 0) {
    throw new Error("Ingresa un precio válido.");
  }

  const sanitizedOriginLocationId =
    originLocationId && typeof originLocationId === "string" ? originLocationId.trim() : null;
  const sanitizedDestinationLocationId =
    destinationLocationId && typeof destinationLocationId === "string"
      ? destinationLocationId.trim()
      : null;

  const overrideWhere = {
    routeId: routeId.trim(),
    vehicleId: vehicleId.trim(),
    originLocationId: sanitizedOriginLocationId ?? undefined,
    destinationLocationId: sanitizedDestinationLocationId ?? undefined
  };

  const overrideData = {
    routeId: routeId.trim(),
    vehicleId: vehicleId.trim(),
    originLocationId: sanitizedOriginLocationId ?? undefined,
    destinationLocationId: sanitizedDestinationLocationId ?? undefined,
    price,
    notes: typeof notes === "string" ? notes.trim() : undefined
  };

  const existingOverride = await prisma.transferRoutePriceOverride.findFirst({
    where: overrideWhere
  });

  if (existingOverride) {
    await prisma.transferRoutePriceOverride.update({
      where: { id: existingOverride.id },
      data: {
        price,
        notes: overrideData.notes
      }
    });
  } else {
    await prisma.transferRoutePriceOverride.create({
      data: overrideData
    });
  }

  refreshTransfers();
}

export async function toggleTransferLocationActiveAction(formData: FormData) {
  const locationId = formData.get("locationId");

  if (!locationId || typeof locationId !== "string" || !locationId.trim()) {
    throw new Error("Identificador de location inválido.");
  }

  const location = await prisma.transferLocation.findUnique({ where: { id: locationId.trim() } });
  if (!location) {
    throw new Error("Location no encontrado.");
  }

  await prisma.transferLocation.update({
    where: { id: location.id },
    data: { active: !location.active }
  });

  refreshTransfers();
}

export async function toggleTransferVehicleActiveAction(formData: FormData) {
  const vehicleId = formData.get("vehicleId");

  if (!vehicleId || typeof vehicleId !== "string" || !vehicleId.trim()) {
    throw new Error("Vehículo inválido.");
  }

  const vehicle = await prisma.transferVehicle.findUnique({ where: { id: vehicleId.trim() } });
  if (!vehicle) {
    throw new Error("Vehículo no encontrado.");
  }

  await prisma.transferVehicle.update({
    where: { id: vehicle.id },
    data: { active: !vehicle.active }
  });

  refreshTransfers();
}
