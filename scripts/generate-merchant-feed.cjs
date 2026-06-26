const { mkdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://proactivitis.com").replace(
  /\/+$/,
  ""
);
const BRAND = process.env.GOOGLE_MERCHANT_BRAND || process.env.NEXT_PUBLIC_BRAND_NAME || "Proactivitis";
const CURRENCY = process.env.GOOGLE_MERCHANT_CURRENCY || "USD";
const GOOGLE_PRODUCT_CATEGORY = process.env.GOOGLE_MERCHANT_PRODUCT_CATEGORY || "";

const textReplacements = [
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Ã", "Á"],
  ["Ã‰", "É"],
  ["Ã", "Í"],
  ["Ã“", "Ó"],
  ["Ãš", "Ú"],
  ["Ã‘", "Ñ"],
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  ["Â·", "-"]
];

function cleanText(value, maxLength) {
  if (!value) return "";
  const withoutTags = String(value).replace(/<[^>]*>/g, " ");
  const fixed = textReplacements.reduce((text, [from, to]) => text.replaceAll(from, to), withoutTags);
  const normalized = fixed.replace(/\s+/g, " ").trim();
  return maxLength && normalized.length > maxLength ? normalized.slice(0, maxLength - 1).trim() : normalized;
}

function parseGallery(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string" && item.trim());
    }
  } catch {
    // Plain comma-separated fallback below.
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function absoluteUrl(value) {
  if (!value) return `${SITE_URL}/fototours/fotosimple.jpg`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function feedCell(value) {
  return cleanText(value)
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, " ")
    .trim();
}

function price(value) {
  const amount = Number(value);
  return `${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"} ${CURRENCY}`;
}

async function main() {
  const tours = await prisma.tour.findMany({
    where: {
      status: "published",
      price: {
        gt: 0
      }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      productId: true,
      title: true,
      slug: true,
      price: true,
      description: true,
      subtitle: true,
      shortDescription: true,
      category: true,
      location: true,
      heroImage: true,
      gallery: true,
      SupplierProfile: {
        select: {
          company: true
        }
      }
    }
  });

  const headers = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "brand",
    "product_type",
    "condition",
    "identifier_exists",
    "custom_label_0",
    "custom_label_1",
    "custom_label_2",
    "google_product_category"
  ];

  const rows = tours.map((tour) => {
    const gallery = parseGallery(tour.gallery);
    const productType = cleanText(tour.category || "Tours & Activities", 750);
    const description = cleanText(tour.shortDescription || tour.subtitle || tour.description, 5000);

    return [
      tour.productId || tour.id,
      cleanText(tour.title, 150),
      description,
      absoluteUrl(`/tours/${tour.slug}`),
      absoluteUrl(tour.heroImage || gallery[0]),
      "in stock",
      price(tour.price),
      BRAND,
      `Tours & Activities > ${productType}`,
      "new",
      "no",
      "tour",
      cleanText(tour.location || "Dominican Republic", 100),
      productType,
      GOOGLE_PRODUCT_CATEGORY
    ].map(feedCell);
  });

  const outputDir = path.join(process.cwd(), "public", "merchant-center");
  const outputPath = path.join(outputDir, "products.tsv");
  const rootCopyPath = path.join(process.cwd(), "merchant_center_feed.tsv");
  const content = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, `${content}\n`, "utf8");
  writeFileSync(rootCopyPath, `${content}\n`, "utf8");

  console.log(`Generated ${rows.length} products`);
  console.log(outputPath);
  console.log(rootCopyPath);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
