import { Prisma, PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();
const STORE_KEY = "PRODISCOVERY_GROUP_TITLES_V1";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

type LocaleTitle = {
  title: string;
  cardTitle: string;
  subtitle: string;
};

type GeminiPayload = {
  titles: Record<string, { es: LocaleTitle; en: LocaleTitle; fr: LocaleTitle }>;
};

function loadEnvFiles() {
  for (const file of [".env", ".env.production", ".env.local"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    const lines = readFileSync(path, "utf8").split(/\r?\n/g);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (key) process.env[key] = value;
    }
  }
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced || text;
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first < 0 || last <= first) throw new Error("Gemini no devolvio JSON.");
  return JSON.parse(raw.slice(first, last + 1)) as GeminiPayload;
}

const cleanText = (value?: string | null) => (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);

function titlePrompt(products: Array<Record<string, unknown>>) {
  return `
Eres copywriter de ProDiscovery, una marca de concierge para viajes privados de grupos.
Convierte titulos de productos/tours de Proactivitis en titulos comerciales para paginas ProDiscovery.

Reglas:
- No vendas tickets ni precio.
- No uses "comprar", "reserva ahora", "ticket", "desde USD".
- El cliente debe entender que es una experiencia privada para grupos.
- Mantén Santo Domingo muy visible cuando el producto sea de Santo Domingo.
- Si el producto sale desde Punta Cana hacia Santo Domingo, dilo claramente.
- Los titulos deben sonar premium, claros y humanos, no SEO spam.
- cardTitle max 62 caracteres.
- title max 78 caracteres.
- subtitle max 120 caracteres.
- Devuelve SOLO JSON valido con esta forma:
{
  "titles": {
    "slug-del-producto": {
      "es": {"title": "", "cardTitle": "", "subtitle": ""},
      "en": {"title": "", "cardTitle": "", "subtitle": ""},
      "fr": {"title": "", "cardTitle": "", "subtitle": ""}
    }
  }
}

Productos:
${JSON.stringify(products, null, 2)}
`.trim();
}

async function callGemini(products: Array<Record<string, unknown>>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: titlePrompt(products) }] }],
      generationConfig: { temperature: 0.4 }
    })
  });
  if (!response.ok) throw new Error(`Gemini error ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).map((part) => part.text ?? "").join("\n").trim();
  if (!text) throw new Error("Gemini no devolvio texto.");
  return extractJson(text);
}

async function main() {
  loadEnvFiles();
  const limitArg = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 80);
  const limit = Number.isFinite(limitArg) ? Math.max(6, Math.min(120, limitArg)) : 80;

  const baseWhere: Prisma.TourWhereInput = {
    status: { in: ["published", "seo_only"] },
    OR: [
      { countryId: { in: ["RD", "DO"] } },
      { country: { slug: { in: ["republica-dominicana", "dominican-republic", "dominican-republic-rd"] } } }
    ]
  };
  const select = {
    slug: true,
    title: true,
    category: true,
    location: true,
    shortDescription: true,
    destination: { select: { name: true, slug: true } },
    departureDestination: { select: { name: true, slug: true } }
  } satisfies Prisma.TourSelect;

  const [santoDomingo, general, existing] = await Promise.all([
    prisma.tour.findMany({
      where: {
        AND: [
          baseWhere,
          {
            OR: [
              { slug: { contains: "santo-domingo" } },
              { title: { contains: "Santo Domingo" } },
              { location: { contains: "Santo Domingo" } },
              { shortDescription: { contains: "Santo Domingo" } }
            ]
          }
        ]
      },
      select,
      orderBy: [{ createdAt: "desc" }],
      take: Math.ceil(limit / 2)
    }),
    prisma.tour.findMany({
      where: baseWhere,
      select,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limit
    }),
    prisma.siteContentSetting.findUnique({ where: { key: STORE_KEY }, select: { content: true } })
  ]);

  const seen = new Set<string>();
  const products = [...santoDomingo, ...general]
    .filter((tour) => {
      if (seen.has(tour.slug)) return false;
      seen.add(tour.slug);
      return true;
    })
    .slice(0, limit)
    .map((tour) => ({
      slug: tour.slug,
      title: tour.title,
      category: tour.category,
      location: tour.location,
      destination: tour.departureDestination?.name || tour.destination?.name || tour.location,
      description: cleanText(tour.shortDescription)
    }));

  const generated = await callGemini(products);
  const current = existing?.content && typeof existing.content === "object" ? (existing.content as Record<string, unknown>) : {};
  const currentTitles = current.titles && typeof current.titles === "object" ? (current.titles as Record<string, unknown>) : {};
  const content = {
    kind: "prodiscovery-group-titles",
    generatedAt: new Date().toISOString(),
    titles: {
      ...currentTitles,
      ...generated.titles
    }
  };

  await prisma.siteContentSetting.upsert({
    where: { key: STORE_KEY },
    create: { key: STORE_KEY, content: content as Prisma.InputJsonValue },
    update: { content: content as Prisma.InputJsonValue }
  });

  console.log(`Generated ProDiscovery group titles: ${Object.keys(generated.titles).length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
