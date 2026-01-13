"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { containsLinks } from "@/lib/blog";

type CommentPayload = {
  blogPostId?: string;
  name?: string;
  email?: string;
  body?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as CommentPayload;
  const blogPostId = String(payload.blogPostId ?? "").trim();
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const body = String(payload.body ?? "").trim();

  if (!blogPostId || !name || !email || !body) {
    return NextResponse.json({ error: "Completa todos los campos." }, { status: 400 });
  }

  if (containsLinks(body)) {
    return NextResponse.json({ error: "No permitimos links en los comentarios." }, { status: 400 });
  }

  await prisma.blogComment.create({
    data: {
      blogPostId,
      name,
      email,
      body,
      status: "PENDING"
    }
  });

  return NextResponse.json({ ok: true });
}
