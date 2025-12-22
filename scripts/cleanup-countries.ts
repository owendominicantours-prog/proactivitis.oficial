import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const normalizeCode = (value?: string) => (value ? value.trim().toUpperCase() : "");
const normalizeSlug = (value: string) => value.trim().toLowerCase();

const makeCode = (base: string, used: Set<string>) => {
  let candidate = base.slice(0, 2).toUpperCase();
  let suffix = 1;
  while (used.has(candidate) && suffix < 100) {
    const padded = `${suffix}`.padStart(2, "0");
    candidate = `${base.slice(0, 2).toUpperCase()}${padded}`;
    suffix++;
  }
  return candidate;
};

async function main() {
  const countries = await prisma.country.findMany({ orderBy: { name: "asc" } });
  const codeGroups = new Map<string, string[]>();
  const usedCodes = new Set<string>();

  for (const country of countries) {
    const code = normalizeCode(country.code);
    if (!code) continue;
    if (!codeGroups.has(code)) {
      codeGroups.set(code, []);
    }
    codeGroups.get(code)!.push(country.id);
    usedCodes.add(code);
  }

  for (const country of countries) {
    const normalizedSlug = normalizeSlug(country.slug);
    const currentCode = normalizeCode(country.code);
    const codeGroup = currentCode ? codeGroups.get(currentCode) ?? [] : [];
    const needsNewCode = !currentCode || (codeGroup.length > 1 && codeGroup[0] !== country.id);
    if (needsNewCode) {
      const desiredBase = normalizedSlug.replace(/[^a-z]/g, "");
      const candidateBase = desiredBase.length >= 2 ? desiredBase : normalizedSlug;
      const newCode = makeCode(candidateBase, usedCodes);
      await prisma.country.update({
        where: { id: country.id },
        data: { code: newCode }
      });
      usedCodes.add(newCode);
    }
  }

  await Promise.all([
    prisma.country.upsert({
      where: { slug: "dominican-republic" },
      update: { code: "RD", name: "República Dominicana" },
      create: {
        name: "República Dominicana",
        slug: "dominican-republic",
        code: "RD"
      }
    }),
    prisma.country.upsert({
      where: { slug: "united-states" },
      update: { code: "US", name: "United States" },
      create: {
        name: "United States",
        slug: "united-states",
        code: "US"
      }
    })
  ]);
}

main()
  .catch((error) => {
    console.error("Cleanup failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
