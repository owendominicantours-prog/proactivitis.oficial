"use server";

import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const ALLOWED_ROLES = new Set(["ADMIN", "SUPPLIER"]);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!session.user.role || !ALLOWED_ROLES.has(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "No form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 415 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 500 });
  }

  try {
    const optimized = await sharp(await file.arrayBuffer())
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `tours/${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9.-]/g, "")}.webp`;
    const { url } = await put(filename, optimized, {
      access: "public",
      addRandomSuffix: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "image/webp"
      }
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("image upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
