const fs = require("fs");
const path = require("path");
const { loadEnvConfig } = require("@next/env");
const { PrismaClient } = require("@prisma/client");

const rootDir = path.resolve(__dirname, "..");
loadEnvConfig(rootDir);

const prisma = new PrismaClient();
const PROACTIVITIS_URL = "https://proactivitis.com";

const textReplacements = [
  ["ÃƒÂ¡", "á"],
  ["ÃƒÂ©", "é"],
  ["ÃƒÂ­", "í"],
  ["ÃƒÂ³", "ó"],
  ["ÃƒÂº", "ú"],
  ["ÃƒÂ±", "ñ"],
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  ["Â·", "-"]
];

const sanitizeText = (value) => {
  if (!value) return "";
  const raw = String(value);
  const decoded = /[ÃÂ]/.test(raw) ? Buffer.from(raw, "latin1").toString("utf8") : raw;
  return textReplacements.reduce((text, [from, to]) => text.replaceAll(from, to), decoded).trim();
};

const toAbsoluteUrl = (value) => {
  if (!value) return `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;
  const clean = String(value).trim();
  if (!clean) return `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;
  if (clean.startsWith("http")) return clean;
  return `${PROACTIVITIS_URL}${clean.startsWith("/") ? clean : `/${clean}`}`;
};

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseGallery = (value) => {
  const parsed = parseJsonArray(value);
  if (parsed.length) return parsed.filter((item) => typeof item === "string");
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseStringList = (value) => {
  const parsed = parseJsonArray(value);
  if (parsed.length) {
    return parsed
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          if ("hour" in item) {
            return `${item.hour}:${String(item.minute ?? "00").padStart(2, "0")} ${item.period ?? ""}`.trim();
          }
          return String(item.label ?? item.name ?? item.value ?? "");
        }
        return "";
      })
      .map(sanitizeText)
      .filter(Boolean);
  }
  if (!value) return [];
  return String(value)
    .split(/[;,]/)
    .map(sanitizeText)
    .filter(Boolean);
};

const normalizeLanguages = (value) =>
  parseStringList(value)
    .flatMap((item) => item.split(/[\/,]/))
    .map(sanitizeText)
    .filter(Boolean);

const parseJsonTextList = (value) =>
  parseJsonArray(value)
    .filter((item) => typeof item === "string" && item.trim())
    .map(sanitizeText);

const formatDuration = (value) => {
  const raw = sanitizeText(value);
  if (!raw) return "Duracion variable";
  try {
    const parsed = JSON.parse(raw);
    const durationValue = parsed?.value ? String(parsed.value).trim() : "";
    const durationUnit = parsed?.unit ? sanitizeText(parsed.unit).toLowerCase() : "";
    if (!durationValue) return "Duracion variable";
    if (durationUnit.includes("min")) return `${durationValue} min`;
    if (durationUnit.includes("dia") || durationUnit.includes("día") || durationUnit.includes("day")) {
      return `${durationValue} dias`;
    }
    if (durationUnit.includes("hora") || durationUnit.includes("hour")) {
      return `${durationValue} horas`;
    }
    return `${durationValue} ${durationUnit}`.trim();
  } catch {
    return raw;
  }
};

const parseItineraryStops = (value) => {
  if (!value) return [];
  const stops = [];
  String(value)
    .split(/\r?\n/)
    .forEach((line) => {
      const timeMatch = line.match(/^\s*([0-9]{1,2}:[0-9]{2})\s*-\s*([^:]+):?\s*(.*)$/);
      if (timeMatch) {
        stops.push({
          time: sanitizeText(timeMatch[1]),
          title: sanitizeText(timeMatch[2]),
          description: sanitizeText(timeMatch[3])
        });
        return;
      }
      const adminMatch = line.match(/^\s*\d+\.\s*(.+?)\s*[–-]\s*([^:-]+?)(?:\s*-\s*(.*))?$/);
      if (adminMatch) {
        stops.push({
          time: sanitizeText(adminMatch[1]),
          title: sanitizeText(adminMatch[2]),
          description: sanitizeText(adminMatch[3])
        });
      }
    });
  return stops.filter((stop) => stop.title);
};

async function main() {
  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    take: 50,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      productId: true,
      slug: true,
      title: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      price: true,
      priceChild: true,
      priceYouth: true,
      duration: true,
      category: true,
      location: true,
      language: true,
      timeOptions: true,
      operatingDays: true,
      pickup: true,
      meetingPoint: true,
      meetingInstructions: true,
      requirements: true,
      cancellationPolicy: true,
      terms: true,
      physicalLevel: true,
      minAge: true,
      accessibility: true,
      confirmationType: true,
      capacity: true,
      includes: true,
      includesList: true,
      notIncludedList: true,
      highlights: true,
      adminNote: true,
      heroImage: true,
      gallery: true,
      options: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          pricePerPerson: true,
          basePrice: true,
          baseCapacity: true,
          extraPricePerPerson: true,
          imageUrl: true,
          isDefault: true
        }
      }
    }
  });

  const payload = tours.map((tour) => {
    const gallery = parseGallery(tour.gallery).map(toAbsoluteUrl);
    const image = toAbsoluteUrl(tour.heroImage ?? gallery[0]);
    const includes = parseJsonTextList(tour.includesList);
    return {
      id: tour.id,
      productId: tour.productId,
      slug: tour.slug,
      title: sanitizeText(tour.title),
      subtitle: sanitizeText(tour.subtitle),
      description: sanitizeText(tour.shortDescription ?? tour.description),
      fullDescription: sanitizeText(tour.description),
      price: tour.price,
      priceChild: tour.priceChild,
      priceYouth: tour.priceYouth,
      duration: formatDuration(tour.duration),
      category: sanitizeText(tour.category ?? "Tours"),
      location: sanitizeText(tour.location),
      languages: normalizeLanguages(tour.language),
      timeOptions: parseStringList(tour.timeOptions),
      operatingDays: parseStringList(tour.operatingDays),
      pickup: sanitizeText(tour.pickup),
      meetingPoint: sanitizeText(tour.meetingPoint),
      meetingInstructions: sanitizeText(tour.meetingInstructions),
      requirements: sanitizeText(tour.requirements),
      cancellationPolicy: sanitizeText(tour.cancellationPolicy),
      terms: sanitizeText(tour.terms),
      physicalLevel: sanitizeText(tour.physicalLevel),
      minAge: tour.minAge,
      accessibility: sanitizeText(tour.accessibility),
      confirmationType: sanitizeText(tour.confirmationType),
      capacity: tour.capacity,
      includes: includes.length ? includes : tour.includes ? [sanitizeText(tour.includes)] : [],
      notIncluded: parseJsonTextList(tour.notIncludedList),
      highlights: parseJsonTextList(tour.highlights),
      image,
      gallery: gallery.length ? gallery : [image],
      itinerary: parseItineraryStops(tour.adminNote),
      options: tour.options.map((option) => ({
        id: option.id,
        name: sanitizeText(option.name),
        type: sanitizeText(option.type),
        description: sanitizeText(option.description),
        pricePerPerson: option.pricePerPerson,
        basePrice: option.basePrice,
        baseCapacity: option.baseCapacity,
        extraPricePerPerson: option.extraPricePerPerson,
        imageUrl: toAbsoluteUrl(option.imageUrl),
        isDefault: option.isDefault
      }))
    };
  });

  const outputPath = path.join(rootDir, "mobile", "src", "staticTours.ts");
  const file = `import type { MobileTour } from "./api";\n\nexport const staticMobileTours = ${JSON.stringify(
    payload,
    null,
    2
  )} satisfies MobileTour[];\n`;
  fs.writeFileSync(outputPath, file, "utf8");
  console.log(`Generated ${payload.length} tours in ${path.relative(rootDir, outputPath)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
