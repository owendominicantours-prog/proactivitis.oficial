import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { slugifyBlog } from "../lib/blog";

const prisma = new PrismaClient();

const translateText = async (text: string, target: "en" | "fr") => {
  if (!text) return text;
  const params = new URLSearchParams({
    client: "gtx",
    sl: "es",
    tl: target,
    dt: "t",
    q: text
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`translation failed: ${response.statusText}`);
  }
  const body = await response.text();
  const json = JSON.parse(body);
  const segments = json[0];
  return segments.map((segment: unknown[]) => segment[0]).join("");
};

const title = "Top attractions in Punta Cana: things to do 2026";
const slug = slugifyBlog(title) || "top-attractions-punta-cana-2026";
const excerpt =
  "Una guia 2026 con las atracciones mas buscadas de Punta Cana: playas, aventura, cultura y excursiones con pickup.";
const coverImage =
  "https://cfplxlfjp1i96vih.public.blob.vercel-storage.com/Carrusel/CARRU1.jpg";

const contentHtml = `
<h1>Top attractions in Punta Cana: things to do 2026</h1>
<p>Punta Cana sigue liderando las busquedas de viajes en 2026 por su combinacion de playas, aventura y experiencias faciles de reservar. Esta guia resume lo que mas piden los viajeros y como elegir excursiones con pickup desde hotel.</p>

<h2>1) Isla Saona y Cayo Levantado</h2>
<p>Son las excursiones marinas mas solicitadas. La clave es confirmar itinerario, tiempo en playa y si incluye comida y bebidas. Para familias, prioriza catamaran con zonas de sombra; para grupos, busca opciones con open bar.</p>

<h2>2) Snorkel y arrecifes en Bavaro</h2>
<p>Las salidas de snorkel con parada en arrecife son ideales para media jornada. Verifica equipo incluido y guia en tu idioma.</p>

<h2>3) Buggies y ATV en Macao</h2>
<p>La aventura de barro sigue en el top. Lo importante es saber la duracion real, si incluye casco, y la parada en la cueva o cenote.</p>

<h2>4) Parasailing y deportes acuaticos</h2>
<p>Si buscas una experiencia breve y visual, el parasailing es de las mas fotografiadas. Fijate en altura, tiempo en el aire y condiciones de viento.</p>

<h2>5) Tour cultural a Santo Domingo</h2>
<p>Para quienes quieren historia real, el tour a la Zona Colonial es el #1 fuera del resort. Asegura transporte confortable y tiempos claros.</p>

<h2>Consejos 2026 para reservar</h2>
<ul>
  <li>Elige tours con pickup confirmado por hotel.</li>
  <li>Verifica politicas de cancelacion y horarios.</li>
  <li>Reserva con soporte local para cambios de ultimo minuto.</li>
</ul>

<p>Si quieres comparar opciones, revisa los tours con pickup desde tu hotel y confirma la mejor ruta para tu fecha.</p>
`;

async function main() {
  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "BlogPost" WHERE slug = ${slug} LIMIT 1
  `;
  if (existing.length) {
    console.log("Blog ya existe:", slug);
    return;
  }

  const id = randomUUID();
  const now = new Date();
  await prisma.$executeRaw`
    INSERT INTO "BlogPost" ("id", "title", "slug", "excerpt", "coverImage", "contentHtml", "status", "publishedAt", "createdAt", "updatedAt")
    VALUES (${id}, ${title}, ${slug}, ${excerpt}, ${coverImage}, ${contentHtml}, ${"PUBLISHED"}, ${now}, ${now}, ${now})
  `;

  const [titleEn, titleFr, excerptEn, excerptFr, contentEn, contentFr] = await Promise.all([
    translateText(title, "en"),
    translateText(title, "fr"),
    translateText(excerpt ?? "", "en"),
    translateText(excerpt ?? "", "fr"),
    translateText(contentHtml, "en"),
    translateText(contentHtml, "fr")
  ]);

  await prisma.$executeRaw`
    INSERT INTO "BlogPostTranslation" ("id", "blogPostId", "locale", "title", "excerpt", "contentHtml", "status", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${id}, ${"en"}, ${titleEn}, ${excerptEn || null}, ${contentEn}, ${"COMPLETED"}, ${now}, ${now})
    ON CONFLICT ("blogPostId", "locale")
    DO UPDATE SET "title" = EXCLUDED."title",
                  "excerpt" = EXCLUDED."excerpt",
                  "contentHtml" = EXCLUDED."contentHtml",
                  "status" = EXCLUDED."status",
                  "updatedAt" = EXCLUDED."updatedAt"
  `;

  await prisma.$executeRaw`
    INSERT INTO "BlogPostTranslation" ("id", "blogPostId", "locale", "title", "excerpt", "contentHtml", "status", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${id}, ${"fr"}, ${titleFr}, ${excerptFr || null}, ${contentFr}, ${"COMPLETED"}, ${now}, ${now})
    ON CONFLICT ("blogPostId", "locale")
    DO UPDATE SET "title" = EXCLUDED."title",
                  "excerpt" = EXCLUDED."excerpt",
                  "contentHtml" = EXCLUDED."contentHtml",
                  "status" = EXCLUDED."status",
                  "updatedAt" = EXCLUDED."updatedAt"
  `;

  console.log("Blog creado:", slug);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
