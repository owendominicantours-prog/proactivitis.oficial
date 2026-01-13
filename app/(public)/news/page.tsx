import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Noticias y Blog | Proactivitis",
  description: "Actualizaciones, consejos y novedades de Proactivitis."
};

export default async function NewsPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Blog</p>
          <h1 className="text-4xl font-semibold text-slate-900">Noticias y guias</h1>
          <p className="text-sm text-slate-600">
            Historias, recomendaciones y actualizaciones del equipo Proactivitis.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Todavia no hay publicaciones.
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-48 w-full bg-slate-100">
                  <Image
                    src={post.coverImage ?? "/fototours/fotosimple.jpg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-ES") : "Proactivitis"}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">{post.title}</h2>
                  <p className="text-sm text-slate-600">{post.excerpt ?? "Actualizacion Proactivitis."}</p>
                  <Link
                    href={`/news/${post.slug}`}
                    className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:bg-slate-50"
                  >
                    Leer articulo
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
