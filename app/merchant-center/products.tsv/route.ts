import { NextResponse } from "next/server";

import { getMerchantProductSummaries } from "@/lib/merchantCenter";

export const dynamic = "force-dynamic";

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

const cleanCell = (value: unknown) =>
  String(value ?? "")
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function GET() {
  const products = await getMerchantProductSummaries({ limit: 200 });
  const rows = products
    .filter((product) => product.eligible)
    .map((product) => {
      const attributes = product.input.productAttributes;
      return [
        product.offerId,
        attributes.title,
        attributes.description,
        attributes.link,
        attributes.imageLink,
        "in stock",
        `${product.price.toFixed(2)} ${product.currencyCode}`,
        attributes.brand,
        attributes.productTypes[0] ?? "Tours & Activities",
        "new",
        "no",
        attributes.customLabel0 ?? "tour",
        attributes.customLabel1 ?? product.location,
        attributes.customLabel2 ?? product.category,
        attributes.googleProductCategory ?? ""
      ].map(cleanCell);
    });

  const content = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

  return new NextResponse(`${content}\n`, {
    headers: {
      "content-type": "text/tab-separated-values; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
