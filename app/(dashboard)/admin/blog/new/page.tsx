"use server";

import { prisma } from "@/lib/prisma";
import BlogEditorForm from "@/components/admin/blog/BlogEditorForm";
import { createBlogPostAction } from "@/app/(dashboard)/admin/blog/actions";

export default async function AdminBlogNewPage() {
  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" }
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Nuevo blog</p>
        <h1 className="text-3xl font-semibold text-slate-900">Crear entrada</h1>
        <p className="text-sm text-slate-500">Editor completo con toolbar tipo Word.</p>
      </header>

      <BlogEditorForm action={createBlogPostAction} tours={tours} />
    </div>
  );
}
