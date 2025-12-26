import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TransferLocationType } from "@prisma/client";

type ImportFailure = {
  row: number;
  slug?: string;
  reason: string;
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const csvField = formData.get("csvFile");
  const fallbackZoneId = formData.get("zoneId");

  if (!csvField || !(csvField instanceof File)) {
    return NextResponse.json({ error: "Envía un archivo CSV válido." }, { status: 400 });
  }

  const csvText = await csvField.text();
  if (!csvText.trim()) {
    return NextResponse.json({ error: "El CSV está vacío." }, { status: 400 });
  }

  const rows = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (rows.length <= 1) {
    return NextResponse.json({ error: "No se encontraron filas de datos en el CSV." }, { status: 400 });
  }

  const headers = rows[0].split(",").map((value) => value.trim().toLowerCase());
  const nameIndex = headers.indexOf("name");
  const slugIndex = headers.indexOf("slug");
  const typeIndex = headers.indexOf("type");
  const zoneSlugIndex = headers.indexOf("zoneslug");
  const descriptionIndex = headers.indexOf("description");
  const addressIndex = headers.indexOf("address");

  if (nameIndex === -1 || slugIndex === -1 || typeIndex === -1) {
    return NextResponse.json(
      { error: "El CSV debe incluir las cabeceras mínimas: name, slug, type." },
      { status: 400 }
    );
  }

  const zones = await prisma.transferZoneV2.findMany();
  const zoneSlugMap = new Map(zones.map((zone) => [zone.slug.toLowerCase(), zone]));
  const fallbackZone =
    fallbackZoneId && typeof fallbackZoneId === "string"
      ? zones.find((zone) => zone.id === fallbackZoneId)
      : null;

  if (zoneSlugIndex === -1 && !fallbackZone) {
    return NextResponse.json(
      { error: "La columna zoneSlug no está presente. Selecciona una zona por defecto para todas las filas." },
      { status: 400 }
    );
  }

  const failures: ImportFailure[] = [];
  let createdCount = 0;
  let updatedCount = 0;
  const seenSlugs = new Set<string>();

  const dataRows = rows.slice(1);
  let rowNumber = 2;
  for (const row of dataRows) {
    const cells = row.split(",").map((cell) => cell.trim());
    const name = cells[nameIndex];
    const slug = cells[slugIndex];
    const typeValue = cells[typeIndex];

    if (!name || !slug || !typeValue) {
      failures.push({
        row: rowNumber,
        slug: slug ?? undefined,
        reason: "Faltan los campos obligatorios (name, slug, type)."
      });
      rowNumber++;
      continue;
    }

    const normalizedSlug = slug.trim();
    if (seenSlugs.has(normalizedSlug)) {
      failures.push({ row: rowNumber, slug: normalizedSlug, reason: "Slug duplicado dentro del CSV." });
      rowNumber++;
      continue;
    }

    let zone: typeof zones[number] | null = null;
    if (zoneSlugIndex !== -1) {
      const zoneSlugValue = cells[zoneSlugIndex]?.trim().toLowerCase();
      if (zoneSlugValue) {
        zone = zoneSlugMap.get(zoneSlugValue) ?? null;
        if (!zone) {
          failures.push({ row: rowNumber, slug: normalizedSlug, reason: `Zona "${zoneSlugValue}" no encontrada.` });
          rowNumber++;
          continue;
        }
      }
    }

    if (!zone) {
      if (fallbackZone) {
        zone = fallbackZone;
      } else {
        failures.push({
          row: rowNumber,
          slug: normalizedSlug,
          reason: "La fila no define zoneSlug y no se indicó zona por defecto."
        });
        rowNumber++;
        continue;
      }
    }

    const normalizedType = typeValue.toUpperCase();
    if (!Object.values(TransferLocationType).includes(normalizedType as TransferLocationType)) {
      failures.push({
        row: rowNumber,
        slug: normalizedSlug,
        reason: `Tipo "${typeValue}" inválido. Usa HOTEL, AIRPORT o PLACE.`
      });
      rowNumber++;
      continue;
    }

    const type = normalizedType as TransferLocationType;
    const locationPayload = {
      name: name.trim(),
      slug: normalizedSlug,
      type,
      zoneId: zone.id,
      countryCode: zone.countryCode,
      description: descriptionIndex !== -1 ? cells[descriptionIndex] : undefined,
      address: addressIndex !== -1 ? cells[addressIndex] : undefined,
      active: true
    };

    const existing = await prisma.transferLocation.findUnique({ where: { slug: normalizedSlug } });
    if (existing) {
      await prisma.transferLocation.update({
        where: { slug: normalizedSlug },
        data: locationPayload
      });
      updatedCount++;
    } else {
      await prisma.transferLocation.create({ data: locationPayload });
      createdCount++;
    }

    seenSlugs.add(normalizedSlug);
    rowNumber++;
  }

  revalidatePath("/dashboard");
  revalidatePath("/(dashboard)/admin/transfers");

  return NextResponse.json({
    createdCount,
    updatedCount,
    failures
  });
}
