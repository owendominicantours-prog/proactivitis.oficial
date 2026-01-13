"use server";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, updatedAt: true }
  });

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Blog</p>
          <h1 className="text-3xl font-semibold text-slate-900">Panel de noticias</h1>
          <p className="text-sm text-slate-500">Crea, edita y aprueba contenido antes de publicarlo.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
        >
          Nuevo blog
        </Link>
      </section>

      <section className="grid gap-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Todavia no hay posts creados.
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{post.status}</p>
                  <h2 className="text-xl font-semibold text-slate-900">{post.title}</h2>
                  <p className="text-xs text-slate-500">/{post.slug}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-slate-400">
                    {new Date(post.updatedAt).toLocaleString("es-ES")}
                  </span>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
