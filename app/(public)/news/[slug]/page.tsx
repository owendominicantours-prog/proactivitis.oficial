import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogCommentForm from "@/components/blog/BlogCommentForm";
import { TourCard } from "@/components/public/TourCard";

const BASE_URL = "https://proactivitis.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) {
    return { title: "Blog | Proactivitis" };
  }
  return {
    title: post.title,
    description: post.excerpt ?? post.title,
    alternates: { canonical: `${BASE_URL}/news/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? post.title,
      url: `${BASE_URL}/news/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined
    }
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      tours: {
        select: {
          tour: {
            select: {
              id: true,
              slug: true,
              title: true,
              price: true,
              heroImage: true,
              location: true
            }
          }
        }
      },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const shareUrl = `${BASE_URL}/news/${post.slug}`;
  const relatedTours = post.tours.map((entry) => entry.tour);

  return (
    <div className="min-h-screen bg-slate-50">
      <article className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-ES") : "Proactivitis"}
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">{post.title}</h1>
          <p className="text-sm text-slate-600">{post.excerpt ?? ""}</p>
          <BlogShareButtons url={shareUrl} title={post.title} />
        </header>

        <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-slate-100">
          <Image
            src={post.coverImage ?? "/fototours/fotosimple.jpg"}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
          />
        </div>

        <section className="prose max-w-none prose-slate">
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </section>

        {relatedTours.length ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Tours recomendados</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {relatedTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  slug={tour.slug}
                  title={tour.title}
                  location={tour.location}
                  price={tour.price}
                  image={tour.heroImage ?? "/fototours/fotosimple.jpg"}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Comentarios</h2>
          <BlogCommentForm blogPostId={post.id} />
          <div className="space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-sm text-slate-500">Aun no hay comentarios aprobados.</p>
            ) : (
              post.comments.map((comment) => (
                <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{comment.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                  </p>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
