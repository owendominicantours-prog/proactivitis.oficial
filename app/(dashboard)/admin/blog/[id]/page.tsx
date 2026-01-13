"use server";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogEditorForm from "@/components/admin/blog/BlogEditorForm";
import {
  updateBlogPostAction,
  deleteBlogPostAction,
  approveBlogCommentAction,
  rejectBlogCommentAction
} from "@/app/(dashboard)/admin/blog/actions";

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      tours: { select: { tourId: true } },
      comments: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!post) notFound();

  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" }
  });

  const pendingComments = post.comments.filter((comment) => comment.status === "PENDING");

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Editar blog</p>
          <h1 className="text-3xl font-semibold text-slate-900">{post.title}</h1>
          <p className="text-xs text-slate-500">/{post.slug}</p>
        </div>
        <form action={deleteBlogPostAction}>
          <input type="hidden" name="id" value={post.id} />
          <button
            type="submit"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-700"
          >
            Eliminar
          </button>
        </form>
      </header>

      <BlogEditorForm
        action={updateBlogPostAction}
        tours={tours}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? undefined,
          coverImage: post.coverImage ?? undefined,
          contentHtml: post.contentHtml,
          status: post.status,
          tourIds: post.tours.map((tour) => tour.tourId)
        }}
      />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vista previa</p>
          <h2 className="text-2xl font-semibold text-slate-900">{post.title}</h2>
          <p className="text-sm text-slate-500">{post.excerpt ?? ""}</p>
        </div>
        <div className="prose max-w-none prose-slate">
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Comentarios pendientes</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {pendingComments.length} por aprobar
          </h2>
        </div>

        {pendingComments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No hay comentarios pendientes.
          </div>
        ) : (
          pendingComments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{comment.name}</p>
                  <p className="text-xs text-slate-500">{comment.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={approveBlogCommentAction}>
                    <input type="hidden" name="id" value={comment.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                    >
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectBlogCommentAction}>
                    <input type="hidden" name="id" value={comment.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
