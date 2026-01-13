"use server";

import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { slugifyBlog } from "@/lib/blog";
import { translateBlogPostAllLocales } from "@/lib/blogTranslationService";

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("No autorizado.");
  }
  return session.user;
};

const buildSlug = async (value: string) => {
  const base = slugifyBlog(value) || `blog-${randomUUID().slice(0, 8)}`;
  const existing = await prisma.blogPost.findUnique({ where: { slug: base } });
  if (!existing) return base;
  return `${base}-${randomUUID().slice(0, 4)}`;
};

const parseTours = (formData: FormData) => {
  const tourIds = formData.getAll("tourIds").map((id) => String(id)).filter(Boolean);
  return Array.from(new Set(tourIds));
};

export async function createBlogPostAction(formData: FormData) {
  const user = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const contentHtml = String(formData.get("contentHtml") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT").toUpperCase();

  if (!title || !contentHtml) {
    throw new Error("Titulo y contenido son obligatorios.");
  }

  const slug = slugInput ? slugifyBlog(slugInput) : await buildSlug(title);
  const tourIds = parseTours(formData);

  const created = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      contentHtml,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: user.id ?? null,
      tours: {
        create: tourIds.map((tourId) => ({ tourId }))
      }
    }
  });

  await translateBlogPostAllLocales(created.id);
  redirect(`/admin/blog/${created.id}`);
}

export async function updateBlogPostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const contentHtml = String(formData.get("contentHtml") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT").toUpperCase();

  if (!id || !title || !contentHtml) {
    throw new Error("Id, titulo y contenido son obligatorios.");
  }

  const slug = slugInput ? slugifyBlog(slugInput) : await buildSlug(title);
  const tourIds = parseTours(formData);

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      contentHtml,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      tours: {
        deleteMany: {},
        create: tourIds.map((tourId) => ({ tourId }))
      }
    }
  });

  await translateBlogPostAllLocales(id);
  redirect(`/admin/blog/${id}`);
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Id requerido.");
  await prisma.blogPost.delete({ where: { id } });
  redirect("/admin/blog");
}

export async function approveBlogCommentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Id requerido.");
  await prisma.blogComment.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() }
  });
}

export async function rejectBlogCommentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Id requerido.");
  await prisma.blogComment.update({
    where: { id },
    data: { status: "REJECTED" }
  });
}
