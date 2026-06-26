import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/adminAccess";
import {
  getMerchantConfigStatus,
  getMerchantProductSummaries,
  syncMerchantProducts
} from "@/lib/merchantCenter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const parseBody = async (request: NextRequest) => {
  try {
    return (await request.json()) as {
      productIds?: unknown;
      mode?: unknown;
    };
  } catch {
    return {};
  }
};

const parseProductIds = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseBody(request);
  const productIds = parseProductIds(body.productIds);
  const mode = body.mode === "sync" ? "sync" : "preview";
  const products = await getMerchantProductSummaries({
    productIds: productIds.length ? productIds : undefined,
    limit: productIds.length ? productIds.length : 120
  });
  const eligible = products.filter((product) => product.eligible);
  const skipped = products.filter((product) => !product.eligible);
  const config = getMerchantConfigStatus();

  if (mode === "preview") {
    return NextResponse.json({
      mode,
      config,
      products: eligible,
      skipped,
      total: products.length,
      eligible: eligible.length
    });
  }

  if (!eligible.length) {
    return NextResponse.json(
      {
        error: "No hay productos elegibles para enviar.",
        skipped
      },
      { status: 400 }
    );
  }

  if (!config.ready) {
    return NextResponse.json(
      {
        error: "Faltan variables de entorno para Merchant API.",
        missing: config.missing,
        skipped
      },
      { status: 400 }
    );
  }

  const results = await syncMerchantProducts(eligible);
  const synced = results.filter((result) => result.status === "synced").length;
  const failed = results.filter((result) => result.status === "failed").length;

  return NextResponse.json({
    mode,
    synced,
    failed,
    skipped,
    results
  });
}
